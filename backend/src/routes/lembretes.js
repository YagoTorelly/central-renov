const express = require("express");
const { criarLembrete } = require("../controllers/lembreteController");
const { exigirProprioOuAdmin } = require("../middlewares/autenticacao");

const router = express.Router();
router.post("/", exigirProprioOuAdmin, criarLembrete);

module.exports = router;
