import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useProprietarioAtual } from "../hooks/useProprietarioAtual";

// Login "de mentira" ate termos autenticacao real (Supabase Auth/JWT):
// so escolher um proprietario da lista simula a sessao dele.
export default function Login() {
  const [proprietarios, setProprietarios] = useState([]);
  const [erro, setErro] = useState(null);
  const { entrar } = useProprietarioAtual();
  const navegar = useNavigate();

  useEffect(() => {
    api.proprietarios().then(setProprietarios).catch((e) => setErro(e.message));
  }, []);

  function selecionar(id) {
    entrar(id);
    navegar("/dashboard");
  }

  if (erro) return <p className="erro">Nao foi possivel falar com o backend: {erro}</p>;

  return (
    <div className="login">
      <h1>Central de Renovacao e Reativacao Comercial</h1>
      <p>Selecione o usuario (login simulado, sem senha ainda):</p>
      <ul className="lista-proprietarios">
        {proprietarios.map((p) => (
          <li key={p.id}>
            <button onClick={() => selecionar(p.id)}>
              {p.nome} <span className="papel">({p.papel})</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
