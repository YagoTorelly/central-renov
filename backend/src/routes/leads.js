const express = require("express");
const { obterLeadsParados } = require("../controllers/leadController");
const { exigirProprioOuAdmin } = require("../middlewares/autenticacao");

const router = express.Router();
router.get("/:proprietarioId", exigirProprioOuAdmin, obterLeadsParados);

module.exports = router;
