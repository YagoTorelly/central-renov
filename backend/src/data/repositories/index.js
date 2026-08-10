const { dataSource } = require("../../config/env");

// Unico ponto de troca entre mock e banco real. Cada modulo abaixo expoe a
// mesma interface (listar/buscarPorId/etc); quando o Postgres/Mongo entrar,
// criar proprietarioRepository.pg.js etc. e adicionar o caso aqui.
if (dataSource !== "mock") {
  throw new Error(
    `DATA_SOURCE="${dataSource}" ainda nao implementado. Use "mock" ou adicione a implementacao real em data/repositories/.`
  );
}

module.exports = {
  proprietarioRepository: require("./proprietarioRepository.mock"),
  pessoaEmpresaRepository: require("./pessoaEmpresaRepository.mock"),
  negocioRepository: require("./negocioRepository.mock"),
  atividadeRepository: require("./atividadeRepository.mock"),
};
