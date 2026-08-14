// Reseta a senha de TODOS os proprietarios (inclusive quem ja tinha uma
// definida) e imprime a lista email+senha em texto puro pra distribuir.
// Diferente do gerar_senhas_iniciais.js (que pula quem ja tem senha), este
// forca a troca pra todo mundo - so usar quando for pra reemitir tudo de
// uma vez (ex: setup novo em producao), ja que invalida logins ativos.
//
// Uso: DATA_SOURCE=mongo node scripts/resetar_senhas.js
const { conectarMongo } = require("../src/config/mongo");
const { listarUsuarios, definirSenha } = require("../src/services/usuarioService");

const CARACTERES = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"; // sem 0/O/1/l/I

function gerarSenha(tamanho = 8) {
  let senha = "";
  for (let i = 0; i < tamanho; i++) {
    senha += CARACTERES[Math.floor(Math.random() * CARACTERES.length)];
  }
  return senha;
}

async function main() {
  await conectarMongo();

  const usuarios = await listarUsuarios();
  const linhas = [];

  for (const usuario of usuarios) {
    const senha = gerarSenha();
    await definirSenha(usuario.id, senha);
    linhas.push({ nome: usuario.nome, email: usuario.email, senha });
  }

  console.log("\nSenhas resetadas (entregue pra cada pessoa e peça pra trocar depois):\n");
  for (const l of linhas) {
    console.log(`${l.nome.padEnd(28)} ${(l.email || "sem e-mail").padEnd(35)} ${l.senha}`);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error("ERRO:", e);
  process.exit(1);
});
