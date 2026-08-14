const PessoaEmpresa = require("../models/PessoaEmpresa");

const SEM_ID_INTERNO = { _id: 0 };

async function listar() {
  return PessoaEmpresa.find({}, SEM_ID_INTERNO).lean();
}

async function buscarPorId(id) {
  return PessoaEmpresa.findOne({ id }, SEM_ID_INTERNO).lean();
}

module.exports = { listar, buscarPorId };
