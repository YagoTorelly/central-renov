// Converte "2025-08-10" (formato da API) para "10/08/2025" (formato exibido
// nas telas, igual ao exemplo de tabela do IDEIA.md).
export function formatarDataBR(dataISO) {
  if (!dataISO) return "-";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}
