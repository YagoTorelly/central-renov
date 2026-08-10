const { atividadeRepository, negocioRepository, pessoaEmpresaRepository } = require("../data/repositories");

async function registrarAtividade({ negocioId, proprietarioId, tipo, resultado }) {
  if (!negocioId || !proprietarioId || !tipo) {
    throw new Error("negocioId, proprietarioId e tipo sao obrigatorios");
  }
  return atividadeRepository.criar({ negocioId, proprietarioId, tipo, resultado });
}

// Enriquece com nome do cliente/produto pra tela de atividades nao mostrar
// so IDs crus - pensado pra usuario sem familiaridade tecnica conseguir ler.
async function listarAtividadesPorProprietario(proprietarioId) {
  const atividades = await atividadeRepository.listarPorProprietario(proprietarioId);
  const enriquecidas = [];
  for (const atividade of atividades) {
    const negocio = await negocioRepository.buscarPorId(atividade.negocioId);
    const pessoaEmpresa = negocio ? await pessoaEmpresaRepository.buscarPorId(negocio.pessoaEmpresaId) : null;
    enriquecidas.push({
      ...atividade,
      cliente: pessoaEmpresa?.nome || "Cliente nao encontrado",
      produto: negocio?.produto || null,
      seguradora: negocio?.seguradora || null,
    });
  }
  return enriquecidas.sort((a, b) => (a.data < b.data ? 1 : -1));
}

module.exports = { registrarAtividade, listarAtividadesPorProprietario };
