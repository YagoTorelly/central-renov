const { proprietarioRepository } = require("../data/repositories");
const { listarPossiveisDuplicidades } = require("../services/duplicidadeService");

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

module.exports = { obterProprietarios, obterDuplicidades };
