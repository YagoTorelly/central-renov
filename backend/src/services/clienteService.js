const { negocioRepository, pessoaEmpresaRepository } = require("../data/repositories");
const { calcularRenovacao } = require("../domain/renovacao");

// Aba "Meus Clientes": pessoas/empresas com pelo menos um negocio ganho
// vinculado a esse proprietario (IDEIA.md - proprietario e do negocio, nao
// do cadastro da pessoa/empresa).
async function listarMeusClientes(proprietarioId) {
  const negocios = await negocioRepository.listarPorProprietario(proprietarioId);
  const negociosGanhos = negocios.filter((n) => n.status === "ganho");

  const clientes = [];
  for (const negocio of negociosGanhos) {
    const pessoaEmpresa = await pessoaEmpresaRepository.buscarPorId(negocio.pessoaEmpresaId);
    const renovacao = calcularRenovacao(negocio);
    clientes.push({
      negocioId: negocio.id,
      pessoaEmpresaId: pessoaEmpresa.id,
      nome: pessoaEmpresa.nome,
      tipo: pessoaEmpresa.tipo,
      documento: pessoaEmpresa.documento,
      telefone: pessoaEmpresa.telefone,
      email: pessoaEmpresa.email,
      seguradora: negocio.seguradora,
      produto: negocio.produto,
      dataInicio: negocio.dataInicio,
      mesesVigencia: negocio.mesesVigencia,
      ...renovacao,
    });
  }

  return clientes.sort((a, b) => a.diasRestantes - b.diasRestantes);
}

module.exports = { listarMeusClientes };
