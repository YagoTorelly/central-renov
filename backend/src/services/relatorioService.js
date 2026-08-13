const { proprietarioRepository, atividadeRepository } = require("../data/repositories");
const { listarMeusClientes } = require("./clienteService");
const { listarLeadsParados } = require("./leadService");

// Reusa exatamente a mesma logica das telas individuais (Dashboard/Meus
// Clientes/Leads) por proprietario, so soma - evita ter duas formulas
// diferentes pro mesmo numero (uma pro proprietario, outra pro admin).
async function montarResumoPorProprietario() {
  const proprietarios = await proprietarioRepository.listar();
  const resumo = [];
  for (const proprietario of proprietarios) {
    const clientes = await listarMeusClientes(proprietario.id);
    const leads = await listarLeadsParados(proprietario.id);
    const atividades = await atividadeRepository.listarPorProprietario(proprietario.id);
    resumo.push({
      proprietarioId: proprietario.id,
      nome: proprietario.nome,
      papel: proprietario.papel,
      clientesAtivos: clientes.length,
      renovacoesProximas: clientes.filter((c) => c.alerta && c.alerta !== "atrasada").length,
      renovacoesAtrasadas: clientes.filter((c) => c.alerta === "atrasada").length,
      leadsParados: leads.length,
      leadsQuentes: leads.filter((l) => l.classificacao === "quente").length,
      contatosRealizados: atividades.length,
    });
  }
  // renovacoes atrasadas primeiro - e o que precisa de atencao mais urgente
  return resumo.sort((a, b) => b.renovacoesAtrasadas - a.renovacoesAtrasadas);
}

async function montarVisaoGeral() {
  const resumo = await montarResumoPorProprietario();
  const visaoGeral = {
    totalProprietarios: resumo.length,
    clientesAtivos: 0,
    renovacoesProximas: 0,
    renovacoesAtrasadas: 0,
    leadsParados: 0,
    leadsQuentes: 0,
    contatosRealizados: 0,
  };
  for (const r of resumo) {
    visaoGeral.clientesAtivos += r.clientesAtivos;
    visaoGeral.renovacoesProximas += r.renovacoesProximas;
    visaoGeral.renovacoesAtrasadas += r.renovacoesAtrasadas;
    visaoGeral.leadsParados += r.leadsParados;
    visaoGeral.leadsQuentes += r.leadsQuentes;
    visaoGeral.contatosRealizados += r.contatosRealizados;
  }
  return visaoGeral;
}

module.exports = { montarResumoPorProprietario, montarVisaoGeral };
