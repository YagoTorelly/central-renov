const API_URL = import.meta.env.VITE_API_URL;

async function pedir(caminho, opcoes) {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    headers: { "Content-Type": "application/json" },
    ...opcoes,
  });
  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(erro.erro || `Erro ${resposta.status} ao chamar ${caminho}`);
  }
  return resposta.json();
}

export const api = {
  proprietarios: () => pedir("/api/admin/proprietarios"),
  dashboard: (proprietarioId) => pedir(`/api/dashboard/${proprietarioId}`),
  meusClientes: (proprietarioId) => pedir(`/api/clientes/${proprietarioId}`),
  leadsParados: (proprietarioId) => pedir(`/api/leads/${proprietarioId}`),
  atividades: (proprietarioId) => pedir(`/api/atividades/${proprietarioId}`),
  duplicidades: () => pedir("/api/admin/duplicidades"),
  registrarAtividade: (dados) =>
    pedir("/api/atividades", { method: "POST", body: JSON.stringify(dados) }),
  agendarLembrete: (dados) =>
    pedir("/api/lembretes", { method: "POST", body: JSON.stringify(dados) }),
};
