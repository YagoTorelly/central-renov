const bcrypt = require("bcryptjs");
const { proprietarioRepository, usuarioRepository } = require("../data/repositories");

const RODADAS_HASH = 10;
const PAPEIS_VALIDOS = ["admin", "proprietario"];

// E-mail/papel "de verdade": se o admin editou (override), usa esse; senao
// usa o que veio do Pipedrive. Isolado numa funcao pra nunca ter dois
// lugares calculando isso de jeitos diferentes.
async function emailEfetivo(proprietario) {
  const credencial = await usuarioRepository.buscarPorProprietarioId(proprietario.id);
  return ((credencial && credencial.emailOverride) || proprietario.email || "").trim().toLowerCase();
}

function papelEfetivoDe(proprietario, credencial) {
  return (credencial && credencial.papelOverride) || proprietario.papel;
}

// Usado pelo middleware de autenticacao em toda requisicao - se o admin
// mudar o cargo de alguem, precisa valer na hora, sem a pessoa ter que
// deslogar e logar de novo (o token nao carrega o papel mais atualizado).
async function obterPapelEfetivo(proprietarioId) {
  const proprietario = await proprietarioRepository.buscarPorId(proprietarioId);
  if (!proprietario) return null;
  const credencial = await usuarioRepository.buscarPorProprietarioId(proprietarioId);
  return papelEfetivoDe(proprietario, credencial);
}

async function listarUsuarios() {
  const proprietarios = await proprietarioRepository.listar();
  const usuarios = [];
  for (const proprietario of proprietarios) {
    const credencial = await usuarioRepository.buscarPorProprietarioId(proprietario.id);
    usuarios.push({
      id: proprietario.id,
      nome: proprietario.nome,
      papel: papelEfetivoDe(proprietario, credencial),
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

async function definirPapel(proprietarioId, novoPapel) {
  if (!PAPEIS_VALIDOS.includes(novoPapel)) {
    throw new Error('Papel invalido - use "admin" ou "proprietario"');
  }
  return usuarioRepository.atualizar(proprietarioId, { papelOverride: novoPapel });
}

module.exports = {
  listarUsuarios,
  buscarProprietarioPorEmailLogin,
  obterPapelEfetivo,
  definirSenha,
  definirEmail,
  definirPapel,
};
