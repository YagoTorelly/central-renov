import { redirect } from "next/navigation";
import { AppShell } from "../../components/app-shell";
import { getSessionContext } from "../../lib/auth/get-session-context";
import { getDashboardData } from "../../lib/dashboard/queries";
import { buildHistoryView } from "../../lib/dashboard/operations-view";
import { formatDateTime } from "../../lib/dashboard/format";

export default async function HistoryPage() {
  const session = await getSessionContext({ onMissingSession: () => redirect("/login") });
  const data = await getDashboardData(session.profile, session.accessToken);
  const leads = data.leads.map((lead) => ({
    id: lead.id,
    contactName: lead.contactName,
    companyName: lead.companyName,
    sellerId: lead.sellerName,
    sellerName: lead.sellerName,
    stage: lead.stage,
    feedbackDueAt: lead.feedbackDueAt,
  }));
  const history = buildHistoryView({
    profile: session.profile,
    leads,
    profiles: [...new Set(leads.map((lead) => lead.sellerName))].map((name) => ({
      userId: name,
      fullName: name,
    })),
    assignments: leads.map((lead, index) => ({
      id: index + 1,
      leadId: lead.id,
      sellerId: lead.sellerName,
      assignmentType: "normal",
      startedAt:
        data.leads.find((item) => item.id === lead.id)?.lastActivityAt ?? new Date().toISOString(),
      reason: "Atribuição operacional",
    })),
    feedbacks: [],
    attempts: [],
    qualifications: [],
    sales: [],
    source: data.source,
    now: new Date(),
  });
  return (
    <AppShell profile={session.profile}>
      <div className="page-heading">
        <p className="eyebrow">Rastreabilidade</p>
        <h1>Histórico</h1>
        <p>Eventos recentes da sua operação, em ordem cronológica.</p>
      </div>
      <section className="table-card history-card">
        <table>
          <thead>
            <tr>
              <th>Quando</th>
              <th>Evento</th>
              <th>Lead</th>
              <th>Responsável</th>
            </tr>
          </thead>
          <tbody>
            {history.items.map((event) => (
              <tr key={event.id}>
                <td>{formatDateTime(event.at)}</td>
                <td>
                  <span className="pill">{event.type}</span>
                  <small>{event.headline}</small>
                </td>
                <td>{event.contactName}</td>
                <td>{event.sellerName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}
