const fs = require("fs");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "..", "cache");

// Le direto do disco a cada chamada (sem cache em memoria) pra nao precisar
// reiniciar o backend depois de rodar uma sincronizacao nova.
function lerCache(nomeArquivo) {
  const caminho = path.join(CACHE_DIR, `${nomeArquivo}.json`);
  if (!fs.existsSync(caminho)) {
    throw new Error(
      `data/cache/${nomeArquivo}.json nao existe ainda. Rode a sincronizacao ` +
        `(ingestao/sincronizar_pipedrive.py) antes de usar DATA_SOURCE=pipedrive-cache.`
    );
  }
  return JSON.parse(fs.readFileSync(caminho, "utf-8"));
}

module.exports = { lerCache };
