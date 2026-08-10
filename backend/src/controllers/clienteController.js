const { listarMeusClientes } = require("../services/clienteService");

async function obterMeusClientes(req, res, next) {
  try {
    const clientes = await listarMeusClientes(req.params.proprietarioId);
    res.json(clientes);
  } catch (error) {
    next(error);
  }
}

module.exports = { obterMeusClientes };
