const proprietarios = require("../mock/proprietarios.json");

async function listar() {
  return proprietarios;
}

async function buscarPorId(id) {
  return proprietarios.find((p) => p.id === id) || null;
}

module.exports = { listar, buscarPorId };
