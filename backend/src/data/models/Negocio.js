const { Schema, model } = require("mongoose");

const negocioSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    pipedriveDealId: Number,
    pessoaEmpresaId: { type: String, index: true },
    proprietarioId: { type: String, index: true },
    seguradora: String,
    produto: String,
    status: String,
    valor: Number,
    moeda: String,
    dataInicio: String,
    mesesVigencia: Number,
    ultimaMovimentacao: String,
  },
  { versionKey: false }
);

module.exports = model("Negocio", negocioSchema);
