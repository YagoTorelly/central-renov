import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useProprietarioAtual } from "../hooks/useProprietarioAtual";
import { logoWtg } from "../assets/logoWtg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(null);
  const [entrando, setEntrando] = useState(false);
  const { entrar } = useProprietarioAtual();
  const navegar = useNavigate();

  async function enviar(evento) {
    evento.preventDefault();
    setErro(null);
    setEntrando(true);
    try {
      const resultado = await api.login(email, senha);
      entrar(resultado);
      navegar("/dashboard");
    } catch (e) {
      setErro(e.message);
    } finally {
      setEntrando(false);
    }
  }

  return (
    <div className="tela-login">
      <div className="login-marca">
        <div className="login-marca-conteudo">
          <img src={logoWtg} alt="WTG Corretora" className="login-marca-logo" width="120" height="34" />
          <span className="login-marca-linha" aria-hidden="true" />
          <span className="login-marca-eyebrow">Comercial · Renovação e Reativação</span>
          <h1>Sua carteira inteira, num só lugar.</h1>
          <p>Renovações, leads parados e vendas cruzadas — direto do Pipedrive, sem planilha.</p>
        </div>
      </div>

      <div className="login-formulario">
        <div className="login-formulario-conteudo">
          <h2>Entrar</h2>
          <p>Use o e-mail da WTG e a senha que foi entregue pra você.</p>
          {erro && (
            <p className="erro" role="alert" aria-live="polite">
              {erro}
            </p>
          )}
          <form onSubmit={enviar} className="campo-formulario">
            <div>
              <label htmlFor="login-email">E-mail</label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                autoComplete="username"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seunome@wtgseguros.com.br"
              />
            </div>
            <div>
              <label htmlFor="login-senha">Senha</label>
              <input
                id="login-senha"
                name="senha"
                type="password"
                required
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            <button className="botao botao-primario" type="submit" disabled={entrando}>
              {entrando ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
