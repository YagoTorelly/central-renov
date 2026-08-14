const {
  negocioRepository,
  pessoaEmpresaRepository,
  lembreteRepository,
  proprietarioRepository,
} = require("../data/repositories");
const { calcularRenovacao } = require("../domain/renovacao");
const { linkNegocioPipedrive } = require("../utils/pipedriveLink");

const VISUALIZAR_TODOS = "todos";

// Aba "Meus Clientes": pessoas/empresas com pelo menos um negocio ganho
// vinculado a esse proprietario (IDEIA.md - proprietario e do negocio, nao
// do cadastro da pessoa/empresa). proprietarioId="todos" e um modo especial
// so pra admin (ver a carteira inteira, com o nome de quem e dono de cada
// negocio) - decisao confirmada em 2026-08-13.
async function listarMeusClientes(proprietarioId) {
  const verTodos = proprietarioId === VISUALIZAR_TODOS;
  const negocios = verTodos
    ? await negocioRepository.listar()
    : await negocioRepository.listarPorProprietario(proprietarioId);
  const negociosGanhos = negocios.filter((n) => n.status === "ganho");

  const clientes = [];
  for (const negocio of negociosGanhos) {
    const pessoaEmpresa = await pessoaEmpresaRepository.buscarPorId(negocio.pessoaEmpresaId);
    const lembrete = await lembreteRepository.buscarPorNegocio(negocio.id);
    const renovacao = calcularRenovacao(negocio, new Date(), lembrete?.novaDataRenovacao);
    let proprietarioNome = null;
    if (verTodos) {
      const proprietario = await proprietarioRepository.buscarPorId(negocio.proprietarioId);
      proprietarioNome = proprietario?.nome || null;
    }
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
      valor: negocio.valor ?? null,
      moeda: negocio.moeda || "BRL",
      linkPipedrive: linkNegocioPipedrive(negocio.pipedriveDealId),
      lembreteMotivo: lembrete?.motivo || null,
      proprietarioNome,
      ...renovacao,
    });
  }

  // diasRestantes null (contrato indeterminado) vai pro fim da lista -
  // renovacoes com data calculavel aparecem primeiro, ordenadas por urgencia.
  return clientes.sort((a, b) => (a.diasRestantes ?? Infinity) - (b.diasRestantes ?? Infinity));
}

module.exports = { listarMeusClientes };
