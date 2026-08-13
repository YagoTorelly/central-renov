const { lerCache } = require("./lerCache");

async function listar() {
  return lerCache("proprietarios");
}

async function buscarPorId(id) {
  return lerCache("proprietarios").find((p) => p.id === id) || null;
}

async function buscarPorEmail(email) {
  const alvo = (email || "").trim().toLowerCase();
  return lerCache("proprietarios").find((p) => (p.email || "").trim().toLowerCase() === alvo) || null;
}

module.exports = { listar, buscarPorId, buscarPorEmail };
