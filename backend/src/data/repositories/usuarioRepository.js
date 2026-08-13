const fs = require("fs");
const path = require("path");

// Credencial (hash de senha) e dado sensivel proprio da Central - NUNCA vem
// do Pipedrive nem entra no cache sincronizado. Precisa sobreviver a
// restart do backend (diferente de atividade/lembrete), entao grava em
// disco de verdade em vez de ficar so em memoria. Arquivo fica fora do git
// (ver .gitignore).
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

async function definirSenha(proprietarioId, senhaHash) {
  const dados = lerTudo();
  dados[proprietarioId] = { senhaHash, atualizadoEm: new Date().toISOString() };
  salvarTudo(dados);
  return dados[proprietarioId];
}

module.exports = { buscarPorProprietarioId, definirSenha };
