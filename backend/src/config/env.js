require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3001,
  dataSource: process.env.DATA_SOURCE || "mock",
  cronSecret: process.env.CRON_SECRET || "",
  jwtSecret: process.env.JWT_SECRET || "",
  mongodbUri: process.env.MONGODB_URI || "",
  // Lista de origens liberadas pro CORS (separadas por virgula). Sem isso
  // configurado, so o Vite local - depois do deploy, adicionar a URL do
  // Vercel aqui (CORS_ORIGINS=https://xxx.vercel.app,http://localhost:5173).
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origem) => origem.trim())
    .filter(Boolean),
};
