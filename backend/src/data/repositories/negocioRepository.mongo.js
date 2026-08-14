const Negocio = require("../models/Negocio");

const SEM_ID_INTERNO = { _id: 0 };
// Negocios so mudam via sincronizacao do Pipedrive (rodada manualmente, nao
// a cada request) - cachear em memoria por alguns minutos evita centenas/
// milhares de ida-e-volta ao Mongo quando os services fazem buscarPorId
// dentro de um loop (ex: "Meus Clientes" no modo "todos" percorre 2000+
// negocios). Mesmo padrao do negocioRepository.cache.js (JSON local), so
// que aqui invalida por tempo em vez de mtime de arquivo.
const TTL_MS = 5 * 60 * 1000;

let cache = null;
let cacheEm = 0;

async function todos() {
  const agora = Date.now();
  if (!cache || agora - cacheEm > TTL_MS) {
    cache = await Negocio.find({}, SEM_ID_INTERNO).lean();
    cacheEm = agora;
  }
  return cache;
}

// Chamado pelo syncService depois de uma sincronizacao nova, pra nao ter
// que esperar o TTL vencer pra ver os dados atualizados.
function invalidarCache() {
  cache = null;
}

async function listar() {
  return todos();
}

async function listarPorProprietario(proprietarioId) {
  return (await todos()).filter((n) => n.proprietarioId === proprietarioId);
}

async function listarPorPessoaEmpresa(pessoaEmpresaId) {
  return (await todos()).filter((n) => n.pessoaEmpresaId === pessoaEmpresaId);
}

async function buscarPorId(id) {
  return (await todos()).find((n) => n.id === id) || null;
}

module.exports = { listar, listarPorProprietario, listarPorPessoaEmpresa, buscarPorId, invalidarCache };
