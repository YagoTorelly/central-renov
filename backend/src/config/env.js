require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3001,
  dataSource: process.env.DATA_SOURCE || "mock",
};
