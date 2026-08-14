const fs = require("fs");
const path = require("path");
const { dataSource } = require("../config/env");
const Proprietario = require("../data/models/Proprietario");
const PessoaEmpresa = require("../data/models/PessoaEmpresa");
const Negocio = require("../data/models/Negocio");

const CACHE_DIR = path.join(__dirname, "..", "data", "cache");

// Validacao minima de forma - o script de sincronizacao (ingestao/) e quem
// garante a qualidade dos dados; aqui so protegemos contra payload quebrado.
function validarPayload(payload) {
  const chaves = ["proprietarios", "pessoasEmpresas", "negocios"];
  for (const chave of chaves) {
    if (!Array.isArray(payload[chave])) {
      throw new Error(`payload.${chave} precisa ser um array`);
    }
  }
}

function salvarCacheEmArquivo(payload) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  for (const chave of ["proprietarios", "pessoasEmpresas", "negocios"]) {
    fs.writeFileSync(
      path.join(CACHE_DIR, `${chave}.json`),
      JSON.stringify(payload[chave], null, 2),
      "utf-8"
    );
  }
}

// Upsert por "id" + remove do banco quem nao veio nessa sincronizacao -
// mesmo efeito de "sobrescrever tudo" que o arquivo JSON tinha, so que numa
// colecao Mongo em vez de um arquivo inteiro.
async function upsertColecao(Model, itens) {
  if (itens.length > 0) {
    const operacoes = itens.map((item) => ({
      updateOne: { filter: { id: item.id }, update: { $set: item }, upsert: true },
    }));
    await Model.bulkWrite(operacoes);
  }
  const idsAtuais = itens.map((item) => item.id);
  await Model.deleteMany({ id: { $nin: idsAtuais } });
}

async function salvarCacheNoMongo(payload) {
  await upsertColecao(Proprietario, payload.proprietarios);
  await upsertColecao(PessoaEmpresa, payload.pessoasEmpresas);
  await upsertColecao(Negocio, payload.negocios);
}

async function salvarCache(payload) {
  validarPayload(payload);
  if (dataSource === "mongo") {
    await salvarCacheNoMongo(payload);
  } else {
    salvarCacheEmArquivo(payload);
  }
  return {
    proprietarios: payload.proprietarios.length,
    pessoasEmpresas: payload.pessoasEmpresas.length,
    negocios: payload.negocios.length,
    sincronizadoEm: new Date().toISOString(),
  };
}

module.exports = { salvarCache };
