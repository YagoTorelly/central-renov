import { useEffect, useMemo, useState } from "react";
import { IconBell, IconBrandWhatsapp, IconMail, IconPhone, IconPhoneOff } from "@tabler/icons-react";
import { api } from "../api";
import { useProprietarioAtual } from "../hooks/useProprietarioAtual";
import { formatarDataBR } from "../utils/formatarData";

const ROTULO_TIPO = {
  whatsapp: "WhatsApp",
  ligacao: "Ligação",
  email: "E-mail",
  lembrete: "Lembrete adiado",
};

const ICONE_TIPO = {
  whatsapp: IconBrandWhatsapp,
  ligacao: IconPhone,
  email: IconMail,
  lembrete: IconBell,
};

const FILTROS = [
  { chave: "todos", rotulo: "Todos" },
  { chave: "whatsapp", rotulo: "WhatsApp" },
  { chave: "ligacao", rotulo: "Ligação" },
  { chave: "email", rotulo: "E-mail" },
  { chave: "lembrete", rotulo: "Lembretes" },
];

function TipoAtividade({ tipo }) {
  const Icone = ICONE_TIPO[tipo];
  return (
    <span className="icone-texto atividade-tipo">
      {Icone && <Icone size={16} />}
      {ROTULO_TIPO[tipo] || tipo}
    </span>
  );
}

export default function Atividades() {
  const [atividades, setAtividades] = useState(null);
  const [erro, setErro] = useState(null);
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const { visualizandoComoId } = useProprietarioAtual();
  const verTodos = visualizandoComoId === "todos";

  useEffect(() => {
    setAtividades(null);
    api.atividades(visualizandoComoId).then(setAtividades).catch((e) => setErro(e.message));
  }, [visualizandoComoId]);

  const filtradas = useMemo(() => {
    let lista = atividades || [];
    if (filtro !== "todos") lista = lista.filter((a) => a.tipo === filtro);
    const termo = busca.trim().toLowerCase();
    if (termo) lista = lista.filter((a) => a.cliente.toLowerCase().includes(termo));
    return lista;
  }, [atividades, filtro, busca]);

  if (erro) return <p className="erro">{erro}</p>;
  if (atividades === null) return <p>Carregando atividades…</p>;

  return (
    <div>
      <div className="cabecalho-pagina">
        <div>
          <h1>Atividades</h1>
          <p>Histórico de contatos e lembretes registrados por você.</p>
        </div>
      </div>

      <div className="barra-filtros">
        {FILTROS.map((f) => (
          <button
            key={f.chave}
            className={`chip ${filtro === f.chave ? "ativo" : ""}`}
            onClick={() => setFiltro(f.chave)}
          >
            {f.rotulo}
          </button>
        ))}
        <input
          className="campo-busca"
          placeholder="Buscar por cliente..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <p className="contador-resultados">
        {filtradas.length} atividade{filtradas.length === 1 ? "" : "s"} encontrada{filtradas.length === 1 ? "" : "s"}
      </p>

      {filtradas.length === 0 ? (
        <div className="estado-vazio">
          <IconPhoneOff className="icone" size={40} stroke={1.5} />
          Nenhuma atividade encontrada com esse filtro.
        </div>
      ) : (
        <div className="tabela-container">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                {verTodos && <th>Proprietário</th>}
                <th>Produto</th>
                <th>Tipo</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((a) => (
                <tr key={a.id}>
                  <td>{formatarDataBR(a.data)}</td>
                  <td>{a.cliente}</td>
                  {verTodos && <td>{a.proprietarioNome || "-"}</td>}
                  <td>{a.produto ? `${a.produto}${a.seguradora ? " · " + a.seguradora : ""}` : "-"}</td>
                  <td>
                    <TipoAtividade tipo={a.tipo} />
                  </td>
                  <td>{a.resultado || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
