const Usuario = require("../models/Usuario");

const SEM_ID_INTERNO = { _id: 0 };

async function buscarPorProprietarioId(proprietarioId) {
  return Usuario.findOne({ proprietarioId }, SEM_ID_INTERNO).lean();
}

async function listarTodos() {
  const usuarios = await Usuario.find({}, SEM_ID_INTERNO).lean();
  return Object.fromEntries(usuarios.map((u) => [u.proprietarioId, u]));
}

// $set (merge), nao substitui o documento - editar email nao pode apagar a
// senha ja definida (e vice-versa), mesma regra do usuarioRepository.js atual.
async function atualizar(proprietarioId, campos) {
  const atualizadoEm = new Date().toISOString();
  await Usuario.findOneAndUpdate(
    { proprietarioId },
    { $set: { ...campos, atualizadoEm } },
    { upsert: true }
  );
  return buscarPorProprietarioId(proprietarioId);
}

module.exports = { buscarPorProprietarioId, listarTodos, atualizar };
