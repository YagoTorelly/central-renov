const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const { obterPapelEfetivo } = require("../services/usuarioService");

// Exige um token valido (Authorization: Bearer <token>) em toda rota do
// app - so login, sync (protegido por CRON_SECRET) e health ficam de fora.
// O papel usado daqui pra frente e o EFETIVO (busca de novo, nao confia no
// que foi gravado no token no momento do login) - assim, se o admin mudar
// o cargo de alguem, vale na proxima requisicao, sem precisar deslogar.
async function exigirLogin(req, res, next) {
  const cabecalho = req.get("authorization") || "";
  const token = cabecalho.startsWith("Bearer ") ? cabecalho.slice(7) : null;
  if (!token) {
    return res.status(401).json({ erro: "Nao autenticado" });
  }
  try {
    const dados = jwt.verify(token, jwtSecret);
    const papel = await obterPapelEfetivo(dados.proprietarioId);
    if (!papel) {
      return res.status(401).json({ erro: "Usuario nao encontrado" });
    }
    req.usuarioAutenticado = { proprietarioId: dados.proprietarioId, papel };
    next();
  } catch (error) {
    return res.status(401).json({ erro: "Sessao invalida ou expirada, faca login de novo" });
  }
}

// So deixa ver dados de outro proprietario (:proprietarioId na rota) se for
// admin. Sem isso, qualquer pessoa logada podia trocar o ID na URL e ver a
// carteira de outro proprietario - decisao confirmada em 2026-08-13.
// "todos" e um valor especial que so admin pode usar (ver dashboard/
// clientes/leads agregados de todo mundo).
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
