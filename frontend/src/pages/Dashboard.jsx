import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconAlertTriangle, IconClock, IconFlame, IconPhoneCall, IconTarget, IconUsers } from "@tabler/icons-react";
import { api } from "../api";
import { useProprietarioAtual } from "../hooks/useProprietarioAtual";

export default function Dashboard() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const { proprietarioNome, visualizandoComoId } = useProprietarioAtual();

  useEffect(() => {
    api.dashboard(visualizandoComoId).then(setDados).catch((e) => setErro(e.message));
  }, [visualizandoComoId]);

  if (erro) return <p className="erro">{erro}</p>;
  if (!dados) return <p>Carregando...</p>;

  // Cada card leva pra tela e filtro correspondente - clicar mostra
  // exatamente os clientes/leads daquele numero, em vez de so informar.
  const cartoes = [
    { titulo: "Clientes ativos", valor: dados.totalClientesAtivos, to: "/clientes", dica: "Ver todos", Icone: IconUsers },
    {
      titulo: "Renovações próximas (90/60/30 dias)",
      valor: dados.renovacoesProximas,
      to: "/clientes?filtro=proximas",
      dica: "Ver quais",
      classe: "cartao-destaque",
      Icone: IconClock,
    },
    {
      titulo: "Renovações atrasadas",
      valor: dados.renovacoesAtrasadas,
      to: "/clientes?filtro=atrasadas",
      dica: "Ver quais",
      classe: "cartao-atrasada",
      Icone: IconAlertTriangle,
    },
    { titulo: "Leads parados", valor: dados.leadsParados, to: "/leads", dica: "Ver todos", Icone: IconTarget },
    {
      titulo: "Leads quentes",
      valor: dados.leadsQuentes,
      to: "/leads?filtro=quente",
      dica: "Ver quais",
      classe: "cartao-atrasada",
      Icone: IconFlame,
    },
    {
      titulo: "Contatos realizados",
      valor: dados.contatosRealizados,
      to: "/atividades",
      dica: "Ver histórico",
      Icone: IconPhoneCall,
    },
  ];

  return (
    <div>
      <div className="cabecalho-pagina">
        <div>
          <h1>Olá, {proprietarioNome?.split(" ")[0]}</h1>
          <p>
            {visualizandoComoId === "todos"
              ? "Resumo da carteira de todos os proprietários. Clique em qualquer número pra ver a lista."
              : "Aqui está o resumo da carteira hoje. Clique em qualquer número pra ver a lista."}
          </p>
        </div>
      </div>
      <div className="grade-cartoes">
        {cartoes.map((c) => (
          <Link className={`cartao ${c.classe || ""}`} to={c.to} key={c.titulo}>
            <c.Icone className="cartao-icone" size={22} stroke={1.75} />
            <span className="cartao-valor">{c.valor}</span>
            <span className="cartao-titulo">{c.titulo}</span>
            <span className="cartao-dica">{c.dica} →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
