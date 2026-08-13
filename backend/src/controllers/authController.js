const { login } = require("../services/authService");

async function efetuarLogin(req, res, next) {
  try {
    const resultado = await login(req.body);
    res.json(resultado);
  } catch (error) {
    res.status(401).json({ erro: error.message });
  }
}

module.exports = { efetuarLogin };
