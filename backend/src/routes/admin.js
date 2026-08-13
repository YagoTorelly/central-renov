const express = require("express");
const {
  obterProprietarios,
  obterDuplicidades,
  obterVisaoGeral,
  obterResumoProprietarios,
} = require("../controllers/adminController");

const router = express.Router();
router.get("/proprietarios", obterProprietarios);
router.get("/duplicidades", obterDuplicidades);
router.get("/visao-geral", obterVisaoGeral);
router.get("/resumo-proprietarios", obterResumoProprietarios);

module.exports = router;
