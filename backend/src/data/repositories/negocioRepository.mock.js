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

module.exports = { listar, listarPorProprietario, listarPorPessoaEmpresa };
