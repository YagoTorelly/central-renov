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

async function buscarPorId(id) {
  return lerCache("negocios").find((n) => n.id === id) || null;
}

module.exports = { listar, listarPorProprietario, listarPorPessoaEmpresa, buscarPorId };
