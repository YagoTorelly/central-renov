const { listarMeusClientes } = require("./clienteService");
const { listarLeadsParados } = require("./leadService");
const { atividadeRepository } = require("../data/repositories");

const VISUALIZAR_TODOS = "todos";

// Tela "Dashboard" do MVP: clientes ativos, renovacoes proximas, leads
// parados, contatos realizados, oportunidades recuperadas. proprietarioId
// "todos" e o modo agregado, so pra admin.
async function montarDashboard(proprietarioId) {
  const clientes = await listarMeusClientes(proprietarioId);
  const leads = await listarLeadsParados(proprietarioId);
  const atividades =
    proprietarioId === VISUALIZAR_TODOS
      ? await atividadeRepository.listarTodas()
      : await atividadeRepository.listarPorProprietario(proprietarioId);

  const renovacoesProximas = clientes.filter((c) => c.alerta && c.alerta !== "atrasada");
  const renovacoesAtrasadas = clientes.filter((c) => c.alerta === "atrasada");

  return {
    totalClientesAtivos: clientes.length,
    renovacoesProximas: renovacoesProximas.length,
    renovacoesAtrasadas: renovacoesAtrasadas.length,
    leadsParados: leads.length,
    leadsQuentes: leads.filter((l) => l.classificacao === "quente").length,
    contatosRealizados: atividades.length,
  };
}

module.exports = { montarDashboard };
