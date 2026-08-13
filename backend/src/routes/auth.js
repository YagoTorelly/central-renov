const express = require("express");
const { efetuarLogin } = require("../controllers/authController");

const router = express.Router();
router.post("/login", efetuarLogin);

module.exports = router;
