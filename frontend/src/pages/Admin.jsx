import { useEffect, useState } from "react";
import { api } from "../api";

const ABAS = [
  { chave: "geral", rotulo: "Visão geral" },
  { chave: "proprietarios", rotulo: "Por proprietário" },
  { chave: "duplicidades", rotulo: "Possíveis duplicidades" },
];

export default function Admin() {
  const [aba, setAba] = useState("geral");
  const [visaoGeral, setVisaoGeral] = useState(null);
  const [resumoProprietarios, setResumoProprietarios] = useState([]);
  const [duplicidades, setDuplicidades] = useState([]);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api.visaoGeral().then(setVisaoGeral).catch((e) => setErro(e.message));
    api.resumoProprietarios().then(setResumoProprietarios).catch((e) => setErro(e.message));
    api.duplicidades().then(setDuplicidades).catch((e) => setErro(e.message));
  }, []);

  if (erro) return <p className="erro">{erro}</p>;

  return (
    <div>
      <div className="cabecalho-pagina">
        <div>
          <h1>Administração</h1>
          <p>Visão consolidada da carteira, desempenho por proprietário e possíveis duplicidades de cadastro.</p>
        </div>
      </div>

      <div className="barra-filtros">
        {ABAS.map((a) => (
          <button key={a.chave} className={`chip ${aba === a.chave ? "ativo" : ""}`} onClick={() => setAba(a.chave)}>
            {a.rotulo}
          </button>
        ))}
      </div>

      {aba === "geral" && <VisaoGeral dados={visaoGeral} />}
      {aba === "proprietarios" && <PorProprietario resumo={resumoProprietarios} />}
      {aba === "duplicidades" && <Duplicidades duplicidades={duplicidades} />}
    </div>
  );
}

function VisaoGeral({ dados }) {
  if (!dados) return <p>Carregando...</p>;
  const cartoes = [
    { titulo: "Proprietários ativos", valor: dados.totalProprietarios },
    { titulo: "Clientes ativos (carteira toda)", valor: dados.clientesAtivos },
    { titulo: "Renovações próximas (90/60/30 dias)", valor: dados.renovacoesProximas },
    { titulo: "Renovações atrasadas", valor: dados.renovacoesAtrasadas, classe: "cartao-atrasada" },
    { titulo: "Leads parados", valor: dados.leadsParados },
    { titulo: "Leads quentes", valor: dados.leadsQuentes, classe: "cartao-atrasada" },
    { titulo: "Contatos realizados", valor: dados.contatosRealizados },
  ];
  return (
    <div className="grade-cartoes">
      {cartoes.map((c) => (
        <div className={`cartao ${c.classe || ""}`} key={c.titulo}>
          <span className="cartao-valor">{c.valor}</span>
          <span className="cartao-titulo">{c.titulo}</span>
        </div>
      ))}
    </div>
  );
}

function PorProprietario({ resumo }) {
  if (resumo.length === 0) return <p>Carregando...</p>;
  return (
    <div className="tabela-container">
      <table>
        <thead>
          <tr>
            <th>Proprietário</th>
            <th>Papel</th>
            <th>Clientes ativos</th>
            <th>Renovações próximas</th>
            <th>Renovações atrasadas</th>
            <th>Leads parados</th>
            <th>Leads quentes</th>
            <th>Contatos</th>
          </tr>
        </thead>
        <tbody>
          {resumo.map((r) => (
            <tr key={r.proprietarioId}>
              <td>{r.nome}</td>
              <td>{r.papel === "admin" ? "Administrador" : "Proprietário"}</td>
              <td>{r.clientesAtivos}</td>
              <td>{r.renovacoesProximas}</td>
              <td style={r.renovacoesAtrasadas > 0 ? { color: "var(--cor-perigo)", fontWeight: 700 } : undefined}>
                {r.renovacoesAtrasadas}
              </td>
              <td>{r.leadsParados}</td>
              <td>{r.leadsQuentes}</td>
              <td>{r.contatosRealizados}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Duplicidades({ duplicidades }) {
  return (
    <div>
      <p style={{ color: "var(--cor-texto-suave)", fontSize: "0.88rem", marginTop: 0 }}>
        Cadastros com o mesmo CPF/CNPJ em proprietários diferentes (match exato, ver IDEIA.md).
      </p>
      {duplicidades.length === 0 ? (
        <div className="estado-vazio">
          <span className="icone">✅</span>
          Nenhuma duplicidade encontrada nos dados atuais.
        </div>
      ) : (
        duplicidades.map((d) => (
          <div className="duplicidade-cartao" key={d.documento}>
            <strong>Documento {d.documento}</strong> — confiança {d.confianca}%
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Proprietários envolvidos</th>
                </tr>
              </thead>
              <tbody>
                {d.cadastros.map((c) => (
                  <tr key={c.id}>
                    <td>{c.nome}</td>
                    <td>{c.telefone || "-"}</td>
                    <td>{c.proprietariosEnvolvidos.join(", ") || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
