const { montarDashboard } = require("../services/dashboardService");

async function obterDashboard(req, res, next) {
  try {
    const dashboard = await montarDashboard(req.params.proprietarioId);
    res.json(dashboard);
  } catch (error) {
    next(error);
  }
}

module.exports = { obterDashboard };
