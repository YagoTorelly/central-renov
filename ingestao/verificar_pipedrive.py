"""Busca negócios/empresas direto da API do Pipedrive - todos os produtos, sem
filtro, das 4 seguradoras (Bradesco, SulAmérica, Amil, Porto Seguro). Base de dados
pra Central de Renovação e Reativação Comercial (ver IDEIA.md).

Uso: python verificar_pipedrive.py --seguradora bradesco
     python verificar_pipedrive.py --seguradora todas
"""
import argparse
import json
import os
import re
import urllib.request
from datetime import datetime
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "output"

# Campos customizados do Pipedrive - confirmados idênticos entre Bradesco e
# SulAmérica (mesmo pipeline/funil comercial usado pras duas seguradoras).
KEY_SEGURADORA_PIPEDRIVE = "ca4874831cbb957f8a14bd125d7592919cd23fb8"
KEY_PRODUTO_PIPEDRIVE = "868625f26041d44067af06a868bc865dab324a7e"
KEY_SITUACAO_PIPEDRIVE = "7bfa55cbca08b71077792ad00000ce98d511eac2"
OPCAO_SITUACAO_CANCELADO = "106"
KEY_CNPJ_ORG_PIPEDRIVE = "1a80c7b84241ad6bac6cf80f18deff3ee69a2ca5"
KEY_CPF_PESSOA_PIPEDRIVE = "b000bb0d79f7b37a76fac0846b26018d48287311"

# Config por seguradora: id da seguradora no Pipedrive. produtos=None = sem filtro,
# todos os produtos dessa seguradora contam (Saúde, Vida, Previdência, Auto etc.).
# Adicionar uma seguradora nova é só acrescentar uma entrada aqui.
SEGURADORAS = {
    "bradesco": {"id": "76", "produtos": None},
    "sulamerica": {"id": "74", "produtos": None},
    "amil": {"id": "77", "produtos": None},
    "portoseguro": {"id": "75", "produtos": None},
}


def normalizar_documento(valor) -> str:
    if valor is None:
        return ""
    return re.sub(r"\D", "", str(valor))


def _pipedrive_get(url: str) -> dict:
    with urllib.request.urlopen(url, timeout=30) as resp:
        return json.loads(resp.read())


def buscar_clientes(seguradora: str, token: str) -> pd.DataFrame:
    config = SEGURADORAS[seguradora]

    deals = []
    start = 0
    while True:
        url = f"https://api.pipedrive.com/v1/deals?start={start}&limit=500&status=all_not_deleted&api_token={token}"
        data = _pipedrive_get(url)
        deals.extend(data.get("data") or [])
        pag = data.get("additional_data", {}).get("pagination", {})
        if not pag.get("more_items_in_collection"):
            break
        start = pag.get("next_start")

    alvo = [
        d for d in deals
        if str(d.get(KEY_SEGURADORA_PIPEDRIVE)) == config["id"]
        and (config["produtos"] is None or d.get(KEY_PRODUTO_PIPEDRIVE) in config["produtos"])
        and d.get("status") == "won"
        and str(d.get(KEY_SITUACAO_PIPEDRIVE)) != OPCAO_SITUACAO_CANCELADO
    ]
    print(f"Negócios {seguradora} (Ganho, não-cancelado) encontrados no Pipedrive: {len(alvo)}")

    org_ids = {d["org_id"]["value"] for d in alvo if isinstance(d.get("org_id"), dict)}
    person_ids = {d["person_id"]["value"] for d in alvo if isinstance(d.get("person_id"), dict) and not d.get("org_id")}

    linhas = []
    for org_id in org_ids:
        try:
            org = _pipedrive_get(f"https://api.pipedrive.com/v1/organizations/{org_id}?api_token={token}")["data"]
        except Exception as error:
            print(f"Falha ao buscar organização {org_id}: {error}")
            continue
        cnpj_limpo = normalizar_documento(org.get(KEY_CNPJ_ORG_PIPEDRIVE))
        if cnpj_limpo:
            linhas.append({"_seguradora": seguradora, "_documento_original": org.get(KEY_CNPJ_ORG_PIPEDRIVE), "_documento_limpo": cnpj_limpo, "_nome_referencia": org.get("name")})

    for person_id in person_ids:
        try:
            pessoa = _pipedrive_get(f"https://api.pipedrive.com/v1/persons/{person_id}?api_token={token}")["data"]
        except Exception as error:
            print(f"Falha ao buscar pessoa {person_id}: {error}")
            continue
        cpf_limpo = normalizar_documento(pessoa.get(KEY_CPF_PESSOA_PIPEDRIVE))
        if cpf_limpo:
            linhas.append({"_seguradora": seguradora, "_documento_original": pessoa.get(KEY_CPF_PESSOA_PIPEDRIVE), "_documento_limpo": cpf_limpo, "_nome_referencia": pessoa.get("name")})

    df = pd.DataFrame(linhas).drop_duplicates(subset="_documento_limpo")
    print(f"Documentos únicos (CNPJ/CPF) para consultar: {len(df)}")
    return df.reset_index(drop=True)


def main():
    parser = argparse.ArgumentParser(description="Busca clientes das seguradoras direto na API do Pipedrive")
    parser.add_argument("--seguradora", required=True, choices=sorted(SEGURADORAS.keys()) + ["todas"])
    args = parser.parse_args()

    load_dotenv(dotenv_path=BASE_DIR / ".env")
    token = os.getenv("PIPEDRIVE_API_TOKEN")
    if not token:
        raise RuntimeError("PIPEDRIVE_API_TOKEN não configurado em .env")

    if args.seguradora == "todas":
        df = pd.concat([buscar_clientes(nome, token) for nome in SEGURADORAS], ignore_index=True)
    else:
        df = buscar_clientes(args.seguradora, token)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    caminho = OUTPUT_DIR / f"verificacao_pipedrive_{args.seguradora}_{datetime.now().strftime('%Y-%m-%d_%H%M%S')}.xlsx"
    df.to_excel(caminho, index=False)
    print(f"Verificação salva em {caminho}")


if __name__ == "__main__":
    main()
