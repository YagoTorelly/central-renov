const { pessoaEmpresaRepository, negocioRepository } = require("../data/repositories");
const { encontrarDuplicidadesExatas } = require("../domain/duplicidade");

// Tela "Administracao > Possiveis duplicidades": so o admin ve, decide
// "mesma pessoa" / "pessoas diferentes" / "unificar cadastro" (decisao fica
// manual por enquanto, como recomenda o IDEIA.md).
async function listarPossiveisDuplicidades() {
  const pessoasEmpresas = await pessoaEmpresaRepository.listar();
  const duplicidades = encontrarDuplicidadesExatas(pessoasEmpresas);

  const resultado = [];
  for (const duplicidade of duplicidades) {
    const cadastrosComProprietarios = [];
    for (const cadastro of duplicidade.cadastros) {
      const negocios = await negocioRepository.listarPorPessoaEmpresa(cadastro.id);
      cadastrosComProprietarios.push({
        ...cadastro,
        proprietariosEnvolvidos: [...new Set(negocios.map((n) => n.proprietarioId))],
      });
    }
    resultado.push({ ...duplicidade, cadastros: cadastrosComProprietarios });
  }
  return resultado;
}

module.exports = { listarPossiveisDuplicidades };
