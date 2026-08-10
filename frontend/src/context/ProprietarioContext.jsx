import { createContext, useState } from "react";

const CHAVE_ID = "central_renov_proprietario_id";
const CHAVE_NOME = "central_renov_proprietario_nome";
const CHAVE_PAPEL = "central_renov_proprietario_papel";

export const ProprietarioContext = createContext(null);

// Login "de mentira" ate termos autenticacao real (Supabase Auth/JWT):
// guarda o proprietario escolhido em contexto (com persistencia simples em
// localStorage pra sobreviver a um F5) em vez de acoplar cada pagina direto
// no navegador. Guarda nome/papel tambem - o id do Pipedrive sozinho nao
// diz nada pra quem esta usando o sistema.
export function ProprietarioProvider({ children }) {
  const [proprietarioId, setProprietarioId] = useState(() => localStorage.getItem(CHAVE_ID));
  const [proprietarioNome, setProprietarioNome] = useState(() => localStorage.getItem(CHAVE_NOME));
  const [proprietarioPapel, setProprietarioPapel] = useState(() => localStorage.getItem(CHAVE_PAPEL));

  function entrar({ id, nome, papel }) {
    localStorage.setItem(CHAVE_ID, id);
    localStorage.setItem(CHAVE_NOME, nome);
    localStorage.setItem(CHAVE_PAPEL, papel);
    setProprietarioId(id);
    setProprietarioNome(nome);
    setProprietarioPapel(papel);
  }

  function sair() {
    localStorage.removeItem(CHAVE_ID);
    localStorage.removeItem(CHAVE_NOME);
    localStorage.removeItem(CHAVE_PAPEL);
    setProprietarioId(null);
    setProprietarioNome(null);
    setProprietarioPapel(null);
  }

  return (
    <ProprietarioContext.Provider
      value={{ proprietarioId, proprietarioNome, proprietarioPapel, entrar, sair }}
    >
      {children}
    </ProprietarioContext.Provider>
  );
}
