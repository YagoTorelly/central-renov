const { cronSecret } = require("../config/env");

// Mesmo padrao do sistema_financeiro: rotas chamadas por job de sync usam um
// header x-cron-secret em vez de login de usuario.
function exigirCronSecret(req, res, next) {
  if (!cronSecret) {
    return res.status(500).json({ erro: "CRON_SECRET nao configurado no backend" });
  }
  if (req.get("x-cron-secret") !== cronSecret) {
    return res.status(401).json({ erro: "x-cron-secret invalido ou ausente" });
  }
  next();
}

module.exports = { exigirCronSecret };
