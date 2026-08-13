const { dataSource } = require("../../config/env");

// Unico ponto de troca de fonte de dados. Cada modulo expoe a mesma
// interface (listar/buscarPorId/etc); quando o Postgres/Mongo entrar,
// criar proprietarioRepository.pg.js etc. e adicionar o caso aqui.
//
// atividadeRepository fica sempre na implementacao mock (em memoria):
// registro de contato e dado proprio da Central, nao vem do Pipedrive nem
// de nenhuma fonte externa - nao ha "cache" pra ele ainda, so um banco real
// no futuro.
const FONTES = {
  mock: () => ({
    proprietarioRepository: require("./proprietarioRepository.mock"),
    pessoaEmpresaRepository: require("./pessoaEmpresaRepository.mock"),
    negocioRepository: require("./negocioRepository.mock"),
  }),
  "pipedrive-cache": () => ({
    proprietarioRepository: require("./proprietarioRepository.cache"),
    pessoaEmpresaRepository: require("./pessoaEmpresaRepository.cache"),
    negocioRepository: require("./negocioRepository.cache"),
  }),
};

if (!FONTES[dataSource]) {
  throw new Error(
    `DATA_SOURCE="${dataSource}" nao implementado. Use "mock", "pipedrive-cache" ou adicione a fonte em data/repositories/index.js.`
  );
}

module.exports = {
  ...FONTES[dataSource](),
  atividadeRepository: require("./atividadeRepository.mock"),
  lembreteRepository: require("./lembreteRepository.mock"),
};
