const { Schema, model } = require("mongoose");

const proprietarioSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    nome: String,
    email: String,
    papel: String,
  },
  { versionKey: false }
);

module.exports = model("Proprietario", proprietarioSchema);
