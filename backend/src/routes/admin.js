const express = require("express");
const {
  obterProprietarios,
  obterUsuarios,
  obterDuplicidades,
  obterVisaoGeral,
  obterResumoProprietarios,
  redefinirSenha,
  editarEmail,
  editarPapel,
} = require("../controllers/adminController");
const { exigirAdmin } = require("../middlewares/autenticacao");

const router = express.Router();
// Toda a area de administracao exige papel admin - aplicado uma vez aqui,
// nao rota por rota (exigirLogin ja rodou antes, la no index.js).
router.use(exigirAdmin);

router.get("/proprietarios", obterProprietarios);
router.get("/usuarios", obterUsuarios);
router.get("/duplicidades", obterDuplicidades);
router.get("/visao-geral", obterVisaoGeral);
router.get("/resumo-proprietarios", obterResumoProprietarios);
router.post("/proprietarios/:proprietarioId/senha", redefinirSenha);
router.post("/proprietarios/:proprietarioId/email", editarEmail);
router.post("/proprietarios/:proprietarioId/papel", editarPapel);

module.exports = router;
