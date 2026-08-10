const { listarLeadsParados } = require("../services/leadService");

async function obterLeadsParados(req, res, next) {
  try {
    const leads = await listarLeadsParados(req.params.proprietarioId);
    res.json(leads);
  } catch (error) {
    next(error);
  }
}

module.exports = { obterLeadsParados };
