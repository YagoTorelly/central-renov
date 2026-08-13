const { proprietarioRepository } = require("../data/repositories");
const { listarPossiveisDuplicidades } = require("../services/duplicidadeService");
const { montarVisaoGeral, montarResumoPorProprietario } = require("../services/relatorioService");
const { listarUsuarios, definirSenha, definirEmail } = require("../services/usuarioService");

async function obterProprietarios(req, res, next) {
  try {
    const proprietarios = await proprietarioRepository.listar();
    res.json(proprietarios);
  } catch (error) {
    next(error);
  }
}

async function obterUsuarios(req, res, next) {
  try {
    const usuarios = await listarUsuarios();
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
}

async function obterDuplicidades(req, res, next) {
  try {
    const duplicidades = await listarPossiveisDuplicidades();
    res.json(duplicidades);
  } catch (error) {
    next(error);
  }
}

async function obterVisaoGeral(req, res, next) {
  try {
    const visaoGeral = await montarVisaoGeral();
    res.json(visaoGeral);
  } catch (error) {
    next(error);
  }
}

async function obterResumoProprietarios(req, res, next) {
  try {
    const resumo = await montarResumoPorProprietario();
    res.json(resumo);
  } catch (error) {
    next(error);
  }
}

async function redefinirSenha(req, res, next) {
  try {
    await definirSenha(req.params.proprietarioId, req.body.novaSenha);
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
}

async function editarEmail(req, res, next) {
  try {
    const atualizado = await definirEmail(req.params.proprietarioId, req.body.novoEmail);
    res.json({ ok: true, email: atualizado.emailOverride });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
}

module.exports = {
  obterProprietarios,
  obterUsuarios,
  obterDuplicidades,
  obterVisaoGeral,
  obterResumoProprietarios,
  redefinirSenha,
  editarEmail,
};
