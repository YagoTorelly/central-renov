const MS_POR_DIA = 1000 * 60 * 60 * 24;

// A "renovacao" e o gatilho pra COMECAR a trabalhar o contrato, nao a data
// em que ele de fato vence - decisao confirmada em 2026-08-10: precisa
// disparar 2 meses antes de completar o prazo (10/12 meses ou 22/24 meses).
const MESES_ANTECEDENCIA_RENOVACAO = 2;

function calcularDataRenovacao(dataInicioISO, meses) {
  const data = new Date(`${dataInicioISO}T00:00:00`);
  data.setMonth(data.getMonth() + meses);
  return data.toISOString().slice(0, 10);
}

// diasRestantes negativo = renovacao atrasada.
function diasAteRenovacao(dataRenovacaoISO, hoje = new Date()) {
  const renovacao = new Date(`${dataRenovacaoISO}T00:00:00`);
  const hojeSemHora = new Date(hoje.toISOString().slice(0, 10) + "T00:00:00");
  return Math.round((renovacao - hojeSemHora) / MS_POR_DIA);
}

function calcularAlertaRenovacao(diasRestantes) {
  if (diasRestantes < 0) return "atrasada";
  if (diasRestantes <= 30) return "30_dias";
  if (diasRestantes <= 60) return "60_dias";
  if (diasRestantes <= 90) return "90_dias";
  return null;
}

// Recebe um negocio "ganho" (dataInicio + mesesVigencia) e devolve os campos
// derivados que a tela "Meus Clientes" precisa exibir. mesesVigencia null
// (contrato "Indeterminado" no Pipedrive) nao tem como calcular renovacao -
// decisao confirmada em 2026-08-10: mostra o cliente sem alerta, em vez de
// inventar uma data (setMonth(x + null) silenciosamente vira setMonth(x)).
//
// dataRenovacaoManual (opcional): quando o vendedor fala com o cliente e ele
// confirma que vai continuar no plano, o vendedor pode adiar o lembrete pra
// daqui a X meses (ver lembreteService.js). Essa data manual sempre tem
// prioridade sobre o calculo automatico - decisao confirmada em 2026-08-11.
function calcularRenovacao(negocio, hoje = new Date(), dataRenovacaoManual = null) {
  if (dataRenovacaoManual) {
    const diasRestantes = diasAteRenovacao(dataRenovacaoManual, hoje);
    return {
      dataRenovacao: dataRenovacaoManual,
      diasRestantes,
      alerta: calcularAlertaRenovacao(diasRestantes),
      ajustadaManualmente: true,
    };
  }

  if (negocio.mesesVigencia == null) {
    return { dataRenovacao: null, diasRestantes: null, alerta: null, ajustadaManualmente: false };
  }
  const mesesAteRenovacao = negocio.mesesVigencia - MESES_ANTECEDENCIA_RENOVACAO;
  const dataRenovacao = calcularDataRenovacao(negocio.dataInicio, mesesAteRenovacao);
  const diasRestantes = diasAteRenovacao(dataRenovacao, hoje);
  return {
    dataRenovacao,
    diasRestantes,
    alerta: calcularAlertaRenovacao(diasRestantes),
    ajustadaManualmente: false,
  };
}

module.exports = { calcularDataRenovacao, diasAteRenovacao, calcularAlertaRenovacao, calcularRenovacao };
