const Negocio = require("../models/Negocio");

const SEM_ID_INTERNO = { _id: 0 };

async function listar() {
  return Negocio.find({}, SEM_ID_INTERNO).lean();
}

async function listarPorProprietario(proprietarioId) {
  return Negocio.find({ proprietarioId }, SEM_ID_INTERNO).lean();
}

async function listarPorPessoaEmpresa(pessoaEmpresaId) {
  return Negocio.find({ pessoaEmpresaId }, SEM_ID_INTERNO).lean();
}

async function buscarPorId(id) {
  return Negocio.findOne({ id }, SEM_ID_INTERNO).lean();
}

module.exports = { listar, listarPorProprietario, listarPorPessoaEmpresa, buscarPorId };
