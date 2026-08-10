const { normalizarDocumento } = require("../utils/documentos");

// MVP (ver nota de escopo no IDEIA.md): so match exato de CPF/CNPJ.
// O scoring fuzzy por telefone/nome/e-mail fica pra depois de validar a
// ideia com os proprietarios - e a parte que mais historicamente vira
// poco sem fundo nesse tipo de projeto.
function encontrarDuplicidadesExatas(pessoasEmpresas) {
  const porDocumento = new Map();
  for (const pessoa of pessoasEmpresas) {
    const documento = normalizarDocumento(pessoa.documento);
    if (!documento) continue;
    if (!porDocumento.has(documento)) porDocumento.set(documento, []);
    porDocumento.get(documento).push(pessoa);
  }

  const duplicidades = [];
  for (const [documento, cadastros] of porDocumento) {
    if (cadastros.length > 1) {
      duplicidades.push({ documento, confianca: 100, cadastros });
    }
  }
  return duplicidades;
}

module.exports = { encontrarDuplicidadesExatas };
