import { redirect } from "next/navigation";
import { AppShell } from "../../components/app-shell";
import { getSessionContext } from "../../lib/auth/get-session-context";
import { getDashboardData } from "../../lib/dashboard/queries";
import { buildQueueView } from "../../lib/dashboard/operations-view";

export default async function QueuePage() {
  const session = await getSessionContext({ onMissingSession: () => redirect("/login") });
  const data = await getDashboardData(session.profile, session.accessToken);
  const leads = data.leads.map((lead) => ({ ...lead, sellerId: lead.sellerName }));
  const queue = buildQueueView({
    profile: session.profile,
    leads,
    queueEntries: [...new Set(leads.map((lead) => lead.sellerName))].map((name, index) => ({
      sellerId: name,
      sellerName: name,
      sellerEmail: "",
      position: index + 1,
      isPaused: false,
      skipBalance: 0,
    })),
    source: data.source,
    nextSellerId: null,
    now: new Date(),
  });
  return (
    <AppShell profile={session.profile}>
      <div className="page-heading">
        <p className="eyebrow">Operação</p>
        <h1>Fila de leads</h1>
        <p>Acompanhe a ordem global, pausas e carga por vendedor.</p>
      </div>
      <section className="queue-grid">
        {queue.entries.map((item) => (
          <article className="queue-card" key={item.sellerName}>
            <div className="queue-position">{String(item.position).padStart(2, "0")}</div>
            <div>
              <h2>{item.sellerName}</h2>
              <p>
                {item.activeLeads} leads atribuídos · {item.overdueLeads} atrasados
              </p>
            </div>
            <span className="queue-state">{item.isPaused ? "Pausado" : "Ativo"}</span>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
