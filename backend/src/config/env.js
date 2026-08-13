require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3001,
  dataSource: process.env.DATA_SOURCE || "mock",
  cronSecret: process.env.CRON_SECRET || "",
  jwtSecret: process.env.JWT_SECRET || "",
};
