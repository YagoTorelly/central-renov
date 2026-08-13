const express = require("express");
const { obterMeusClientes } = require("../controllers/clienteController");
const { exigirProprioOuAdmin } = require("../middlewares/autenticacao");

const router = express.Router();
router.get("/:proprietarioId", exigirProprioOuAdmin, obterMeusClientes);

module.exports = router;
