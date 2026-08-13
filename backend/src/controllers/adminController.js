const { proprietarioRepository } = require("../data/repositories");
const { listarPossiveisDuplicidades } = require("../services/duplicidadeService");
const { montarVisaoGeral, montarResumoPorProprietario } = require("../services/relatorioService");
const { definirSenha } = require("../services/authService");

async function obterProprietarios(req, res, next) {
  try {
    const proprietarios = await proprietarioRepository.listar();
    res.json(proprietarios);
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

module.exports = {
  obterProprietarios,
  obterDuplicidades,
  obterVisaoGeral,
  obterResumoProprietarios,
  redefinirSenha,
};
