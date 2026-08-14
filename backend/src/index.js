const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { port, dataSource, jwtSecret, corsOrigins } = require("./config/env");
const { conectarMongo } = require("./config/mongo");
const { errorHandler } = require("./middlewares/errorHandler");
const { exigirLogin } = require("./middlewares/autenticacao");

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const clientesRoutes = require("./routes/clientes");
const leadsRoutes = require("./routes/leads");
const atividadesRoutes = require("./routes/atividades");
const adminRoutes = require("./routes/admin");
const syncRoutes = require("./routes/sync");
const lembretesRoutes = require("./routes/lembretes");

const app = express();
// vai atras de um proxy (Heroku) - confia em 1 hop pra req.ip/protocol
// virem certos, sem confiar cegamente em qualquer X-Forwarded-* espalhado.
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: corsOrigins }));
// limite maior que o padrao (100kb) - a sincronizacao do Pipedrive manda
// milhares de negocios de uma vez so.
app.use(express.json({ limit: "20mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));
// login nao exige login (obvio) - sync tem autenticacao propria via
// CRON_SECRET (job automatizado, nao um usuario logado).
app.use("/api/auth", authRoutes);
app.use("/api/sync", syncRoutes);

// Tudo daqui pra baixo exige um token valido.
app.use("/api", exigirLogin);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/atividades", atividadesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/lembretes", lembretesRoutes);

app.use(errorHandler);

async function iniciar() {
  // sem isso, jwt.sign/verify caem pra secret "" (string vazia) e qualquer
  // um forja um token valido assinando com "" tambem - falhar aqui e melhor
  // que subir "funcionando" com autenticacao quebrada.
  if (!jwtSecret) {
    throw new Error("JWT_SECRET nao configurado - defina no .env antes de subir o servidor");
  }
  if (dataSource === "mongo") {
    await conectarMongo();
  }
  app.listen(port, () => {
    console.log(`Central Renov backend rodando em http://localhost:${port} (DATA_SOURCE=${dataSource})`);
  });
}

iniciar();
