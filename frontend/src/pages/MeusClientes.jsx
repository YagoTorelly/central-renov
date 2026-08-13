import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useProprietarioAtual } from "../hooks/useProprietarioAtual";
import { ROTULO_ALERTA_RENOVACAO } from "../data/rotulos";
import { formatarDataBR } from "../utils/formatarData";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";

const POR_PAGINA = 25;

const FILTROS = [
  { chave: "todos", rotulo: "Todos" },
  { chave: "proximas", rotulo: "Renovação próxima" },
  { chave: "atrasadas", rotulo: "Atrasadas" },
];

const OPCOES_MESES = [1, 2, 3, 6, 12];

function normalizarBusca(texto) {
  return texto.trim().toLowerCase();
}

export default function MeusClientes() {
  const [clientes, setClientes] = useState([]);
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
      setMensagem(`Renovação de ${clienteEmEdicao.nome} adiada em ${meses} mês(es).`);
      fecharModal();
      carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  const filtrados = useMemo(() => {
    let lista = clientes;
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
          <span className="icone">🗂️</span>
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
                    <td>{c.nome}</td>
                    {verTodos && <td>{c.proprietarioNome || "-"}</td>}
                    <td>{c.tipo === "empresa" ? "Empresa" : "Pessoa"}</td>
                    <td>{c.produto}</td>
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
                          🔔 adiada
                        </span>
                      )}
                    </td>
                    <td>{c.telefone ? "WhatsApp" : c.email ? "E-mail" : "-"}</td>
                    <td>
                      <button className="botao-icone" onClick={() => abrirModal(c)}>
                        Adiar renovação
                      </button>
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
          quantos meses o vendedor deve ser lembrado de novo?
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
