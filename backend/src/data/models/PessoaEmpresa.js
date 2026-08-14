const { Schema, model } = require("mongoose");

const pessoaEmpresaSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    tipo: String,
    nome: String,
    documento: String,
    telefone: String,
    email: String,
  },
  { versionKey: false }
);

module.exports = model("PessoaEmpresa", pessoaEmpresaSchema);
