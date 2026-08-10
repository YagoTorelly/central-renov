const fs = require("fs");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "..", "cache");

// Memoiza por arquivo, invalidando pelo mtime - assim uma sincronizacao nova
// e pega automaticamente (sem reiniciar o backend), mas cada request nao
// paga o custo de ler+parsear o JSON inteiro de novo pra cada item de um
// loop (ex: 291 clientes = 291 leituras do mesmo arquivo, sem isso).
const memo = new Map();

function lerCache(nomeArquivo) {
  const caminho = path.join(CACHE_DIR, `${nomeArquivo}.json`);
  if (!fs.existsSync(caminho)) {
    throw new Error(
      `data/cache/${nomeArquivo}.json nao existe ainda. Rode a sincronizacao ` +
        `(ingestao/sincronizar_pipedrive.py) antes de usar DATA_SOURCE=pipedrive-cache.`
    );
  }
  const mtime = fs.statSync(caminho).mtimeMs;
  const cacheado = memo.get(nomeArquivo);
  if (cacheado && cacheado.mtime === mtime) {
    return cacheado.dados;
  }
  const dados = JSON.parse(fs.readFileSync(caminho, "utf-8"));
  memo.set(nomeArquivo, { mtime, dados });
  return dados;
}

module.exports = { lerCache };
