const fs = require("fs");
const path = require("path");

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

function salvarCache(payload) {
  validarPayload(payload);
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  for (const chave of ["proprietarios", "pessoasEmpresas", "negocios"]) {
    fs.writeFileSync(
      path.join(CACHE_DIR, `${chave}.json`),
      JSON.stringify(payload[chave], null, 2),
      "utf-8"
    );
  }
  return {
    proprietarios: payload.proprietarios.length,
    pessoasEmpresas: payload.pessoasEmpresas.length,
    negocios: payload.negocios.length,
    sincronizadoEm: new Date().toISOString(),
  };
}

module.exports = { salvarCache };
