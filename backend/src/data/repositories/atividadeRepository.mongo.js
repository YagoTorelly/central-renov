const { Types } = require("mongoose");
const Atividade = require("../models/Atividade");

const SEM_ID_INTERNO = { _id: 0 };

async function listarPorNegocio(negocioId) {
  return Atividade.find({ negocioId }, SEM_ID_INTERNO).lean();
}

async function listarPorProprietario(proprietarioId) {
  return Atividade.find({ proprietarioId }, SEM_ID_INTERNO).lean();
}

async function listarTodas() {
  return Atividade.find({}, SEM_ID_INTERNO).lean();
}

async function criar({ negocioId, proprietarioId, tipo, resultado }) {
  const atividade = {
    id: `a_${new Types.ObjectId().toString()}`,
    negocioId,
    proprietarioId,
    tipo,
    resultado,
    data: new Date().toISOString().slice(0, 10),
  };
  await Atividade.create(atividade);
  return atividade;
}

module.exports = { listarPorNegocio, listarPorProprietario, listarTodas, criar };
