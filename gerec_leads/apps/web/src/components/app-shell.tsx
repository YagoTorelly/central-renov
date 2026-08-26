import { signOutAction } from "../lib/auth/actions";
import type { SessionProfile } from "../lib/dashboard/types";

export function AppShell({
  profile,
  children,
}: {
  profile: SessionProfile;
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">W</span>
          <span>
            WTG
            <br />
            <small>LEADS OPS</small>
          </span>
        </div>
        <nav>
          <a className="nav-active" href="/dashboard">
            Visão geral
          </a>
          <a href="#fila">Fila de leads</a>
          <a href="#historico">Histórico</a>
        </nav>
        <div className="sidebar-foot">
          <span className="status-dot" /> Supabase local
        </div>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              {profile.role === "admin" ? "Painel administrativo" : "Minha operação"}
            </p>
            <h1>Olá, {profile.fullName.split(" ")[0]}</h1>
          </div>
          <div className="user-menu">
            <span className="avatar">{profile.fullName.slice(0, 1)}</span>
            <span>
              <strong>{profile.fullName}</strong>
              <small>{profile.role === "admin" ? "Administrador" : "Vendedor"}</small>
            </span>
            <form action={signOutAction}>
              <button className="logout" type="submit">
                Sair
              </button>
            </form>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
