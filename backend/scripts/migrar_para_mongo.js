// Migracao de uma vez so: le o cache JSON (proprietarios/pessoasEmpresas/
// negocios sincronizados do Pipedrive) e as credenciais (senhas/overrides)
// que hoje vivem em arquivo local, e importa tudo pro MongoDB novo. Roda
// contra o MONGODB_URI configurado no .env (aponte pro banco de producao
// antes de rodar de verdade). Nao mexe em atividades/lembretes porque eles
// nunca foram persistidos (eram so em memoria) - nao ha nada pra migrar ali.
//
// Uso: node scripts/migrar_para_mongo.js
const fs = require("fs");
const path = require("path");
const { conectarMongo } = require("../src/config/mongo");
const Proprietario = require("../src/data/models/Proprietario");
const PessoaEmpresa = require("../src/data/models/PessoaEmpresa");
const Negocio = require("../src/data/models/Negocio");
const Usuario = require("../src/data/models/Usuario");

const CACHE_DIR = path.join(__dirname, "..", "src", "data", "cache");
const CREDENCIAIS_PATH = path.join(__dirname, "..", "src", "data", "credenciais", "usuarios.json");

function lerJsonOuVazio(caminho, valorPadrao) {
  if (!fs.existsSync(caminho)) return valorPadrao;
  return JSON.parse(fs.readFileSync(caminho, "utf-8"));
}

async function importarColecao(Model, itens, nome) {
  if (itens.length === 0) {
    console.log(`${nome}: nada pra importar (arquivo vazio ou nao existe)`);
    return;
  }
  const operacoes = itens.map((item) => ({
    updateOne: { filter: { id: item.id }, update: { $set: item }, upsert: true },
  }));
  await Model.bulkWrite(operacoes);
  console.log(`${nome}: ${itens.length} importado(s)`);
}

// Preserva senhaHash/emailOverride/papelOverride exatamente como estao no
// arquivo - nao regera nada.
async function importarCredenciais(credenciaisPorProprietarioId) {
  const entradas = Object.entries(credenciaisPorProprietarioId);
  if (entradas.length === 0) {
    console.log("usuarios (credenciais): nada pra importar");
    return;
  }
  const operacoes = entradas.map(([proprietarioId, campos]) => ({
    updateOne: {
      filter: { proprietarioId },
      update: { $set: { proprietarioId, ...campos } },
      upsert: true,
    },
  }));
  await Usuario.bulkWrite(operacoes);
  console.log(`usuarios (credenciais): ${entradas.length} importado(s)`);
}

async function main() {
  await conectarMongo();

  const proprietarios = lerJsonOuVazio(path.join(CACHE_DIR, "proprietarios.json"), []);
  const pessoasEmpresas = lerJsonOuVazio(path.join(CACHE_DIR, "pessoasEmpresas.json"), []);
  const negocios = lerJsonOuVazio(path.join(CACHE_DIR, "negocios.json"), []);
  const credenciais = lerJsonOuVazio(CREDENCIAIS_PATH, {});

  await importarColecao(Proprietario, proprietarios, "proprietarios");
  await importarColecao(PessoaEmpresa, pessoasEmpresas, "pessoasEmpresas");
  await importarColecao(Negocio, negocios, "negocios");
  await importarCredenciais(credenciais);

  console.log("\nMigracao concluida.");
  process.exit(0);
}

main().catch((e) => {
  console.error("ERRO:", e);
  process.exit(1);
});
