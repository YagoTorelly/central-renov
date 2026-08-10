import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useProprietarioAtual } from "../../hooks/useProprietarioAtual";
import { logoWtg } from "../../assets/logoWtg";

export default function Layout() {
  const { proprietarioNome, sair } = useProprietarioAtual();
  const navegar = useNavigate();

  function trocarUsuario() {
    sair();
    navegar("/");
  }

  return (
    <div className="layout">
      <header className="topo">
        <img className="topo-logo" src={logoWtg} alt="WTG Corretora" />
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/clientes">Meus Clientes</NavLink>
          <NavLink to="/leads">Leads Parados</NavLink>
          <NavLink to="/atividades">Atividades</NavLink>
          <NavLink to="/admin">Administração</NavLink>
        </nav>
        <span className="usuario-atual">
          {proprietarioNome}
          <button className="botao botao-secundario" onClick={trocarUsuario}>
            Trocar usuário
          </button>
        </span>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
