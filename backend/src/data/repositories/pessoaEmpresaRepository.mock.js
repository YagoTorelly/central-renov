const pessoasEmpresas = require("../mock/pessoasEmpresas.json");

async function listar() {
  return pessoasEmpresas;
}

async function buscarPorId(id) {
  return pessoasEmpresas.find((p) => p.id === id) || null;
}

module.exports = { listar, buscarPorId };
