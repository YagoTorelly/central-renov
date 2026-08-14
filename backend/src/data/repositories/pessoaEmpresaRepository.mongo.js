const PessoaEmpresa = require("../models/PessoaEmpresa");

const SEM_ID_INTERNO = { _id: 0 };
// Mesmo raciocinio do negocioRepository.mongo.js - pessoasEmpresas so muda
// via sincronizacao, e os services fazem buscarPorId em loop (uma por
// negocio/lead/atividade), entao cachear evita milhares de round-trips.
const TTL_MS = 5 * 60 * 1000;

let cache = null;
let cacheEm = 0;

async function todos() {
  const agora = Date.now();
  if (!cache || agora - cacheEm > TTL_MS) {
    cache = await PessoaEmpresa.find({}, SEM_ID_INTERNO).lean();
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

module.exports = { listar, buscarPorId, invalidarCache };
