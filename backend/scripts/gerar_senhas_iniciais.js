// Gera uma senha temporaria pra cada proprietario que ainda nao tem
// credencial, salva o hash (definirSenha) e imprime a lista em texto puro
// pra voce entregar pra cada um. Roda uma vez no bootstrap; quem ja tem
// senha definida e pulado (nao reseta sem querer quem ja trocou a senha).
//
// Uso: node scripts/gerar_senhas_iniciais.js
const { proprietarioRepository, usuarioRepository } = require("../src/data/repositories");
const { definirSenha } = require("../src/services/usuarioService");

const CARACTERES = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"; // sem 0/O/1/l/I

function gerarSenha(tamanho = 8) {
  let senha = "";
  for (let i = 0; i < tamanho; i++) {
    senha += CARACTERES[Math.floor(Math.random() * CARACTERES.length)];
  }
  return senha;
}

async function main() {
  const proprietarios = await proprietarioRepository.listar();
  const linhas = [];

  for (const proprietario of proprietarios) {
    const existente = await usuarioRepository.buscarPorProprietarioId(proprietario.id);
    if (existente && existente.senhaHash) {
      console.log(`(pulado, ja tem senha) ${proprietario.nome}`);
      continue;
    }
    const senha = gerarSenha();
    await definirSenha(proprietario.id, senha);
    linhas.push({ nome: proprietario.nome, email: proprietario.email, senha });
  }

  if (linhas.length === 0) {
    console.log("\nNinguem novo - todo mundo ja tinha senha definida.");
    return;
  }

  console.log("\nSenhas geradas (entregue pra cada pessoa e peça pra trocar depois):\n");
  for (const l of linhas) {
    console.log(`${l.nome.padEnd(28)} ${(l.email || "sem e-mail").padEnd(35)} ${l.senha}`);
  }
}

main().catch((e) => {
  console.error("ERRO:", e);
  process.exit(1);
});
