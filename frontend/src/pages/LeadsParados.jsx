import { useEffect, useState } from "react";
import { api } from "../api";
import { useProprietarioAtual } from "../hooks/useProprietarioAtual";
import Badge from "../components/ui/Badge";

export default function LeadsParados() {
  const [leads, setLeads] = useState([]);
  const [erro, setErro] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const { proprietarioId } = useProprietarioAtual();

  useEffect(() => {
    carregar();
  }, [proprietarioId]);

  function carregar() {
    api.leadsParados(proprietarioId).then(setLeads).catch((e) => setErro(e.message));
  }

  async function registrar(negocioId, tipo) {
    await api.registrarAtividade({ negocioId, proprietarioId, tipo, resultado: "contato iniciado" });
    setMensagem(`Atividade "${tipo}" registrada para ${negocioId}.`);
    carregar();
  }

  if (erro) return <p className="erro">{erro}</p>;

  return (
    <div>
      <h1>Leads Parados</h1>
      {mensagem && <p className="mensagem">{mensagem}</p>}
      <div className="lista-leads">
        {leads.map((lead) => (
          <div className={`lead-cartao lead-${lead.classificacao}`} key={lead.negocioId}>
            <div className="lead-cabecalho">
              <strong>{lead.nome}</strong>
              <Badge tipo={lead.classificacao}>{lead.classificacao}</Badge>
            </div>
            <p>
              {lead.produto} - {lead.status} - {lead.diasSemMovimentacao} dias sem movimentacao
            </p>
            {lead.oportunidadeVendaCruzada && (
              <p className="venda-cruzada">{lead.oportunidadeVendaCruzada.mensagem}</p>
            )}
            <p className="motivos">{lead.motivos.join(" | ")}</p>
            <div className="acoes">
              <button disabled={!lead.telefone} onClick={() => registrar(lead.negocioId, "whatsapp")}>
                WhatsApp
              </button>
              <button disabled={!lead.telefone} onClick={() => registrar(lead.negocioId, "ligacao")}>
                Ligar
              </button>
              <button disabled={!lead.email} onClick={() => registrar(lead.negocioId, "email")}>
                E-mail
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
