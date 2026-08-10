const { lerCache } = require("./lerCache");

async function listar() {
  return lerCache("negocios");
}

async function listarPorProprietario(proprietarioId) {
  return lerCache("negocios").filter((n) => n.proprietarioId === proprietarioId);
}

async function listarPorPessoaEmpresa(pessoaEmpresaId) {
  return lerCache("negocios").filter((n) => n.pessoaEmpresaId === pessoaEmpresaId);
}

module.exports = { listar, listarPorProprietario, listarPorPessoaEmpresa };
