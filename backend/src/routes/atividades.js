const express = require("express");
const { criarAtividade, obterAtividadesPorProprietario } = require("../controllers/atividadeController");

const router = express.Router();
router.post("/", criarAtividade);
router.get("/:proprietarioId", obterAtividadesPorProprietario);

module.exports = router;
