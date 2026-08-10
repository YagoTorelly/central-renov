import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useProprietarioAtual } from "../hooks/useProprietarioAtual";
import { logoWtg } from "../assets/logoWtg";

const PONTOS_EXPLICACAO = [
  {
    icone: "🔔",
    titulo: "Renovações antecipadas",
    texto: "O sistema avisa 90/60/30 dias antes de cada contrato vencer, pra você nunca perder uma renovação.",
  },
  {
    icone: "🔁",
    titulo: "Leads que ainda podem virar venda",
    texto: "Negócios parados ou perdidos são organizados por chance de conversão, com o motivo explicado.",
  },
  {
    icone: "🔗",
    titulo: "Venda cruzada",
    texto: "Se um cliente seu já tem outro produto com um colega, o sistema avisa a oportunidade.",
  },
  {
    icone: "📇",
    titulo: "Uma carteira só, sem duplicidade",
    texto: "Os dados vêm direto do Pipedrive, já organizados e sem contratos duplicados ou cancelados.",
  },
];

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

  function selecionar(proprietario) {
    entrar(proprietario);
    navegar("/dashboard");
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
            <span className="icone">{ponto.icone}</span>
            <h3>{ponto.titulo}</h3>
            <p>{ponto.texto}</p>
          </div>
        ))}
      </div>

      <div className="login-selecao">
        <h2>Entrar</h2>
        <p>Selecione seu usuário (login simulado, sem senha ainda):</p>
        {erro && <p className="erro">Não foi possível falar com o backend: {erro}</p>}
        <ul className="lista-proprietarios">
          {proprietarios.map((p) => (
            <li key={p.id}>
              <button onClick={() => selecionar(p)}>
                {p.nome}
                <span className="papel">{p.papel === "admin" ? "administrador" : "proprietário"}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
