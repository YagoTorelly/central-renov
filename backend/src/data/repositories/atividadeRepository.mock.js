const atividadesIniciais = require("../mock/atividades.json");

// Mock em memoria: comeca com o fixture e aceita novas atividades durante a
// sessao. Reinicia ao reiniciar o servidor - troque pela implementacao real
// (banco) quando a Central conectar no Postgres/Mongo definitivo.
let atividades = [...atividadesIniciais];
let proximoId = atividades.length + 1;

async function listarPorNegocio(negocioId) {
  return atividades.filter((a) => a.negocioId === negocioId);
}

async function listarPorProprietario(proprietarioId) {
  return atividades.filter((a) => a.proprietarioId === proprietarioId);
}

async function criar({ negocioId, proprietarioId, tipo, resultado }) {
  const atividade = {
    id: `a${proximoId++}`,
    negocioId,
    proprietarioId,
    tipo,
    resultado,
    data: new Date().toISOString().slice(0, 10),
  };
  atividades.push(atividade);
  return atividade;
}

module.exports = { listarPorNegocio, listarPorProprietario, criar };
