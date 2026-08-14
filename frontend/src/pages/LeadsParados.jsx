import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IconBrandWhatsapp, IconBulb, IconMail, IconPhone, IconTargetOff } from "@tabler/icons-react";
import { api } from "../api";
import { useProprietarioAtual } from "../hooks/useProprietarioAtual";
import { dividirContatos, linkEmailWebmail, linkTelefone, linkWhatsApp } from "../utils/linkContato";
import Badge from "../components/ui/Badge";

const POR_PAGINA = 20;

const FILTROS = [
  { chave: "todos", rotulo: "Todos" },
  { chave: "quente", rotulo: "Quente" },
  { chave: "morno", rotulo: "Morno" },
  { chave: "frio", rotulo: "Frio" },
];

// Se tiver telefone/e-mail, vira link de verdade (abre WhatsApp/discador/
// e-mail) alem de registrar a atividade; sem contato, fica desabilitado.
function BotaoContato({ className, href, Icone, texto, onClick }) {
  if (!href) {
    return (
      <button className={className} disabled>
        <Icone size={16} /> {texto}
      </button>
    );
  }
  // so wa.me e uma pagina web de verdade - abre em nova aba pra nao
  // navegar pra fora do sistema. tel:/mailto: sao protocolo (abre o
  // discador/cliente de e-mail padrao), nao precisa e pode sobrar aba
  // em branco em alguns navegadores.
  const abreNovaAba = href.startsWith("http");
  return (
    <a
      className={className}
      href={href}
      target={abreNovaAba ? "_blank" : undefined}
      rel={abreNovaAba ? "noopener noreferrer" : undefined}
      onClick={onClick}
    >
      <Icone size={16} /> {texto}
    </a>
  );
}

export default function LeadsParados() {
  const [leads, setLeads] = useState([]);
  const [erro, setErro] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const { proprietarioId, visualizandoComoId } = useProprietarioAtual();
  const verTodos = visualizandoComoId === "todos";

  const filtro = searchParams.get("filtro") || "todos";

  useEffect(() => {
    carregar();
  }, [visualizandoComoId]);

  useEffect(() => {
    setPagina(1);
  }, [filtro, busca]);

  function carregar() {
    api.leadsParados(visualizandoComoId).then(setLeads).catch((e) => setErro(e.message));
  }

  async function registrar(negocioId, tipo) {
    // usa o proprietario LOGADO (nao o "visualizando como"), mesma logica
    // do lembrete em Meus Clientes.
    await api.registrarAtividade({ negocioId, proprietarioId, tipo, resultado: "contato iniciado" });
    setMensagem(`Atividade "${tipo}" registrada.`);
    carregar();
  }

  const filtrados = useMemo(() => {
    let lista = leads;
    if (filtro !== "todos") lista = lista.filter((l) => l.classificacao === filtro);
    const termo = busca.trim().toLowerCase();
    if (termo) lista = lista.filter((l) => l.nome.toLowerCase().includes(termo));
    return lista;
  }, [leads, filtro, busca]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const pagina_ = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((pagina_ - 1) * POR_PAGINA, pagina_ * POR_PAGINA);

  if (erro) return <p className="erro">{erro}</p>;

  return (
    <div>
      <div className="cabecalho-pagina">
        <div>
          <h1>Leads Parados</h1>
          <p>Oportunidades que ainda podem virar venda, ordenadas por maior chance de conversão.</p>
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
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <p className="contador-resultados">
        {filtrados.length} lead{filtrados.length === 1 ? "" : "s"} encontrado{filtrados.length === 1 ? "" : "s"}
      </p>

      {mensagem && <p className="mensagem">{mensagem}</p>}

      {filtrados.length === 0 ? (
        <div className="estado-vazio">
          <IconTargetOff className="icone" size={40} stroke={1.5} />
          Nenhum lead parado com esse filtro.
        </div>
      ) : (
        <>
          <div className="lista-leads">
            {visiveis.map((lead) => (
              <div className={`lead-cartao lead-${lead.classificacao}`} key={lead.negocioId}>
                <div className="lead-cabecalho">
                  <strong>{lead.nome}</strong>
                  <Badge tipo={lead.classificacao}>{lead.classificacao}</Badge>
                </div>
                <p className="info-secundaria">
                  {verTodos && lead.proprietarioNome ? `${lead.proprietarioNome} · ` : ""}
                  {lead.produto} · {lead.seguradora} · {lead.status} · {lead.diasSemMovimentacao} dias sem
                  movimentação
                </p>
                {lead.oportunidadeVendaCruzada && (
                  <p className="venda-cruzada">
                    <IconBulb size={16} /> {lead.oportunidadeVendaCruzada.mensagem}
                  </p>
                )}
                <p className="motivos">{lead.motivos.join(" · ")}</p>
                <div className="acoes">
                  <BotaoContato
                    className="botao botao-primario"
                    href={linkWhatsApp(dividirContatos(lead.telefone)[0])}
                    Icone={IconBrandWhatsapp}
                    texto="WhatsApp"
                    onClick={() => registrar(lead.negocioId, "whatsapp")}
                  />
                  <BotaoContato
                    className="botao botao-secundario"
                    href={linkTelefone(dividirContatos(lead.telefone)[0])}
                    Icone={IconPhone}
                    texto="Ligar"
                    onClick={() => registrar(lead.negocioId, "ligacao")}
                  />
                  <BotaoContato
                    className="botao botao-secundario"
                    href={linkEmailWebmail(dividirContatos(lead.email)[0])}
                    Icone={IconMail}
                    texto="E-mail"
                    onClick={() => registrar(lead.negocioId, "email")}
                  />
                </div>
              </div>
            ))}
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
