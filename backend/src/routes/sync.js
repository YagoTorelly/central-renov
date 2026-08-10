const express = require("express");
const { exigirCronSecret } = require("../middlewares/cronAuth");
const { receberSincronizacao } = require("../controllers/syncController");

const router = express.Router();
router.post("/pipedrive", exigirCronSecret, receberSincronizacao);

module.exports = router;
