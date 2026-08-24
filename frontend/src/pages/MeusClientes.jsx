import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  IconBell,
  IconBrandWhatsapp,
  IconExternalLink,
  IconFilePlus,
  IconFolderOff,
  IconMail,
} from "@tabler/icons-react";
import { api } from "../api";
import { useProprietarioAtual } from "../hooks/useProprietarioAtual";
import { ROTULO_ALERTA_RENOVACAO } from "../data/rotulos";
import { formatarDataBR } from "../utils/formatarData";
import { formatarMoeda } from "../utils/formatarMoeda";
import { dividirContatos, linkEmailWebmail, linkWhatsApp } from "../utils/linkContato";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";

const POR_PAGINA = 25;

const FILTROS = [
  { chave: "todos", rotulo: "Todos" },
  { chave: "proximas", rotulo: "Renovação próxima" },
  { chave: "atrasadas", rotulo: "Atrasadas" },
];

const OPCOES_MESES = [1, 2, 3, 6, 12];
// Cliente que nao quer fazer nenhuma alteracao no contrato agora e nao deu
// prazo: some com a data e o alerta ate alguem adiar de novo.
const INDETERMINADO = "indeterminado";

function normalizarBusca(texto) {
  return texto.trim().toLowerCase();
}

// Um cliente pode ter mais de um telefone/e-mail no mesmo campo (ex:
// "(11) 3062-2768/ (35) 99945-7568") e pode ter telefone E e-mail ao
// mesmo tempo - mostra um botao por contato, todos juntos, em vez de so
// o primeiro que existir. Decisao confirmada em 2026-08-14.
function ContatosCliente({ telefone, email }) {
  const telefones = dividirContatos(telefone);
  const emails = dividirContatos(email);

  if (telefones.length === 0 && emails.length === 0) return "-";

  return (
    <div className="lista-contatos">
      {telefones.map((tel, indice) => (
        <a
          key={`tel-${indice}`}
          className="botao-icone botao-whatsapp"
          href={linkWhatsApp(tel)}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir conversa no WhatsApp"
        >
          <IconBrandWhatsapp size={16} /> {tel}
        </a>
      ))}
      {emails.map((end, indice) => (
        <a
          key={`email-${indice}`}
          className="botao-icone"
          href={linkEmailWebmail(end)}
          target="_blank"
          rel="noopener noreferrer"
          title="Enviar e-mail pelo webmail"
        >
          <IconMail size={16} /> {end}
        </a>
      ))}
    </div>
  );
}

export default function MeusClientes() {
  const [clientes, setClientes] = useState(null);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const { proprietarioId, visualizandoComoId } = useProprietarioAtual();
  const verTodos = visualizandoComoId === "todos";

  const [clienteEmEdicao, setClienteEmEdicao] = useState(null);
  const [meses, setMeses] = useState(3);
  const [motivo, setMotivo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  const filtro = searchParams.get("filtro") || "todos";

  useEffect(() => {
    // reseta pra null (nao []) ao trocar de proprietario - senao a lista
    // antiga (de outra pessoa) fica visivel por um instante junto com o
    // "0 encontrados", em vez de mostrar que esta carregando de novo.
    setClientes(null);
    carregar();
  }, [visualizandoComoId]);

  useEffect(() => {
    setPagina(1);
  }, [filtro, busca]);

  function carregar() {
    api.meusClientes(visualizandoComoId).then(setClientes).catch((e) => setErro(e.message));
  }

  function abrirModal(cliente) {
    setClienteEmEdicao(cliente);
    setMeses(3);
    setMotivo("");
  }

  function fecharModal() {
    setClienteEmEdicao(null);
  }

  async function confirmarAdiamento() {
    setSalvando(true);
    try {
      // usa o proprietario LOGADO (nao o "visualizando como"), pra registrar
      // quem de fato tomou a acao, mesmo quando o admin esta olhando "todos".
      await api.agendarLembrete({
        negocioId: clienteEmEdicao.negocioId,
        proprietarioId,
        meses,
        motivo,
      });
      setMensagem(
        meses === INDETERMINADO
          ? `Renovação de ${clienteEmEdicao.nome} marcada como indeterminada.`
          : `Renovação de ${clienteEmEdicao.nome} adiada em ${meses} mês(es).`
      );
      fecharModal();
      carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  const filtrados = useMemo(() => {
    let lista = clientes || [];
    if (filtro === "proximas") lista = lista.filter((c) => c.alerta && c.alerta !== "atrasada");
    if (filtro === "atrasadas") lista = lista.filter((c) => c.alerta === "atrasada");

    const termo = normalizarBusca(busca);
    if (termo) {
      lista = lista.filter(
        (c) => c.nome.toLowerCase().includes(termo) || (c.documento || "").includes(termo.replace(/\D/g, "") || termo)
      );
    }
    return lista;
  }, [clientes, filtro, busca]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const pagina_ = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((pagina_ - 1) * POR_PAGINA, pagina_ * POR_PAGINA);

  if (erro) return <p className="erro">{erro}</p>;
  if (clientes === null) return <p>Carregando clientes…</p>;

  return (
    <div>
      <div className="cabecalho-pagina">
        <div>
          <h1>Meus Clientes</h1>
          <p>Clientes com pelo menos um contrato ativo com você.</p>
        </div>
      </div>

      {mensagem && <p className="mensagem">{mensagem}</p>}

      <div className="barra-filtros">
        {FILTROS.map((f) => (
          <button
            key={f.chave}
            className={`chip ${filtro === f.chave ? "ativo" : ""}`}
            onClick={() => setSearchParams(f.chave === "todos" ? {} : { filtro: f.chave })}
          >
            {f.rotulo}
          </button>
        ))}
        <input
          className="campo-busca"
          placeholder="Buscar por nome ou CPF/CNPJ..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <p className="contador-resultados">
        {filtrados.length} cliente{filtrados.length === 1 ? "" : "s"} encontrado{filtrados.length === 1 ? "" : "s"}
      </p>

      {filtrados.length === 0 ? (
        <div className="estado-vazio">
          <IconFolderOff className="icone" size={40} stroke={1.5} />
          Nenhum cliente encontrado com esse filtro.
        </div>
      ) : (
        <>
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  {verTodos && <th>Proprietário</th>}
                  <th>Tipo</th>
                  <th>Produto</th>
                  <th>Valor</th>
                  <th>Início</th>
                  <th>Renovação</th>
                  <th>Alerta</th>
                  <th>Contato</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((c) => (
                  <tr key={c.negocioId}>
                    <td className="celula-truncada" title={c.nome}>
                      {c.nome}
                    </td>
                    {verTodos && <td>{c.proprietarioNome || "-"}</td>}
                    <td>{c.tipo === "empresa" ? "Empresa" : "Pessoa"}</td>
                    <td>{c.produto}</td>
                    <td>{formatarMoeda(c.valor, c.moeda)}</td>
                    <td>{formatarDataBR(c.dataInicio)}</td>
                    <td>{formatarDataBR(c.dataRenovacao)}</td>
                    <td>
                      {c.alerta ? (
                        <Badge tipo={c.alerta}>{ROTULO_ALERTA_RENOVACAO[c.alerta]}</Badge>
                      ) : (
                        "-"
                      )}
                      {c.ajustadaManualmente && (
                        <span className="badge-manual" title={c.lembreteMotivo || "Renovação adiada manualmente"}>
                          <IconBell size={13} /> {c.renovacaoIndeterminada ? "indeterminada" : "adiada"}
                        </span>
                      )}
                    </td>
                    <td>
                      <ContatosCliente telefone={c.telefone} email={c.email} />
                    </td>
                    <td>
                      <div className="acoes">
                        <button className="botao-icone" onClick={() => abrirModal(c)} title="Adiar renovação">
                          <IconBell size={14} /> Adiar
                        </button>
                        {c.linkNovoNegocio && (
                          <a
                            className="botao-icone"
                            href={c.linkNovoNegocio}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Abrir novo negócio no Pipedrive já com o cliente preenchido"
                          >
                            <IconFilePlus size={14} /> Renovar
                          </a>
                        )}
                        {c.linkPipedrive && (
                          <a
                            className="botao-icone"
                            href={c.linkPipedrive}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver no Pipedrive"
                          >
                            <IconExternalLink size={14} /> Pipedrive
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPaginas > 1 && (
            <div className="paginacao">
              <button disabled={pagina_ === 1} onClick={() => setPagina(pagina_ - 1)}>
                Anterior
              </button>
              <span>
                Página {pagina_} de {totalPaginas}
              </span>
              <button disabled={pagina_ === totalPaginas} onClick={() => setPagina(pagina_ + 1)}>
                Próxima
              </button>
            </div>
          )}
        </>
      )}

      <Modal titulo="Adiar renovação" aberto={Boolean(clienteEmEdicao)} onFechar={fecharModal}>
        <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--cor-texto-suave)" }}>
          Cliente <strong>{clienteEmEdicao?.nome}</strong> confirmou que vai continuar no plano atual. Daqui a
          quantos meses o vendedor deve ser lembrado de novo? Use{" "}
          <strong>Indeterminado</strong> quando o cliente não quiser fazer nenhuma alteração e não der prazo -
          o contrato fica sem data de renovação e sem alerta.
        </p>

        <div className="campo-formulario">
          <label>Adiar por</label>
          <div className="barra-filtros" style={{ marginBottom: 0 }}>
            {OPCOES_MESES.map((m) => (
              <button
                key={m}
                className={`chip ${meses === m ? "ativo" : ""}`}
                onClick={() => setMeses(m)}
                type="button"
              >
                {m} {m === 1 ? "mês" : "meses"}
              </button>
            ))}
            <button
              className={`chip ${meses === INDETERMINADO ? "ativo" : ""}`}
              onClick={() => setMeses(INDETERMINADO)}
              type="button"
              title="Cliente não quer fazer nenhuma alteração e não deu prazo"
            >
              Indeterminado
            </button>
          </div>
        </div>

        <div className="campo-formulario">
          <label>Motivo (opcional)</label>
          <textarea
            rows={3}
            placeholder="Ex: Cliente confirmou que vai continuar no plano atual, sem interesse em trocar por enquanto."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>

        <div className="modal-acoes">
          <button className="botao botao-secundario" onClick={fecharModal}>
            Cancelar
          </button>
          <button className="botao botao-primario" onClick={confirmarAdiamento} disabled={salvando}>
            {salvando ? "Salvando..." : "Confirmar"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
