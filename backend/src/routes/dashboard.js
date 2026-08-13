const express = require("express");
const { obterDashboard } = require("../controllers/dashboardController");
const { exigirProprioOuAdmin } = require("../middlewares/autenticacao");

const router = express.Router();
router.get("/:proprietarioId", exigirProprioOuAdmin, obterDashboard);

module.exports = router;
