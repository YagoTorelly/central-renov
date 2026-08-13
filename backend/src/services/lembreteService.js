const { lembreteRepository, atividadeRepository } = require("../data/repositories");
const { calcularDataRenovacao } = require("../domain/renovacao");

// Quando o vendedor fala com o cliente e ele confirma que vai continuar no
// plano (sem interesse em trocar agora), o vendedor adia o lembrete de
// renovacao por N meses a partir de hoje - pra nao ficar aparecendo como
// atrasado/proximo toda hora, mas sem perder o controle por causa de
// reajuste e afins. Tambem registra uma atividade, pra ficar no historico.
async function agendarLembrete({ negocioId, proprietarioId, meses, motivo }) {
  const mesesNumero = Number(meses);
  if (!negocioId || !proprietarioId || !mesesNumero || mesesNumero <= 0) {
    throw new Error("negocioId, proprietarioId e meses (maior que zero) sao obrigatorios");
  }

  const hoje = new Date().toISOString().slice(0, 10);
  const novaDataRenovacao = calcularDataRenovacao(hoje, mesesNumero);

  const lembrete = await lembreteRepository.definir({ negocioId, proprietarioId, novaDataRenovacao, motivo });

  await atividadeRepository.criar({
    negocioId,
    proprietarioId,
    tipo: "lembrete",
    resultado: motivo
      ? `Renovação adiada ${mesesNumero} mês(es) - ${motivo}`
      : `Renovação adiada ${mesesNumero} mês(es)`,
  });

  return lembrete;
}

module.exports = { agendarLembrete };
