import { useEffect, useState } from "react";
import { api } from "../api";
import Modal from "../components/ui/Modal";

const ABAS = [
  { chave: "geral", rotulo: "Visão geral" },
  { chave: "proprietarios", rotulo: "Por proprietário" },
  { chave: "usuarios", rotulo: "Usuários" },
  { chave: "duplicidades", rotulo: "Possíveis duplicidades" },
];

export default function Admin() {
  const [aba, setAba] = useState("geral");
  const [visaoGeral, setVisaoGeral] = useState(null);
  const [resumoProprietarios, setResumoProprietarios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [duplicidades, setDuplicidades] = useState([]);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  function carregar() {
    api.visaoGeral().then(setVisaoGeral).catch((e) => setErro(e.message));
    api.resumoProprietarios().then(setResumoProprietarios).catch((e) => setErro(e.message));
    api.usuarios().then(setUsuarios).catch((e) => setErro(e.message));
    api.duplicidades().then(setDuplicidades).catch((e) => setErro(e.message));
  }

  if (erro) return <p className="erro">{erro}</p>;

  return (
    <div>
      <div className="cabecalho-pagina">
        <div>
          <h1>Administração</h1>
          <p>Visão consolidada da carteira, desempenho por proprietário, usuários e possíveis duplicidades.</p>
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
      {aba === "usuarios" && <Usuarios usuarios={usuarios} onAtualizado={carregar} />}
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

function Usuarios({ usuarios, onAtualizado }) {
  const [edicaoEmail, setEdicaoEmail] = useState(null);
  const [novoEmail, setNovoEmail] = useState("");
  const [edicaoSenha, setEdicaoSenha] = useState(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [erroModal, setErroModal] = useState(null);

  function abrirEdicaoEmail(usuario) {
    setEdicaoEmail(usuario);
    setNovoEmail(usuario.email || "");
    setErroModal(null);
  }

  function abrirEdicaoSenha(usuario) {
    setEdicaoSenha(usuario);
    setNovaSenha("");
    setErroModal(null);
  }

  async function salvarEmail() {
    setSalvando(true);
    setErroModal(null);
    try {
      await api.editarEmail(edicaoEmail.id, novoEmail);
      setMensagem(`E-mail de ${edicaoEmail.nome} atualizado.`);
      setEdicaoEmail(null);
      onAtualizado();
    } catch (e) {
      setErroModal(e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function salvarSenha() {
    setSalvando(true);
    setErroModal(null);
    try {
      await api.redefinirSenha(edicaoSenha.id, novaSenha);
      setMensagem(`Senha de ${edicaoSenha.nome} redefinida.`);
      setEdicaoSenha(null);
      onAtualizado();
    } catch (e) {
      setErroModal(e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function alterarPapel(usuario, novoPapel) {
    if (novoPapel === usuario.papel) return;
    const rotulo = novoPapel === "admin" ? "administrador" : "proprietário";
    if (!window.confirm(`Tornar ${usuario.nome} ${rotulo}?`)) return;
    try {
      await api.editarPapel(usuario.id, novoPapel);
      setMensagem(`${usuario.nome} agora é ${rotulo}.`);
      onAtualizado();
    } catch (e) {
      setMensagem(null);
      window.alert(e.message);
    }
  }

  if (usuarios.length === 0) return <p>Carregando...</p>;

  return (
    <div>
      {mensagem && <p className="mensagem">{mensagem}</p>}
      <div className="tabela-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Papel</th>
              <th>E-mail (login)</th>
              <th>Senha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nome}</td>
                <td>
                  <select value={u.papel} onChange={(e) => alterarPapel(u, e.target.value)}>
                    <option value="proprietario">Proprietário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </td>
                <td>{u.email || "-"}</td>
                <td>{u.temSenha ? "Definida" : "Não definida"}</td>
                <td>
                  <div className="acoes">
                    <button className="botao-icone" onClick={() => abrirEdicaoEmail(u)}>
                      Editar e-mail
                    </button>
                    <button className="botao-icone" onClick={() => abrirEdicaoSenha(u)}>
                      Redefinir senha
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal titulo="Editar e-mail de login" aberto={Boolean(edicaoEmail)} onFechar={() => setEdicaoEmail(null)}>
        {erroModal && <p className="erro">{erroModal}</p>}
        <div className="campo-formulario">
          <label>E-mail de {edicaoEmail?.nome}</label>
          <input type="email" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} />
        </div>
        <div className="modal-acoes">
          <button className="botao botao-secundario" onClick={() => setEdicaoEmail(null)}>
            Cancelar
          </button>
          <button className="botao botao-primario" onClick={salvarEmail} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </Modal>

      <Modal titulo="Redefinir senha" aberto={Boolean(edicaoSenha)} onFechar={() => setEdicaoSenha(null)}>
        {erroModal && <p className="erro">{erroModal}</p>}
        <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--cor-texto-suave)" }}>
          Nova senha temporária para <strong>{edicaoSenha?.nome}</strong> (mínimo 6 caracteres).
        </p>
        <div className="campo-formulario">
          <label>Nova senha</label>
          <input type="text" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
        </div>
        <div className="modal-acoes">
          <button className="botao botao-secundario" onClick={() => setEdicaoSenha(null)}>
            Cancelar
          </button>
          <button className="botao botao-primario" onClick={salvarSenha} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </Modal>
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
