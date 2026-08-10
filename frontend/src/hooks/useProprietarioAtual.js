import { useContext } from "react";
import { ProprietarioContext } from "../context/ProprietarioContext";

export function useProprietarioAtual() {
  const contexto = useContext(ProprietarioContext);
  if (!contexto) {
    throw new Error("useProprietarioAtual precisa estar dentro de <ProprietarioProvider>");
  }
  return contexto;
}
