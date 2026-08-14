const Proprietario = require("../models/Proprietario");

const SEM_ID_INTERNO = { _id: 0 };

async function listar() {
  return Proprietario.find({}, SEM_ID_INTERNO).lean();
}

async function buscarPorId(id) {
  return Proprietario.findOne({ id }, SEM_ID_INTERNO).lean();
}

async function buscarPorEmail(email) {
  const alvo = (email || "").trim().toLowerCase();
  const proprietarios = await Proprietario.find({}, SEM_ID_INTERNO).lean();
  return proprietarios.find((p) => (p.email || "").trim().toLowerCase() === alvo) || null;
}

module.exports = { listar, buscarPorId, buscarPorEmail };
