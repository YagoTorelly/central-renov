const { dataSource } = require("../../config/env");

// Unico ponto de troca de fonte de dados. Cada modulo expoe a mesma
// interface (listar/buscarPorId/etc).
//
// "mongo" e o banco real (producao): os 6 repositorios vem do MongoDB.
// "mock"/"pipedrive-cache" continuam servindo pra dev/teste local sem
// precisar de banco - nesses dois, atividade/lembrete/usuario ficam na
// implementacao mock (em memoria ou arquivo local), como sempre foi.
const FONTES = {
  mock: () => ({
    proprietarioRepository: require("./proprietarioRepository.mock"),
    pessoaEmpresaRepository: require("./pessoaEmpresaRepository.mock"),
    negocioRepository: require("./negocioRepository.mock"),
    atividadeRepository: require("./atividadeRepository.mock"),
    lembreteRepository: require("./lembreteRepository.mock"),
    usuarioRepository: require("./usuarioRepository"),
  }),
  "pipedrive-cache": () => ({
    proprietarioRepository: require("./proprietarioRepository.cache"),
    pessoaEmpresaRepository: require("./pessoaEmpresaRepository.cache"),
    negocioRepository: require("./negocioRepository.cache"),
    atividadeRepository: require("./atividadeRepository.mock"),
    lembreteRepository: require("./lembreteRepository.mock"),
    usuarioRepository: require("./usuarioRepository"),
  }),
  mongo: () => ({
    proprietarioRepository: require("./proprietarioRepository.mongo"),
    pessoaEmpresaRepository: require("./pessoaEmpresaRepository.mongo"),
    negocioRepository: require("./negocioRepository.mongo"),
    atividadeRepository: require("./atividadeRepository.mongo"),
    lembreteRepository: require("./lembreteRepository.mongo"),
    usuarioRepository: require("./usuarioRepository.mongo"),
  }),
};

if (!FONTES[dataSource]) {
  throw new Error(
    `DATA_SOURCE="${dataSource}" nao implementado. Use "mock", "pipedrive-cache", "mongo" ou adicione a fonte em data/repositories/index.js.`
  );
}

module.exports = FONTES[dataSource]();
