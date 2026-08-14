const { Schema, model } = require("mongoose");

// Credencial/override do proprietario - dado sensivel proprio da Central,
// nunca vem do Pipedrive (ver usuarioRepository.js atual). emailOverride/
// papelOverride tem precedencia sobre o que veio sincronizado.
const usuarioSchema = new Schema(
  {
    proprietarioId: { type: String, required: true, unique: true },
    senhaHash: String,
    emailOverride: String,
    papelOverride: String,
    atualizadoEm: String,
  },
  { versionKey: false }
);

module.exports = model("Usuario", usuarioSchema);
