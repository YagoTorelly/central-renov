// Pontuacao dos criterios descritos no IDEIA.md (aba "Leads Parados").
// Cada motivo fica registrado para a tela poder explicar a classificacao,
// nao so mostrar "quente"/"morno"/"frio" sem contexto.
function classificarLead({ pessoaEmpresa, negocio, jaClienteEmOutroProduto, diasSemMovimentacao }) {
  let pontuacao = 0;
  const motivos = [];

  if (jaClienteEmOutroProduto) {
    pontuacao += 3;
    motivos.push("ja e cliente da corretora em outro produto");
  }
  if (pessoaEmpresa.telefone) {
    pontuacao += 2;
    motivos.push("tem telefone/whatsapp cadastrado");
  }
  if (pessoaEmpresa.email) {
    pontuacao += 1;
    motivos.push("tem e-mail cadastrado");
  }
  if (negocio.propostaEnviada) {
    pontuacao += 1;
    motivos.push("recebeu proposta");
  }
  if (!pessoaEmpresa.telefone && !pessoaEmpresa.email) {
    pontuacao -= 2;
    motivos.push("sem telefone e sem e-mail");
  }
  if (diasSemMovimentacao > 150) {
    pontuacao -= 1;
    motivos.push("negocio muito antigo, sem movimentacao ha mais de 150 dias");
  }

  let classificacao;
  if (pontuacao >= 5) classificacao = "quente";
  else if (pontuacao <= 0) classificacao = "frio";
  else classificacao = "morno";

  return { classificacao, pontuacao, motivos };
}

module.exports = { classificarLead };
