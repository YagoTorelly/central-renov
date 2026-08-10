const express = require("express");
const { obterMeusClientes } = require("../controllers/clienteController");

const router = express.Router();
router.get("/:proprietarioId", obterMeusClientes);

module.exports = router;
