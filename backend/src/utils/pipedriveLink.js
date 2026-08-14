// Subdominio da conta Pipedrive da WTG (visto em /users/me durante a
// investigacao dos campos, sessao 2026-08-10). Nao e segredo, so o nome da
// empresa na URL do Pipedrive.
const DOMINIO_PIPEDRIVE = "wtgseguros";

function linkNegocioPipedrive(pipedriveDealId) {
  if (!pipedriveDealId) return null;
  return `https://${DOMINIO_PIPEDRIVE}.pipedrive.com/deal/${pipedriveDealId}`;
}

module.exports = { linkNegocioPipedrive };
