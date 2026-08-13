import { createContext, useState } from "react";

const CHAVE_TOKEN = "central_renov_token";
const CHAVE_ID = "central_renov_proprietario_id";
const CHAVE_NOME = "central_renov_proprietario_nome";
const CHAVE_PAPEL = "central_renov_proprietario_papel";

export const ProprietarioContext = createContext(null);

// Login de verdade (e-mail + senha, token JWT) desde 2026-08-13. O token
// e o que autentica cada chamada (ver api/index.js); id/nome/papel ficam
// aqui so pra exibir na tela sem precisar decodificar o token toda hora.
export function ProprietarioProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(CHAVE_TOKEN));
  const [proprietarioId, setProprietarioId] = useState(() => localStorage.getItem(CHAVE_ID));
  const [proprietarioNome, setProprietarioNome] = useState(() => localStorage.getItem(CHAVE_NOME));
  const [proprietarioPapel, setProprietarioPapel] = useState(() => localStorage.getItem(CHAVE_PAPEL));

  function entrar({ token, proprietario }) {
    localStorage.setItem(CHAVE_TOKEN, token);
    localStorage.setItem(CHAVE_ID, proprietario.id);
    localStorage.setItem(CHAVE_NOME, proprietario.nome);
    localStorage.setItem(CHAVE_PAPEL, proprietario.papel);
    setToken(token);
    setProprietarioId(proprietario.id);
    setProprietarioNome(proprietario.nome);
    setProprietarioPapel(proprietario.papel);
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
  }

  return (
    <ProprietarioContext.Provider
      value={{ token, proprietarioId, proprietarioNome, proprietarioPapel, entrar, sair }}
    >
      {children}
    </ProprietarioContext.Provider>
  );
}
