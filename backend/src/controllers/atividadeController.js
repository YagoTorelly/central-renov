const { registrarAtividade, listarAtividadesPorProprietario } = require("../services/atividadeService");

async function criarAtividade(req, res, next) {
  try {
    const atividade = await registrarAtividade(req.body);
    res.status(201).json(atividade);
  } catch (error) {
    next(error);
  }
}

async function obterAtividadesPorProprietario(req, res, next) {
  try {
    const atividades = await listarAtividadesPorProprietario(req.params.proprietarioId);
    res.json(atividades);
  } catch (error) {
    next(error);
  }
}

module.exports = { criarAtividade, obterAtividadesPorProprietario };
