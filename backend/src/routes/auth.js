const express = require("express");
const { efetuarLogin } = require("../controllers/authController");
const { loginRateLimit } = require("../middlewares/loginRateLimit");

const router = express.Router();
router.post("/login", loginRateLimit, efetuarLogin);

module.exports = router;
