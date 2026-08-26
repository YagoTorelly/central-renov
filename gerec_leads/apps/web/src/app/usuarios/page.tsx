import { redirect } from "next/navigation";
import { AppShell } from "../../components/app-shell";
import { UsersCrud } from "../../components/users-crud";
import { getSessionContext } from "../../lib/auth/get-session-context";

export default async function UsersPage() {
  const session = await getSessionContext({ onMissingSession: () => redirect("/login") });
  if (session.profile.role !== "admin") redirect("/dashboard");
  return (
    <AppShell profile={session.profile}>
      <div className="page-heading">
        <p className="eyebrow">Administração</p>
        <h1>Usuários</h1>
        <p>Gerencie vendedores, status e posições da fila.</p>
      </div>
      <UsersCrud />
    </AppShell>
  );
}
