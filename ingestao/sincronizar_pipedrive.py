"""Sincronizacao completa com o Pipedrive pra Central de Renovacao e Reativacao
Comercial (ver IDEIA.md). Diferente do verificar_pipedrive.py (que so verifica
CPF/CNPJ), esse aqui monta o dataset completo (proprietarios, pessoas/empresas,
negocios) e envia pro backend, que grava em backend/src/data/cache/.

Uso local (contra o backend rodando em localhost):
    python sincronizar_pipedrive.py --seguradora bradesco --limite 30 --backend-url http://localhost:3001

Uso completo (todas seguradoras, sem limite):
    python sincronizar_pipedrive.py --seguradora todas --backend-url http://localhost:3001
"""
import argparse
import json
import os
import re
import time
import urllib.request
import urllib.error
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

KEY_SEGURADORA = "ca4874831cbb957f8a14bd125d7592919cd23fb8"
KEY_PRODUTO = "868625f26041d44067af06a868bc865dab324a7e"
KEY_SITUACAO = "7bfa55cbca08b71077792ad00000ce98d511eac2"
KEY_DATA_VIGENCIA = "f5362cd4537daa020fdbe2ac21aa6445f3f6dca1"
KEY_TEMPO_CONTRATO = "ace415886efe5183da997389e45f1f80af197376"
KEY_CNPJ_ORG = "1a80c7b84241ad6bac6cf80f18deff3ee69a2ca5"
KEY_CPF_PESSOA = "b000bb0d79f7b37a76fac0846b26018d48287311"

OPCAO_SITUACAO_CANCELADO = "106"

# So usado pro filtro rapido de teste (--seguradora bradesco --limite 20).
# A sincronizacao completa (--seguradora todas) nao filtra mais por
# seguradora - processa QUALQUER negocio das 4 seguradoras conhecidas, das
# outras ~35 seguradoras cadastradas no Pipedrive, e ate os sem seguradora
# preenchida. Decisao confirmada em 2026-08-10: "pegar de fato" a carteira
# inteira, nao so o recorte historico de 4 seguradoras.
SEGURADORAS_CONHECIDAS = {
    "bradesco": "76",
    "sulamerica": "74",
    "amil": "77",
    "portoseguro": "75",
}
ID_SEGURADORA_PORTO_SEGURO = "75"
SEGURADORA_NAO_INFORMADA = "Nao informada"

TEMPO_CONTRATO_MESES = {
    "183": 12,
    "184": 24,
    "197": 30,
    "189": None,
}

STATUS_PIPEDRIVE_PARA_APP = {"won": "ganho", "lost": "perdido", "open": "aberto"}

# Regra de fallback pro tempo de contrato quando o campo esta vazio -
# confirmada em 2026-08-10, vale so pro produto principal da carteira.
PRODUTO_SAUDE_PME = "Saúde PME"


def normalizar_documento(valor) -> str:
    if valor is None:
        return ""
    return re.sub(r"\D", "", str(valor))


def _get(url: str, tentativas=5) -> dict:
    corpo = {}
    for tentativa in range(tentativas):
        try:
            with urllib.request.urlopen(url, timeout=30) as resp:
                corpo = json.loads(resp.read())
            if corpo.get("success", True):
                return corpo
        except urllib.error.HTTPError as erro:
            if erro.code == 429 or erro.code >= 500:
                pass  # rate limit ou erro transitorio do servidor - tenta de novo
            else:
                raise
        except (urllib.error.URLError, TimeoutError, OSError, json.JSONDecodeError):
            # inclui timeout no meio da leitura da resposta (TimeoutError puro
            # nao e subclasse de URLError) e conexao derrubada (OSError) -
            # tudo tratado como falha transitoria, tenta de novo.
            pass
        espera = 2 * (tentativa + 1)
        print(f"  (tentativa {tentativa + 1}/{tentativas} falhou, esperando {espera}s)")
        time.sleep(espera)
    raise RuntimeError(f"Falhou apos {tentativas} tentativas: {url.split('?')[0]}")


def buscar_proprietarios(token: str) -> list:
    dados = _get(f"https://api.pipedrive.com/v1/users?api_token={token}")
    proprietarios = []
    for usuario in dados.get("data") or []:
        if not usuario.get("active_flag"):
            continue
        proprietarios.append(
            {
                "id": str(usuario["id"]),
                "nome": usuario["name"],
                "email": usuario.get("email"),
                "papel": "admin" if usuario.get("is_admin") else "proprietario",
            }
        )
    print(f"Proprietarios ativos: {len(proprietarios)}")
    return proprietarios


def buscar_todos_deals(token: str) -> list:
    deals = []
    start = 0
    while True:
        url = (
            f"https://api.pipedrive.com/v1/deals?start={start}&limit=500"
            f"&status=all_not_deleted&api_token={token}"
        )
        pagina = _get(url)
        deals.extend(pagina.get("data") or [])
        paginacao = pagina.get("additional_data", {}).get("pagination", {})
        if not paginacao.get("more_items_in_collection"):
            break
        start = paginacao.get("next_start")
    return deals


def mapear_negocio(deal: dict, pessoa_empresa_id: str):
    situacao = str(deal.get(KEY_SITUACAO) or "")
    if situacao == OPCAO_SITUACAO_CANCELADO:
        return None

    status_app = STATUS_PIPEDRIVE_PARA_APP.get(deal.get("status"))
    if status_app is None:
        return None

    negocio = {
        "id": f"pd_{deal['id']}",
        "pessoaEmpresaId": pessoa_empresa_id,
        "proprietarioId": str(deal["user_id"]["value"]) if isinstance(deal.get("user_id"), dict) else None,
        "seguradora": deal.get("_seguradora_slug"),
        "produto": deal.get("_produto_label") or "",
        "status": status_app,
    }

    if status_app == "ganho":
        data_vigencia = deal.get(KEY_DATA_VIGENCIA)
        if not data_vigencia:
            # fallback: data em que o negocio foi marcado como Ganho no
            # Pipedrive. Decisao confirmada em 2026-08-10 - nem todo negocio
            # tem a Data de Vigencia/Periodo preenchida.
            won_time = deal.get("won_time")
            data_vigencia = won_time[:10] if won_time else None
        if not data_vigencia:
            return None

        tempo_contrato_raw = deal.get(KEY_TEMPO_CONTRATO)
        if tempo_contrato_raw is None:
            # campo realmente vazio (diferente de "Indeterminado", que e uma
            # escolha explicita do vendedor) - so assume um padrao pro
            # produto principal (Saude PME). Porto Seguro normalmente e
            # 24 meses, as demais seguradoras 12 meses.
            if deal.get("_produto_label") == PRODUTO_SAUDE_PME:
                meses_vigencia = 24 if str(deal.get(KEY_SEGURADORA)) == ID_SEGURADORA_PORTO_SEGURO else 12
            else:
                meses_vigencia = None
        else:
            meses_vigencia = TEMPO_CONTRATO_MESES.get(str(tempo_contrato_raw))

        negocio["dataInicio"] = data_vigencia
        negocio["mesesVigencia"] = meses_vigencia
    else:
        negocio["ultimaMovimentacao"] = (
            deal.get("last_activity_date")
            or (deal.get("update_time") or deal.get("add_time") or "")[:10]
        )

    return negocio


def sincronizar(seguradora_filtro, token: str, limite):
    campos = _get(f"https://api.pipedrive.com/v1/dealFields?api_token={token}")
    campo_produto = next(f for f in campos["data"] if f["key"] == KEY_PRODUTO)
    campo_seguradora = next(f for f in campos["data"] if f["key"] == KEY_SEGURADORA)
    # options[].id vem como int, mas o valor gravado no deal e string - normaliza os dois lados
    produto_id_para_label = {str(o["id"]): o["label"] for o in campo_produto["options"]}
    seguradora_id_para_label = {str(o["id"]): o["label"] for o in campo_seguradora["options"]}

    todos_deals = buscar_todos_deals(token)
    print(f"Negocios no Pipedrive (qualquer situacao/seguradora): {len(todos_deals)}")

    if seguradora_filtro:
        # so pra teste rapido de uma seguradora conhecida (--seguradora bradesco)
        id_alvo = SEGURADORAS_CONHECIDAS[seguradora_filtro]
        todos_deals = [d for d in todos_deals if str(d.get(KEY_SEGURADORA)) == id_alvo]

    if limite:
        todos_deals = todos_deals[:limite]

    for d in todos_deals:
        d["_seguradora_slug"] = seguradora_id_para_label.get(str(d.get(KEY_SEGURADORA)), SEGURADORA_NAO_INFORMADA)
        d["_produto_label"] = produto_id_para_label.get(d.get(KEY_PRODUTO))
    print(f"{len(todos_deals)} negocio(s) considerados para processar")

    org_ids = {d["org_id"]["value"] for d in todos_deals if isinstance(d.get("org_id"), dict)}
    person_ids = {
        d["person_id"]["value"]
        for d in todos_deals
        if isinstance(d.get("person_id"), dict) and not d.get("org_id")
    }

    total_ids = len(org_ids) + len(person_ids)
    print(f"Buscando detalhes de {len(org_ids)} organizacao(oes) + {len(person_ids)} pessoa(s) = {total_ids} chamada(s)...")

    pessoas_empresas = {}
    for indice, org_id in enumerate(org_ids, start=1):
        org = _get(f"https://api.pipedrive.com/v1/organizations/{org_id}?api_token={token}")["data"]
        doc = normalizar_documento(org.get(KEY_CNPJ_ORG))
        if doc:
            chave = f"org:{org_id}"
            pessoas_empresas[chave] = {
                "id": chave,
                "tipo": "empresa",
                "nome": org.get("name"),
                "documento": doc,
                "telefone": (org.get("phone") or [{}])[0].get("value") if org.get("phone") else None,
                "email": (org.get("email") or [{}])[0].get("value") if org.get("email") else None,
            }
        if indice % 100 == 0:
            print(f"  organizacoes: {indice}/{len(org_ids)}")

    for indice, person_id in enumerate(person_ids, start=1):
        pessoa = _get(f"https://api.pipedrive.com/v1/persons/{person_id}?api_token={token}")["data"]
        doc = normalizar_documento(pessoa.get(KEY_CPF_PESSOA))
        if doc:
            chave = f"person:{person_id}"
            pessoas_empresas[chave] = {
                "id": chave,
                "tipo": "pessoa",
                "nome": pessoa.get("name"),
                "documento": doc,
                "telefone": (pessoa.get("phone") or [{}])[0].get("value") if pessoa.get("phone") else None,
                "email": (pessoa.get("email") or [{}])[0].get("value") if pessoa.get("email") else None,
            }
        if indice % 100 == 0:
            print(f"  pessoas: {indice}/{len(person_ids)}")

    negocios = []
    for deal in todos_deals:
        if isinstance(deal.get("org_id"), dict):
            chave = f"org:{deal['org_id']['value']}"
        elif isinstance(deal.get("person_id"), dict):
            chave = f"person:{deal['person_id']['value']}"
        else:
            continue
        if chave not in pessoas_empresas:
            continue
        negocio = mapear_negocio(deal, chave)
        if negocio and negocio["proprietarioId"]:
            negocios.append(negocio)

    proprietarios = buscar_proprietarios(token)

    print(f"\nTotal: {len(proprietarios)} proprietarios, {len(pessoas_empresas)} pessoas/empresas, {len(negocios)} negocios")
    return {
        "proprietarios": proprietarios,
        "pessoasEmpresas": list(pessoas_empresas.values()),
        "negocios": negocios,
    }


def enviar_para_backend(payload: dict, backend_url: str, cron_secret):
    corpo = json.dumps(payload).encode("utf-8")
    headers = {"Content-Type": "application/json"}
    if cron_secret:
        headers["x-cron-secret"] = cron_secret
    req = urllib.request.Request(
        f"{backend_url.rstrip('/')}/api/sync/pipedrive", data=corpo, headers=headers, method="POST"
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        resposta = json.loads(resp.read())
    print("Backend respondeu:", resposta)


def main():
    parser = argparse.ArgumentParser(description="Sincroniza dados reais do Pipedrive pra Central de Renovacao")
    parser.add_argument(
        "--seguradora",
        required=True,
        choices=sorted(SEGURADORAS_CONHECIDAS.keys()) + ["todas"],
        help='"todas" processa TODAS as seguradoras do Pipedrive (nao so as 4 conhecidas); '
        "um nome especifico filtra so aquela seguradora, util pra teste rapido.",
    )
    parser.add_argument("--limite", type=int, help="Limita a quantidade total de negocios (teste rapido)")
    parser.add_argument("--backend-url", help="Ex: http://localhost:3001. Se omitido, so salva um JSON local.")
    args = parser.parse_args()

    load_dotenv(dotenv_path=BASE_DIR / ".env")
    token = os.getenv("PIPEDRIVE_API_TOKEN")
    if not token:
        raise RuntimeError("PIPEDRIVE_API_TOKEN nao configurado em .env")

    seguradora_filtro = None if args.seguradora == "todas" else args.seguradora
    payload = sincronizar(seguradora_filtro, token, args.limite)

    saida = BASE_DIR / "output" / "sincronizacao_pipedrive.json"
    saida.parent.mkdir(parents=True, exist_ok=True)
    saida.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"JSON salvo em {saida}")

    if args.backend_url:
        cron_secret = os.getenv("CRON_SECRET")
        enviar_para_backend(payload, args.backend_url, cron_secret)


if __name__ == "__main__":
    main()
