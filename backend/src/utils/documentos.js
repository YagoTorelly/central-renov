// Helper generico (nao e regra de negocio) - fica isolado em utils/ pra
// poder ser reaproveitado fora do contexto de duplicidade tambem (ex:
// validacao de CPF/CNPJ na entrada de um cadastro novo).
function normalizarDocumento(valor) {
  if (!valor) return "";
  return String(valor).replace(/\D/g, "");
}

module.exports = { normalizarDocumento };
