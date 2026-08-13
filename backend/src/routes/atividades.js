const express = require("express");
const { criarAtividade, obterAtividadesPorProprietario } = require("../controllers/atividadeController");
const { exigirProprioOuAdmin } = require("../middlewares/autenticacao");

const router = express.Router();
router.post("/", exigirProprioOuAdmin, criarAtividade);
router.get("/:proprietarioId", exigirProprioOuAdmin, obterAtividadesPorProprietario);

module.exports = router;
