const API_URL = import.meta.env.VITE_API_URL;
const CHAVE_TOKEN = "central_renov_token";

async function pedir(caminho, opcoes) {
  const token = localStorage.getItem(CHAVE_TOKEN);
  const resposta = await fetch(`${API_URL}${caminho}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...opcoes,
  });
  if (resposta.status === 401) {
    // sessao expirou ou token invalido - manda pra tela de login de novo.
    localStorage.removeItem(CHAVE_TOKEN);
    if (window.location.pathname !== "/") window.location.href = "/";
  }
  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(erro.erro || `Erro ${resposta.status} ao chamar ${caminho}`);
  }
  return resposta.json();
}

export const api = {
  login: (email, senha) => pedir("/api/auth/login", { method: "POST", body: JSON.stringify({ email, senha }) }),
  dashboard: (proprietarioId) => pedir(`/api/dashboard/${proprietarioId}`),
  meusClientes: (proprietarioId) => pedir(`/api/clientes/${proprietarioId}`),
  leadsParados: (proprietarioId) => pedir(`/api/leads/${proprietarioId}`),
  atividades: (proprietarioId) => pedir(`/api/atividades/${proprietarioId}`),
  duplicidades: () => pedir("/api/admin/duplicidades"),
  visaoGeral: () => pedir("/api/admin/visao-geral"),
  resumoProprietarios: () => pedir("/api/admin/resumo-proprietarios"),
  usuarios: () => pedir("/api/admin/usuarios"),
  redefinirSenha: (proprietarioId, novaSenha) =>
    pedir(`/api/admin/proprietarios/${proprietarioId}/senha`, {
      method: "POST",
      body: JSON.stringify({ novaSenha }),
    }),
  editarEmail: (proprietarioId, novoEmail) =>
    pedir(`/api/admin/proprietarios/${proprietarioId}/email`, {
      method: "POST",
      body: JSON.stringify({ novoEmail }),
    }),
  registrarAtividade: (dados) =>
    pedir("/api/atividades", { method: "POST", body: JSON.stringify(dados) }),
  agendarLembrete: (dados) =>
    pedir("/api/lembretes", { method: "POST", body: JSON.stringify(dados) }),
};
