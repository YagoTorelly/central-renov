const { agendarLembrete } = require("../services/lembreteService");

async function criarLembrete(req, res, next) {
  try {
    const lembrete = await agendarLembrete(req.body);
    res.status(201).json(lembrete);
  } catch (error) {
    next(error);
  }
}

module.exports = { criarLembrete };
