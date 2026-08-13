const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { usuarioRepository } = require("../data/repositories");
const { buscarProprietarioPorEmailLogin } = require("./usuarioService");
const { jwtSecret } = require("../config/env");

const VALIDADE_TOKEN = "30d";

async function login({ email, senha }) {
  if (!email || !senha) {
    throw new Error("E-mail e senha sao obrigatorios");
  }
  // busca pelo e-mail EFETIVO (considera edicao feita pelo admin, nao so o
  // que veio do Pipedrive) - ver usuarioService.js.
  const proprietario = await buscarProprietarioPorEmailLogin(email);
  if (!proprietario) {
    throw new Error("E-mail ou senha invalidos");
  }
  const credencial = await usuarioRepository.buscarPorProprietarioId(proprietario.id);
  if (!credencial || !credencial.senhaHash) {
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

module.exports = { login };
