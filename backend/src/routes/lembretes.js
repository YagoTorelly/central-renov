const express = require("express");
const { criarLembrete } = require("../controllers/lembreteController");

const router = express.Router();
router.post("/", criarLembrete);

module.exports = router;
