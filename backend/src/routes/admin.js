const express = require("express");
const {
  obterProprietarios,
  obterDuplicidades,
  obterVisaoGeral,
  obterResumoProprietarios,
  redefinirSenha,
} = require("../controllers/adminController");
const { exigirAdmin } = require("../middlewares/autenticacao");

const router = express.Router();
// Toda a area de administracao exige papel admin - aplicado uma vez aqui,
// nao rota por rota (exigirLogin ja rodou antes, la no index.js).
router.use(exigirAdmin);

router.get("/proprietarios", obterProprietarios);
router.get("/duplicidades", obterDuplicidades);
router.get("/visao-geral", obterVisaoGeral);
router.get("/resumo-proprietarios", obterResumoProprietarios);
router.post("/proprietarios/:proprietarioId/senha", redefinirSenha);

module.exports = router;
