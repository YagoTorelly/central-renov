const { atividadeRepository } = require("../data/repositories");

async function registrarAtividade({ negocioId, proprietarioId, tipo, resultado }) {
  if (!negocioId || !proprietarioId || !tipo) {
    throw new Error("negocioId, proprietarioId e tipo sao obrigatorios");
  }
  return atividadeRepository.criar({ negocioId, proprietarioId, tipo, resultado });
}

async function listarAtividadesPorProprietario(proprietarioId) {
  return atividadeRepository.listarPorProprietario(proprietarioId);
}

module.exports = { registrarAtividade, listarAtividadesPorProprietario };
