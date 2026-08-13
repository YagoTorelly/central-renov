const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");

// Exige um token valido (Authorization: Bearer <token>) em toda rota do
// app - so login, sync (protegido por CRON_SECRET) e health ficam de fora.
function exigirLogin(req, res, next) {
  const cabecalho = req.get("authorization") || "";
  const token = cabecalho.startsWith("Bearer ") ? cabecalho.slice(7) : null;
  if (!token) {
    return res.status(401).json({ erro: "Nao autenticado" });
  }
  try {
    const dados = jwt.verify(token, jwtSecret);
    req.usuarioAutenticado = { proprietarioId: dados.proprietarioId, papel: dados.papel };
    next();
  } catch (error) {
    return res.status(401).json({ erro: "Sessao invalida ou expirada, faca login de novo" });
  }
}

// So deixa ver dados de outro proprietario (:proprietarioId na rota) se for
// admin. Sem isso, qualquer pessoa logada podia trocar o ID na URL e ver a
// carteira de outro proprietario - decisao confirmada em 2026-08-13.
function exigirProprioOuAdmin(req, res, next) {
  // cobre tanto rota com :proprietarioId (GET /clientes/:id) quanto corpo
  // com proprietarioId (POST /atividades, POST /lembretes).
  const alvo = req.params.proprietarioId || req.body?.proprietarioId;
  const { proprietarioId, papel } = req.usuarioAutenticado;
  if (alvo && alvo !== proprietarioId && papel !== "admin") {
    return res.status(403).json({ erro: "Voce so pode agir na sua propria carteira" });
  }
  next();
}

function exigirAdmin(req, res, next) {
  if (req.usuarioAutenticado.papel !== "admin") {
    return res.status(403).json({ erro: "Acao restrita a administradores" });
  }
  next();
}

module.exports = { exigirLogin, exigirProprioOuAdmin, exigirAdmin };
