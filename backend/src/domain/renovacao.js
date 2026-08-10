const MS_POR_DIA = 1000 * 60 * 60 * 24;

function calcularDataRenovacao(dataInicioISO, mesesVigencia) {
  const data = new Date(`${dataInicioISO}T00:00:00`);
  data.setMonth(data.getMonth() + mesesVigencia);
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
// derivados que a tela "Meus Clientes" precisa exibir.
function calcularRenovacao(negocio, hoje = new Date()) {
  const dataRenovacao = calcularDataRenovacao(negocio.dataInicio, negocio.mesesVigencia);
  const diasRestantes = diasAteRenovacao(dataRenovacao, hoje);
  return {
    dataRenovacao,
    diasRestantes,
    alerta: calcularAlertaRenovacao(diasRestantes),
  };
}

module.exports = { calcularDataRenovacao, diasAteRenovacao, calcularAlertaRenovacao, calcularRenovacao };
