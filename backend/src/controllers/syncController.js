const { salvarCache } = require("../services/syncService");

async function receberSincronizacao(req, res, next) {
  try {
    const resumo = await salvarCache(req.body);
    res.json({ ok: true, ...resumo });
  } catch (error) {
    next(error);
  }
}

module.exports = { receberSincronizacao };
