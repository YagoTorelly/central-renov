const Lembrete = require("../models/Lembrete");

const SEM_ID_INTERNO = { _id: 0 };

async function definir({ negocioId, proprietarioId, novaDataRenovacao, motivo }) {
  const lembrete = {
    negocioId,
    proprietarioId,
    novaDataRenovacao,
    motivo: motivo || null,
    criadoEm: new Date().toISOString().slice(0, 10),
  };
  // $set (nao substitui o documento inteiro) - defesa em profundidade: mesmo
  // que negocioId escape da validacao em lembreteService.js, um update
  // parcial nao consegue "vazar" campos de outro documento pro retorno nem
  // apagar campos que nao fazem parte do lembrete.
  await Lembrete.findOneAndUpdate({ negocioId }, { $set: lembrete }, { upsert: true });
  return lembrete;
}

async function buscarPorNegocio(negocioId) {
  return Lembrete.findOne({ negocioId }, SEM_ID_INTERNO).lean();
}

module.exports = { definir, buscarPorNegocio };
