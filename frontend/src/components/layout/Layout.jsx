import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  IconActivity,
  IconLayoutDashboard,
  IconLogout,
  IconSettings,
  IconTarget,
  IconUsers,
} from "@tabler/icons-react";
import { useProprietarioAtual } from "../../hooks/useProprietarioAtual";
import { logoWtg } from "../../assets/logoWtg";
import { api } from "../../api";

const ICONE_TAMANHO = 18;

export default function Layout() {
  const { proprietarioNome, proprietarioPapel, visualizandoComoId, definirVisualizandoComo, sair } =
    useProprietarioAtual();
  const navegar = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const ehAdmin = proprietarioPapel === "admin";

  useEffect(() => {
    if (ehAdmin) {
      api.usuarios().then(setUsuarios).catch(() => {});
    }
  }, [ehAdmin]);

  function trocarUsuario() {
    sair();
    navegar("/");
  }

  return (
    <div className="layout">
      <header className="topo">
        <img className="topo-logo" src={logoWtg} alt="WTG Corretora" />
        <nav>
          <NavLink to="/dashboard">
            <IconLayoutDashboard size={ICONE_TAMANHO} /> Dashboard
          </NavLink>
          <NavLink to="/clientes">
            <IconUsers size={ICONE_TAMANHO} /> Meus Clientes
          </NavLink>
          <NavLink to="/leads">
            <IconTarget size={ICONE_TAMANHO} /> Leads Parados
          </NavLink>
          <NavLink to="/atividades">
            <IconActivity size={ICONE_TAMANHO} /> Atividades
          </NavLink>
          {ehAdmin && (
            <NavLink to="/admin">
              <IconSettings size={ICONE_TAMANHO} /> Administração
            </NavLink>
          )}
        </nav>
        {ehAdmin && (
          <select
            className="seletor-visualizacao"
            value={visualizandoComoId || "todos"}
            onChange={(e) => definirVisualizandoComo(e.target.value)}
            title="Visualizando como"
          >
            <option value="todos">Todos os proprietários</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        )}
        <span className="usuario-atual">
          {proprietarioNome}
          <button className="botao botao-secundario" onClick={trocarUsuario}>
            <IconLogout size={16} /> Trocar usuário
          </button>
        </span>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
