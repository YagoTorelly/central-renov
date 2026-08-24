const { Schema, model } = require("mongoose");

// Um lembrete por negocio - um novo lembrete substitui o anterior, mesma
// semantica do Map em lembreteRepository.mock.js.
const lembreteSchema = new Schema(
  {
    negocioId: { type: String, required: true, unique: true },
    proprietarioId: String,
    novaDataRenovacao: String,
    // true = cliente nao quis mexer no contrato e nao deu prazo: fica sem
    // data de renovacao e sem alerta (ver domain/renovacao.js).
    indeterminado: { type: Boolean, default: false },
    motivo: String,
    criadoEm: String,
  },
  { versionKey: false }
);

module.exports = model("Lembrete", lembreteSchema);
