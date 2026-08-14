const { Schema, model } = require("mongoose");

const atividadeSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    negocioId: { type: String, index: true },
    proprietarioId: { type: String, index: true },
    tipo: String,
    resultado: String,
    data: String,
  },
  { versionKey: false }
);

module.exports = model("Atividade", atividadeSchema);
