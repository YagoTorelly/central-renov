const {
  atividadeRepository,
  negocioRepository,
  pessoaEmpresaRepository,
  proprietarioRepository,
} = require("../data/repositories");

const VISUALIZAR_TODOS = "todos";

async function registrarAtividade({ negocioId, proprietarioId, tipo, resultado }) {
  if (!negocioId || !proprietarioId || !tipo) {
    throw new Error("negocioId, proprietarioId e tipo sao obrigatorios");
  }
  if (typeof negocioId !== "string" || typeof proprietarioId !== "string") {
    throw new Error("negocioId e proprietarioId precisam ser texto");
  }
  return atividadeRepository.criar({ negocioId, proprietarioId, tipo, resultado });
}

// Enriquece com nome do cliente/produto pra tela de atividades nao mostrar
// so IDs crus - pensado pra usuario sem familiaridade tecnica conseguir ler.
// proprietarioId="todos" e o modo agregado, so pra admin.
async function listarAtividadesPorProprietario(proprietarioId) {
  const verTodos = proprietarioId === VISUALIZAR_TODOS;
  const atividades = verTodos
    ? await atividadeRepository.listarTodas()
    : await atividadeRepository.listarPorProprietario(proprietarioId);
  const enriquecidas = [];
  for (const atividade of atividades) {
    const negocio = await negocioRepository.buscarPorId(atividade.negocioId);
    const pessoaEmpresa = negocio ? await pessoaEmpresaRepository.buscarPorId(negocio.pessoaEmpresaId) : null;
    let proprietarioNome = null;
    if (verTodos) {
      const proprietario = await proprietarioRepository.buscarPorId(atividade.proprietarioId);
      proprietarioNome = proprietario?.nome || null;
    }
    enriquecidas.push({
      ...atividade,
      cliente: pessoaEmpresa?.nome || "Cliente nao encontrado",
      produto: negocio?.produto || null,
      seguradora: negocio?.seguradora || null,
      proprietarioNome,
    });
  }
  return enriquecidas.sort((a, b) => (a.data < b.data ? 1 : -1));
}

module.exports = { registrarAtividade, listarAtividadesPorProprietario };
