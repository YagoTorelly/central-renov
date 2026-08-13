const proprietarios = require("../mock/proprietarios.json");

async function listar() {
  return proprietarios;
}

async function buscarPorId(id) {
  return proprietarios.find((p) => p.id === id) || null;
}

async function buscarPorEmail(email) {
  const alvo = (email || "").trim().toLowerCase();
  return proprietarios.find((p) => (p.email || "").trim().toLowerCase() === alvo) || null;
}

module.exports = { listar, buscarPorId, buscarPorEmail };
