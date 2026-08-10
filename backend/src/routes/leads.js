const express = require("express");
const { obterLeadsParados } = require("../controllers/leadController");

const router = express.Router();
router.get("/:proprietarioId", obterLeadsParados);

module.exports = router;
