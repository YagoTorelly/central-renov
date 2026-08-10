const negocios = require("../mock/negocios.json");

async function listar() {
  return negocios;
}

async function listarPorProprietario(proprietarioId) {
  return negocios.filter((n) => n.proprietarioId === proprietarioId);
}

async function listarPorPessoaEmpresa(pessoaEmpresaId) {
  return negocios.filter((n) => n.pessoaEmpresaId === pessoaEmpresaId);
}

async function buscarPorId(id) {
  return negocios.find((n) => n.id === id) || null;
}

module.exports = { listar, listarPorProprietario, listarPorPessoaEmpresa, buscarPorId };
