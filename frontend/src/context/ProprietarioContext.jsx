import { createContext, useState } from "react";

const CHAVE_STORAGE = "central_renov_proprietario_id";

export const ProprietarioContext = createContext(null);

// Login "de mentira" ate termos autenticacao real (Supabase Auth/JWT):
// guarda o proprietario escolhido em contexto (com persistencia simples em
// localStorage pra sobreviver a um F5) em vez de acoplar cada pagina direto
// no navegador.
export function ProprietarioProvider({ children }) {
  const [proprietarioId, setProprietarioIdState] = useState(() =>
    localStorage.getItem(CHAVE_STORAGE)
  );

  function entrar(id) {
    localStorage.setItem(CHAVE_STORAGE, id);
    setProprietarioIdState(id);
  }

  function sair() {
    localStorage.removeItem(CHAVE_STORAGE);
    setProprietarioIdState(null);
  }

  return (
    <ProprietarioContext.Provider value={{ proprietarioId, entrar, sair }}>
      {children}
    </ProprietarioContext.Provider>
  );
}
