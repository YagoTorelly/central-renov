// Formata valor numerico pro padrao brasileiro (R$ 1.234,56). Usa Intl em
// vez de montar a string na mao, pra nao errar separador de milhar/decimal.
export function formatarMoeda(valor, moeda = "BRL") {
  if (valor === null || valor === undefined || valor === 0) return "-";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda }).format(valor);
}
