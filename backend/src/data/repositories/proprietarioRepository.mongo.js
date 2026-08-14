const Proprietario = require("../models/Proprietario");

const SEM_ID_INTERNO = { _id: 0 };
// Mesmo raciocinio das outras .mongo.js - buscarPorId e chamado uma vez por
// negocio no modo "todos" (clienteService/leadService), cachear evita
// round-trips repetidos por request.
const TTL_MS = 5 * 60 * 1000;

let cache = null;
let cacheEm = 0;

async function todos() {
  const agora = Date.now();
  if (!cache || agora - cacheEm > TTL_MS) {
    cache = await Proprietario.find({}, SEM_ID_INTERNO).lean();
    cacheEm = agora;
  }
  return cache;
}

function invalidarCache() {
  cache = null;
}

async function listar() {
  return todos();
}

async function buscarPorId(id) {
  return (await todos()).find((p) => p.id === id) || null;
}

async function buscarPorEmail(email) {
  const alvo = (email || "").trim().toLowerCase();
  return (await todos()).find((p) => (p.email || "").trim().toLowerCase() === alvo) || null;
}

module.exports = { listar, buscarPorId, buscarPorEmail, invalidarCache };
