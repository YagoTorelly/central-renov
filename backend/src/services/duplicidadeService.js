const { pessoaEmpresaRepository, negocioRepository, proprietarioRepository } = require("../data/repositories");
const { encontrarDuplicidadesExatas } = require("../domain/duplicidade");

// Tela "Administracao > Possiveis duplicidades": so o admin ve, decide
// "mesma pessoa" / "pessoas diferentes" / "unificar cadastro" (decisao fica
// manual por enquanto, como recomenda o IDEIA.md).
async function listarPossiveisDuplicidades() {
  const pessoasEmpresas = await pessoaEmpresaRepository.listar();
  const proprietarios = await proprietarioRepository.listar();
  // mostra o nome em vez do id cru - ninguem decora o id do pipedrive de
  // cada vendedor so de olhar a tela.
  const nomePorId = new Map(proprietarios.map((p) => [p.id, p.nome]));
  const duplicidades = encontrarDuplicidadesExatas(pessoasEmpresas);

  const resultado = [];
  for (const duplicidade of duplicidades) {
    const cadastrosComProprietarios = [];
    for (const cadastro of duplicidade.cadastros) {
      const negocios = await negocioRepository.listarPorPessoaEmpresa(cadastro.id);
      const idsUnicos = [...new Set(negocios.map((n) => n.proprietarioId))];
      cadastrosComProprietarios.push({
        ...cadastro,
        proprietariosEnvolvidos: idsUnicos.map((id) => nomePorId.get(id) || id),
      });
    }
    resultado.push({ ...duplicidade, cadastros: cadastrosComProprietarios });
  }
  return resultado;
}

module.exports = { listarPossiveisDuplicidades };
