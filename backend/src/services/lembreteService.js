const { lembreteRepository, atividadeRepository } = require("../data/repositories");
const { calcularDataRenovacao } = require("../domain/renovacao");

const INDETERMINADO = "indeterminado";

// Quando o vendedor fala com o cliente e ele confirma que vai continuar no
// plano (sem interesse em trocar agora), o vendedor adia o lembrete de
// renovacao por N meses a partir de hoje - pra nao ficar aparecendo como
// atrasado/proximo toda hora, mas sem perder o controle por causa de
// reajuste e afins. Tambem registra uma atividade, pra ficar no historico.
// meses tambem aceita "indeterminado": o cliente nao quer mexer no contrato
// e nao deu prazo nenhum - o negocio fica sem data de renovacao e sem alerta
// ate alguem adiar de novo.
async function agendarLembrete({ negocioId, proprietarioId, meses, motivo }) {
  const indeterminado = meses === INDETERMINADO;
  const mesesNumero = indeterminado ? null : Number(meses);
  if (!negocioId || !proprietarioId || (!indeterminado && (!mesesNumero || mesesNumero <= 0))) {
    throw new Error('negocioId, proprietarioId e meses (maior que zero ou "indeterminado") sao obrigatorios');
  }
  // negocioId/proprietarioId viram filtro de query no Mongo (ver
  // lembreteRepository.mongo.js) - se um objeto passar aqui (em vez de
  // string), vira operador Mongo (ex: {"$ne": null}) e casa com qualquer
  // documento. So um "truthy" nao basta, tem que travar o tipo.
  if (typeof negocioId !== "string" || typeof proprietarioId !== "string") {
    throw new Error("negocioId e proprietarioId precisam ser texto");
  }

  const hoje = new Date().toISOString().slice(0, 10);
  const novaDataRenovacao = indeterminado ? null : calcularDataRenovacao(hoje, mesesNumero);

  const lembrete = await lembreteRepository.definir({
    negocioId,
    proprietarioId,
    novaDataRenovacao,
    indeterminado,
    motivo,
  });

  await atividadeRepository.criar({
    negocioId,
    proprietarioId,
    tipo: "lembrete",
    resultado: descreverAdiamento(indeterminado, mesesNumero, motivo),
  });

  return lembrete;
}

function descreverAdiamento(indeterminado, mesesNumero, motivo) {
  const base = indeterminado
    ? "Renovação adiada por tempo indeterminado"
    : `Renovação adiada ${mesesNumero} mês(es)`;
  return motivo ? `${base} - ${motivo}` : base;
}

module.exports = { agendarLembrete, INDETERMINADO };
