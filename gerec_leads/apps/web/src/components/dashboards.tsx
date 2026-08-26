import type { DashboardData, SessionProfile } from "../lib/dashboard/types";
import { formatDateTime } from "../lib/dashboard/format";

function Metric({ label, value, tone = "" }: { label: string; value: number; tone?: string }) {
  return (
    <div className={`metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
function LeadTable({ data }: { data: DashboardData }) {
  return (
    <section className="table-card" id="fila">
      <div className="table-head">
        <div>
          <p className="eyebrow">Carteira operacional</p>
          <h2>Leads em acompanhamento</h2>
        </div>
        <span className={`data-badge ${data.source}`}>
          {data.source === "supabase" ? "Dados ao vivo" : "Modo demonstração"}
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Lead / contato</th>
            <th>Empresa</th>
            <th>Vendedor</th>
            <th>Próximo prazo</th>
            <th>Status</th>
            <th>Tentativas</th>
          </tr>
        </thead>
        <tbody>
          {data.leads.map((lead) => (
            <tr key={lead.id}>
              <td>
                <strong>{lead.contactName}</strong>
                <small>
                  {lead.phone} · {lead.email}
                </small>
              </td>
              <td>
                {lead.companyName}
                <small>{lead.campaignName}</small>
              </td>
              <td>{lead.sellerName}</td>
              <td>
                <span className={`sla ${lead.stage}`}>
                  {lead.stage === "overdue"
                    ? "Atrasado"
                    : lead.stage === "today"
                      ? "Vence hoje"
                      : lead.feedbackDueAt
                        ? formatDateTime(lead.feedbackDueAt)
                        : "Sem prazo"}
                </span>
                <small>{lead.feedbackDueAt && formatDateTime(lead.feedbackDueAt)}</small>
              </td>
              <td>
                <span className={`pill ${lead.conversionStatus}`}>
                  {lead.conversionStatus === "won"
                    ? "Ganho"
                    : lead.qualificationStatus === "disqualified"
                      ? "Desqualificado"
                      : "Em andamento"}
                </span>
              </td>
              <td>{lead.attemptsCount}/5</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.leads.length === 0 && (
        <div className="empty">Nenhum lead disponível para este perfil.</div>
      )}
    </section>
  );
}
export function AdminDashboard({ data }: { data: DashboardData }) {
  return (
    <>
      <div className="notice">
        {data.warning ?? "Atualizado agora · horários em America/Sao_Paulo"}
      </div>
      <section className="metrics">
        <Metric label="Total de leads" value={data.summary.total} />
        <Metric label="Em distribuição" value={data.summary.queued} />
        <Metric label="Feedbacks hoje" value={data.summary.feedbacksToday} tone="amber" />
        <Metric label="Atrasados" value={data.summary.overdue} tone="red" />
        <Metric label="Negócios ganhos" value={data.summary.won} tone="green" />
      </section>
      <LeadTable data={data} />
    </>
  );
}
export function SellerDashboard({
  data,
  profile,
}: {
  data: DashboardData;
  profile: SessionProfile;
}) {
  return (
    <>
      <div className="notice">
        Carteira de {profile.fullName} ·{" "}
        {data.warning ?? "Atualizado agora · horários em America/Sao_Paulo"}
      </div>
      <section className="metrics">
        <Metric label="Minha carteira" value={data.summary.total} />
        <Metric label="Feedbacks hoje" value={data.summary.feedbacksToday} tone="amber" />
        <Metric label="Atrasados" value={data.summary.overdue} tone="red" />
        <Metric label="Tentativas" value={data.summary.attempts} />
      </section>
      <LeadTable data={data} />
    </>
  );
}
