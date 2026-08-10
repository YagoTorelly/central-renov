import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useProprietarioAtual } from "../../hooks/useProprietarioAtual";

export default function Layout() {
  const { proprietarioId, sair } = useProprietarioAtual();
  const navegar = useNavigate();

  function trocarUsuario() {
    sair();
    navegar("/");
  }

  return (
    <div className="layout">
      <header className="topo">
        <strong>Central Renov</strong>
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/clientes">Meus Clientes</NavLink>
          <NavLink to="/leads">Leads Parados</NavLink>
          <NavLink to="/admin">Administracao</NavLink>
        </nav>
        <span className="usuario-atual">
          {proprietarioId} <button onClick={trocarUsuario}>trocar</button>
        </span>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
