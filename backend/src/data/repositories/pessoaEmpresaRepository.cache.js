const { lerCache } = require("./lerCache");

async function listar() {
  return lerCache("pessoasEmpresas");
}

async function buscarPorId(id) {
  return lerCache("pessoasEmpresas").find((p) => p.id === id) || null;
}

module.exports = { listar, buscarPorId };
