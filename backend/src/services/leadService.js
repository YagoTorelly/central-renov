const { negocioRepository, pessoaEmpresaRepository } = require("../data/repositories");
const { classificarLead } = require("../domain/leadScoring");

const MS_POR_DIA = 1000 * 60 * 60 * 24;

function diasSemMovimentacao(ultimaMovimentacaoISO, hoje = new Date()) {
  const ultima = new Date(`${ultimaMovimentacaoISO}T00:00:00`);
  const hojeSemHora = new Date(hoje.toISOString().slice(0, 10) + "T00:00:00");
  return Math.round((hojeSemHora - ultima) / MS_POR_DIA);
}

// Aba "Leads Parados": negocios abertos desse proprietario. Negocio perdido
// e descartado ja na sincronizacao (nao chega a virar cache) - decisao
// confirmada em 2026-08-13. Cruza com negocios ganhos da MESMA pessoa/
// empresa em QUALQUER proprietario pra detectar venda cruzada (exemplo do
// IDEIA.md: saude ganho com A, vida parado com B).
async function listarLeadsParados(proprietarioId) {
  const negociosDoProprietario = await negocioRepository.listarPorProprietario(proprietarioId);
  const candidatos = negociosDoProprietario.filter((n) => n.status === "aberto");

  const leads = [];
  for (const negocio of candidatos) {
    const pessoaEmpresa = await pessoaEmpresaRepository.buscarPorId(negocio.pessoaEmpresaId);
    const outrosNegocios = await negocioRepository.listarPorPessoaEmpresa(negocio.pessoaEmpresaId);
    const negocioGanhoEmOutroProduto = outrosNegocios.find(
      (n) => n.id !== negocio.id && n.status === "ganho"
    );

    const dias = diasSemMovimentacao(negocio.ultimaMovimentacao);
    const { classificacao, pontuacao, motivos } = classificarLead({
      pessoaEmpresa,
      negocio,
      jaClienteEmOutroProduto: Boolean(negocioGanhoEmOutroProduto),
      diasSemMovimentacao: dias,
    });

    leads.push({
      negocioId: negocio.id,
      pessoaEmpresaId: pessoaEmpresa.id,
      nome: pessoaEmpresa.nome,
      telefone: pessoaEmpresa.telefone,
      email: pessoaEmpresa.email,
      seguradora: negocio.seguradora,
      produto: negocio.produto,
      status: negocio.status,
      diasSemMovimentacao: dias,
      classificacao,
      pontuacao,
      motivos,
      oportunidadeVendaCruzada: negocioGanhoEmOutroProduto
        ? {
            mensagem: `Cliente ativo em ${negocioGanhoEmOutroProduto.produto}. Oportunidade parada em ${negocio.produto}.`,
            produtoAtivo: negocioGanhoEmOutroProduto.produto,
            proprietarioProdutoAtivo: negocioGanhoEmOutroProduto.proprietarioId,
          }
        : null,
    });
  }

  return leads.sort((a, b) => b.pontuacao - a.pontuacao);
}

module.exports = { listarLeadsParados };
