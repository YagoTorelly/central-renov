const rateLimit = require("express-rate-limit");

// 10 tentativas / 15 min por IP - alvo e o /api/auth/login, que hoje nao
// tem nenhum bloqueio contra tentativa de senha por forca bruta.
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: "Muitas tentativas de login - aguarde alguns minutos e tente de novo" },
});

module.exports = { loginRateLimit };
