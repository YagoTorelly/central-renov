const bcrypt = require("bcryptjs");
const { proprietarioRepository, usuarioRepository } = require("../data/repositories");

const RODADAS_HASH = 10;

// E-mail "de verdade" pra login: se o admin editou (emailOverride), usa
// esse; senao usa o que veio do Pipedrive. Isolado numa funcao pra nunca
// ter dois lugares calculando isso de jeitos diferentes.
async function emailEfetivo(proprietario) {
  const credencial = await usuarioRepository.buscarPorProprietarioId(proprietario.id);
  return ((credencial && credencial.emailOverride) || proprietario.email || "").trim().toLowerCase();
}

async function listarUsuarios() {
  const proprietarios = await proprietarioRepository.listar();
  const usuarios = [];
  for (const proprietario of proprietarios) {
    const credencial = await usuarioRepository.buscarPorProprietarioId(proprietario.id);
    usuarios.push({
      id: proprietario.id,
      nome: proprietario.nome,
      papel: proprietario.papel,
      email: (credencial && credencial.emailOverride) || proprietario.email,
      emailOriginalPipedrive: proprietario.email,
      temSenha: Boolean(credencial && credencial.senhaHash),
    });
  }
  return usuarios;
}

async function buscarProprietarioPorEmailLogin(email) {
  const alvo = (email || "").trim().toLowerCase();
  if (!alvo) return null;
  const proprietarios = await proprietarioRepository.listar();
  for (const proprietario of proprietarios) {
    if ((await emailEfetivo(proprietario)) === alvo) return proprietario;
  }
  return null;
}

async function definirSenha(proprietarioId, novaSenha) {
  if (!novaSenha || novaSenha.length < 6) {
    throw new Error("Senha precisa ter pelo menos 6 caracteres");
  }
  const senhaHash = await bcrypt.hash(novaSenha, RODADAS_HASH);
  return usuarioRepository.atualizar(proprietarioId, { senhaHash });
}

async function definirEmail(proprietarioId, novoEmail) {
  const email = (novoEmail || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("E-mail invalido");
  }
  const existente = await buscarProprietarioPorEmailLogin(email);
  if (existente && existente.id !== proprietarioId) {
    throw new Error("Esse e-mail ja esta em uso por outro usuario");
  }
  return usuarioRepository.atualizar(proprietarioId, { emailOverride: email });
}

module.exports = { listarUsuarios, buscarProprietarioPorEmailLogin, definirSenha, definirEmail };
