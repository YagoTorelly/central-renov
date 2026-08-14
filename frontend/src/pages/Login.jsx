import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconAddressBook, IconBell, IconLink, IconRepeat } from "@tabler/icons-react";
import { api } from "../api";
import { useProprietarioAtual } from "../hooks/useProprietarioAtual";
import { logoWtg } from "../assets/logoWtg";

const PONTOS_EXPLICACAO = [
  {
    Icone: IconBell,
    titulo: "Renovações antecipadas",
    texto: "O sistema avisa 90/60/30 dias antes de cada contrato vencer, pra você nunca perder uma renovação.",
  },
  {
    Icone: IconRepeat,
    titulo: "Leads que ainda podem virar venda",
    texto: "Negócios parados são organizados por chance de conversão, com o motivo explicado.",
  },
  {
    Icone: IconLink,
    titulo: "Venda cruzada",
    texto: "Se um cliente seu já tem outro produto com um colega, o sistema avisa a oportunidade.",
  },
  {
    Icone: IconAddressBook,
    titulo: "Uma carteira só, sem duplicidade",
    texto: "Os dados vêm direto do Pipedrive, já organizados e sem contratos duplicados ou cancelados.",
  },
];

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
      <div className="login-topo">
        <img src={logoWtg} alt="WTG Corretora" />
        <h1>Central de Renovação e Reativação Comercial</h1>
        <p>
          Uma visão só da sua carteira: quem está perto de renovar, quem parou de responder e quem já é
          seu cliente em outro produto — tudo puxado direto do Pipedrive.
        </p>
      </div>

      <div className="explicacao-sistema">
        {PONTOS_EXPLICACAO.map((ponto) => (
          <div className="explicacao-item" key={ponto.titulo}>
            <ponto.Icone className="icone" size={28} stroke={1.75} />
            <h3>{ponto.titulo}</h3>
            <p>{ponto.texto}</p>
          </div>
        ))}
      </div>

      <div className="login-selecao">
        <h2>Entrar</h2>
        <p>Use o e-mail da WTG e a senha que foi entregue pra você.</p>
        {erro && <p className="erro">{erro}</p>}
        <form onSubmit={enviar} className="campo-formulario" style={{ display: "grid", gap: "0.8rem" }}>
          <div>
            <label>E-mail</label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seunome@wtgseguros.com.br"
            />
          </div>
          <div>
            <label>Senha</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
          <button className="botao botao-primario" type="submit" disabled={entrando}>
            {entrando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
