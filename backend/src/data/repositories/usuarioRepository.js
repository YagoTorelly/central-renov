const fs = require("fs");
const path = require("path");

// Credencial/override de contato e dado sensivel proprio da Central - NUNCA
// vem do Pipedrive nem entra no cache sincronizado (senao a proxima
// sincronizacao apagava senha e e-mail editados). Precisa sobreviver a
// restart, entao grava em disco de verdade. Arquivo fora do git (.gitignore).
const ARQUIVO = path.join(__dirname, "..", "credenciais", "usuarios.json");

function lerTudo() {
  if (!fs.existsSync(ARQUIVO)) return {};
  return JSON.parse(fs.readFileSync(ARQUIVO, "utf-8"));
}

function salvarTudo(dados) {
  fs.mkdirSync(path.dirname(ARQUIVO), { recursive: true });
  fs.writeFileSync(ARQUIVO, JSON.stringify(dados, null, 2), "utf-8");
}

async function buscarPorProprietarioId(proprietarioId) {
  const dados = lerTudo();
  return dados[proprietarioId] || null;
}

async function listarTodos() {
  return lerTudo();
}

// Merge, nao substitui - editar email nao pode apagar a senha ja definida
// (e vice-versa).
async function atualizar(proprietarioId, campos) {
  const dados = lerTudo();
  dados[proprietarioId] = {
    ...(dados[proprietarioId] || {}),
    ...campos,
    atualizadoEm: new Date().toISOString(),
  };
  salvarTudo(dados);
  return dados[proprietarioId];
}

module.exports = { buscarPorProprietarioId, listarTodos, atualizar };
