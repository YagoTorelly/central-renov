import { createContext, useState } from "react";

const CHAVE_TOKEN = "central_renov_token";
const CHAVE_ID = "central_renov_proprietario_id";
const CHAVE_NOME = "central_renov_proprietario_nome";
const CHAVE_PAPEL = "central_renov_proprietario_papel";
const VISUALIZAR_TODOS = "todos";

export const ProprietarioContext = createContext(null);

// Login de verdade (e-mail + senha, token JWT) desde 2026-08-13. O token
// e o que autentica cada chamada (ver api/index.js); id/nome/papel ficam
// aqui so pra exibir na tela sem precisar decodificar o token toda hora.
//
// visualizandoComoId: so admin pode mudar - comeca em "todos" (ve a
// carteira inteira) e pode filtrar pra um proprietario especifico.
// Proprietario comum sempre ve so a propria carteira, sem essa opcao.
export function ProprietarioProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(CHAVE_TOKEN));
  const [proprietarioId, setProprietarioId] = useState(() => localStorage.getItem(CHAVE_ID));
  const [proprietarioNome, setProprietarioNome] = useState(() => localStorage.getItem(CHAVE_NOME));
  const [proprietarioPapel, setProprietarioPapel] = useState(() => localStorage.getItem(CHAVE_PAPEL));
  const [visualizandoComoId, setVisualizandoComoId] = useState(() => {
    const papel = localStorage.getItem(CHAVE_PAPEL);
    const id = localStorage.getItem(CHAVE_ID);
    return papel === "admin" ? VISUALIZAR_TODOS : id;
  });

  function entrar({ token, proprietario }) {
    localStorage.setItem(CHAVE_TOKEN, token);
    localStorage.setItem(CHAVE_ID, proprietario.id);
    localStorage.setItem(CHAVE_NOME, proprietario.nome);
    localStorage.setItem(CHAVE_PAPEL, proprietario.papel);
    setToken(token);
    setProprietarioId(proprietario.id);
    setProprietarioNome(proprietario.nome);
    setProprietarioPapel(proprietario.papel);
    setVisualizandoComoId(proprietario.papel === "admin" ? VISUALIZAR_TODOS : proprietario.id);
  }

  function sair() {
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_ID);
    localStorage.removeItem(CHAVE_NOME);
    localStorage.removeItem(CHAVE_PAPEL);
    setToken(null);
    setProprietarioId(null);
    setProprietarioNome(null);
    setProprietarioPapel(null);
    setVisualizandoComoId(null);
  }

  function definirVisualizandoComo(id) {
    if (proprietarioPapel !== "admin") return;
    setVisualizandoComoId(id);
  }

  return (
    <ProprietarioContext.Provider
      value={{
        token,
        proprietarioId,
        proprietarioNome,
        proprietarioPapel,
        visualizandoComoId,
        definirVisualizandoComo,
        entrar,
        sair,
      }}
    >
      {children}
    </ProprietarioContext.Provider>
  );
}
