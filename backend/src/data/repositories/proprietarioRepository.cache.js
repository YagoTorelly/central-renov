const { lerCache } = require("./lerCache");

async function listar() {
  return lerCache("proprietarios");
}

async function buscarPorId(id) {
  return lerCache("proprietarios").find((p) => p.id === id) || null;
}

module.exports = { listar, buscarPorId };
