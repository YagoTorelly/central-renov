const express = require("express");
const cors = require("cors");
const { port } = require("./config/env");
const { errorHandler } = require("./middlewares/errorHandler");

const dashboardRoutes = require("./routes/dashboard");
const clientesRoutes = require("./routes/clientes");
const leadsRoutes = require("./routes/leads");
const atividadesRoutes = require("./routes/atividades");
const adminRoutes = require("./routes/admin");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/atividades", atividadesRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Central Renov backend rodando em http://localhost:${port} (DATA_SOURCE=mock)`);
});
