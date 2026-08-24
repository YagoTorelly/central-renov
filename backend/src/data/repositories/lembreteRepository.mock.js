// Lembrete de renovacao adiada e dado proprio da Central (registrado pelo
// vendedor apos falar com o cliente), igual atividade - nao vem do
// Pipedrive. Guarda so o lembrete mais recente por negocio: um novo
// lembrete substitui o anterior, nao acumula historico aqui (o historico
// de contato fica no atividadeRepository).
const lembretesPorNegocio = new Map();

async function definir({ negocioId, proprietarioId, novaDataRenovacao, indeterminado, motivo }) {
  const lembrete = {
    negocioId,
    proprietarioId,
    novaDataRenovacao: novaDataRenovacao || null,
    indeterminado: Boolean(indeterminado),
    motivo: motivo || null,
    criadoEm: new Date().toISOString().slice(0, 10),
  };
  lembretesPorNegocio.set(negocioId, lembrete);
  return lembrete;
}

async function buscarPorNegocio(negocioId) {
  return lembretesPorNegocio.get(negocioId) || null;
}

module.exports = { definir, buscarPorNegocio };
