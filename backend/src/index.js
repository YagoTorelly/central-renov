const express = require("express");
const cors = require("cors");
const { port, dataSource } = require("./config/env");
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
app.use(cors());
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

app.listen(port, () => {
  console.log(`Central Renov backend rodando em http://localhost:${port} (DATA_SOURCE=${dataSource})`);
});
