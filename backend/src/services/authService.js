const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { proprietarioRepository, usuarioRepository } = require("../data/repositories");
const { jwtSecret } = require("../config/env");

const VALIDADE_TOKEN = "30d";
const RODADAS_HASH = 10;

async function login({ email, senha }) {
  if (!email || !senha) {
    throw new Error("E-mail e senha sao obrigatorios");
  }
  const proprietario = await proprietarioRepository.buscarPorEmail(email);
  if (!proprietario) {
    throw new Error("E-mail ou senha invalidos");
  }
  const credencial = await usuarioRepository.buscarPorProprietarioId(proprietario.id);
  if (!credencial) {
    throw new Error("Usuario ainda nao tem senha definida - fale com o administrador");
  }
  const senhaCorreta = await bcrypt.compare(senha, credencial.senhaHash);
  if (!senhaCorreta) {
    throw new Error("E-mail ou senha invalidos");
  }

  const token = jwt.sign(
    { proprietarioId: proprietario.id, papel: proprietario.papel },
    jwtSecret,
    { expiresIn: VALIDADE_TOKEN }
  );

  return {
    token,
    proprietario: { id: proprietario.id, nome: proprietario.nome, papel: proprietario.papel },
  };
}

// Usado tanto pelo script de bootstrap (scripts/gerar_senhas_iniciais.js)
// quanto pelo endpoint de admin pra resetar senha de outra pessoa.
async function definirSenha(proprietarioId, novaSenha) {
  if (!novaSenha || novaSenha.length < 6) {
    throw new Error("Senha precisa ter pelo menos 6 caracteres");
  }
  const senhaHash = await bcrypt.hash(novaSenha, RODADAS_HASH);
  return usuarioRepository.definirSenha(proprietarioId, senhaHash);
}

module.exports = { login, definirSenha };
