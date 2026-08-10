import { useEffect, useState } from "react";
import { api } from "../api";
import { useProprietarioAtual } from "../hooks/useProprietarioAtual";

export default function Dashboard() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const { proprietarioId } = useProprietarioAtual();

  useEffect(() => {
    api.dashboard(proprietarioId).then(setDados).catch((e) => setErro(e.message));
  }, [proprietarioId]);

  if (erro) return <p className="erro">{erro}</p>;
  if (!dados) return <p>Carregando...</p>;

  const cartoes = [
    { titulo: "Clientes ativos", valor: dados.totalClientesAtivos },
    { titulo: "Renovacoes proximas (90/60/30 dias)", valor: dados.renovacoesProximas },
    { titulo: "Renovacoes atrasadas", valor: dados.renovacoesAtrasadas },
    { titulo: "Leads parados", valor: dados.leadsParados },
    { titulo: "Leads quentes", valor: dados.leadsQuentes },
    { titulo: "Contatos realizados", valor: dados.contatosRealizados },
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="grade-cartoes">
        {cartoes.map((c) => (
          <div className="cartao" key={c.titulo}>
            <span className="cartao-valor">{c.valor}</span>
            <span className="cartao-titulo">{c.titulo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
