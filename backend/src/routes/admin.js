const express = require("express");
const { obterProprietarios, obterDuplicidades } = require("../controllers/adminController");

const router = express.Router();
router.get("/proprietarios", obterProprietarios);
router.get("/duplicidades", obterDuplicidades);

module.exports = router;
