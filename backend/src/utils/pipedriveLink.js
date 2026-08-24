// Subdominio da conta Pipedrive da WTG (visto em /users/me durante a
// investigacao dos campos, sessao 2026-08-10). Nao e segredo, so o nome da
// empresa na URL do Pipedrive.
const DOMINIO_PIPEDRIVE = "wtgseguros";

function linkNegocioPipedrive(pipedriveDealId) {
  if (!pipedriveDealId) return null;
  return `https://${DOMINIO_PIPEDRIVE}.pipedrive.com/deal/${pipedriveDealId}`;
}

// Botao "Renovar": abre a janela "Adicionar negocio" do Pipedrive ja com a
// organizacao/pessoa de contato e o titulo preenchidos, pra o vendedor so
// completar valor/vigencia em vez de recadastrar o cliente na mao.
// O id interno da Central e "org:6"/"person:37" - o Pipedrive espera o
// numero puro em org_id/person_id.
function linkNovoNegocioPipedrive({ pessoaEmpresaId, nome, produto, seguradora }) {
  if (!pessoaEmpresaId) return null;
  const [tipo, id] = String(pessoaEmpresaId).split(":");
  if (!id) return null;

  const parametros = new URLSearchParams();
  parametros.set(tipo === "org" ? "org_id" : "person_id", id);
  const titulo = [nome, produto, seguradora].filter(Boolean).join(" - ");
  if (titulo) parametros.set("title", titulo);

  return `https://${DOMINIO_PIPEDRIVE}.pipedrive.com/deal/new?${parametros.toString()}`;
}

module.exports = { linkNegocioPipedrive, linkNovoNegocioPipedrive };
