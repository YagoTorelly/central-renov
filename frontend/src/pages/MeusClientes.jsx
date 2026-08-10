import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useProprietarioAtual } from "../hooks/useProprietarioAtual";
import { ROTULO_ALERTA_RENOVACAO } from "../data/rotulos";
import { formatarDataBR } from "../utils/formatarData";
import Badge from "../components/ui/Badge";

const POR_PAGINA = 25;

const FILTROS = [
  { chave: "todos", rotulo: "Todos" },
  { chave: "proximas", rotulo: "Renovação próxima" },
  { chave: "atrasadas", rotulo: "Atrasadas" },
];

function normalizarBusca(texto) {
  return texto.trim().toLowerCase();
}

export default function MeusClientes() {
  const [clientes, setClientes] = useState([]);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const { proprietarioId } = useProprietarioAtual();

  const filtro = searchParams.get("filtro") || "todos";

  useEffect(() => {
    api.meusClientes(proprietarioId).then(setClientes).catch((e) => setErro(e.message));
  }, [proprietarioId]);

  useEffect(() => {
    setPagina(1);
  }, [filtro, busca]);

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
                  <th>Tipo</th>
                  <th>Produto</th>
                  <th>Início</th>
                  <th>Renovação</th>
                  <th>Alerta</th>
                  <th>Contato</th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((c) => (
                  <tr key={c.negocioId}>
                    <td>{c.nome}</td>
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
                    </td>
                    <td>{c.telefone ? "WhatsApp" : c.email ? "E-mail" : "-"}</td>
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
    </div>
  );
}
