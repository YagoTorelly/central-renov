const Lembrete = require("../models/Lembrete");

const SEM_ID_INTERNO = { _id: 0 };
// clienteService chama buscarPorNegocio uma vez por negocio (pode ser
// milhares no modo "todos") - cache em Map por negocioId, com
// write-through no definir() pra um lembrete recem-criado aparecer na hora
// (sem esperar o TTL), igual o comportamento do antigo Map em memoria
// (lembreteRepository.mock.js).
const TTL_MS = 5 * 60 * 1000;

let cache = null;
let cacheEm = 0;

async function mapa() {
  const agora = Date.now();
  if (!cache || agora - cacheEm > TTL_MS) {
    const todos = await Lembrete.find({}, SEM_ID_INTERNO).lean();
    cache = new Map(todos.map((l) => [l.negocioId, l]));
    cacheEm = agora;
  }
  return cache;
}

function invalidarCache() {
  cache = null;
}

async function definir({ negocioId, proprietarioId, novaDataRenovacao, motivo }) {
  const lembrete = {
    negocioId,
    proprietarioId,
    novaDataRenovacao,
    motivo: motivo || null,
    criadoEm: new Date().toISOString().slice(0, 10),
  };
  // $set (nao substitui o documento inteiro) - defesa em profundidade: mesmo
  // que negocioId escape da validacao em lembreteService.js, um update
  // parcial nao consegue "vazar" campos de outro documento pro retorno nem
  // apagar campos que nao fazem parte do lembrete.
  await Lembrete.findOneAndUpdate({ negocioId }, { $set: lembrete }, { upsert: true });
  (await mapa()).set(negocioId, lembrete);
  return lembrete;
}

async function buscarPorNegocio(negocioId) {
  return (await mapa()).get(negocioId) || null;
}

module.exports = { definir, buscarPorNegocio, invalidarCache };
