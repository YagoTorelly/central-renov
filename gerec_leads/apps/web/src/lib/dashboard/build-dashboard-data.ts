import { getSlaState } from "./format";
import type { DashboardData, DashboardLead } from "./types";

export type RawLead = {
  id: number;
  company_id: number;
  campaign_id: number;
  current_assignee_id: string | null;
  assignment_status: string;
  qualification_status: string;
  conversion_status: string;
  source_entered_at: string;
  feedback_due_at: string | null;
  updated_at: string;
};

export type RawProfile = {
  user_id: string;
  full_name: string;
  email: string;
};

export type RawCompany = {
  id: number;
  legal_name: string | null;
  document_display: string | null;
};

export type RawCampaign = {
  id: number;
  display_name: string;
};

export type RawSourceRecord = {
  lead_id: number | null;
  mock_has_cnpj_or_mei: string | null;
  full_name: string | null;
  phone: string | null;
  email: string | null;
};

export type RawAttempt = {
  lead_id: number;
};

export type RawSale = {
  lead_id: number;
};

export type BuildDashboardInput = {
  leads: RawLead[];
  profiles: RawProfile[];
  companies: RawCompany[];
  campaigns: RawCampaign[];
  sourceRecords: RawSourceRecord[];
  attempts: RawAttempt[];
  sales: RawSale[];
  now?: Date;
  source: DashboardData["source"];
  warning?: string;
};

function indexById<T extends { id: number }>(records: T[]) {
  return new Map(records.map((record) => [record.id, record]));
}

export function buildDashboardData({
  leads,
  profiles,
  companies,
  campaigns,
  sourceRecords,
  attempts,
  sales,
  now = new Date(),
  source,
  warning,
}: BuildDashboardInput): DashboardData {
  const profileById = new Map(profiles.map((profile) => [profile.user_id, profile]));
  const companyById = indexById(companies);
  const campaignById = indexById(campaigns);
  const sourceByLeadId = new Map(
    sourceRecords.flatMap((record) => (record.lead_id === null ? [] : [[record.lead_id, record]])),
  );
  const attemptsByLeadId = attempts.reduce<Map<number, number>>((index, attempt) => {
    index.set(attempt.lead_id, (index.get(attempt.lead_id) ?? 0) + 1);
    return index;
  }, new Map());
  const wonLeadIds = new Set(sales.map((sale) => sale.lead_id));

  const dashboardLeads: DashboardLead[] = leads.map((lead) => {
    const sourceRecord = sourceByLeadId.get(lead.id);
    const company = companyById.get(lead.company_id);
    const campaign = campaignById.get(lead.campaign_id);
    const seller = lead.current_assignee_id ? profileById.get(lead.current_assignee_id) : undefined;
    const stage = getSlaState(lead.feedback_due_at, now);

    return {
      id: lead.id,
      contactAnswer: sourceRecord?.mock_has_cnpj_or_mei ?? "Nao informado",
      contactName: sourceRecord?.full_name ?? company?.legal_name ?? "Lead sem nome",
      phone: sourceRecord?.phone ?? "Sem telefone",
      email: sourceRecord?.email ?? "Sem e-mail",
      companyName: company?.legal_name ?? company?.document_display ?? "Empresa pendente",
      campaignName: campaign?.display_name ?? "Campanha pendente",
      sellerName: seller?.full_name ?? "Sem vendedor",
      assignmentStatus: lead.assignment_status,
      qualificationStatus: lead.qualification_status,
      conversionStatus: wonLeadIds.has(lead.id) ? "won" : lead.conversion_status,
      sourceEnteredAt: lead.source_entered_at,
      feedbackDueAt: lead.feedback_due_at,
      lastActivityAt: lead.updated_at,
      attemptsCount: attemptsByLeadId.get(lead.id) ?? 0,
      stage,
      isBlockedBySla: stage === "overdue",
    };
  });

  return {
    leads: dashboardLeads,
    generatedAt: now.toISOString(),
    source,
    warning,
    summary: {
      total: dashboardLeads.length,
      queued: dashboardLeads.filter((lead) => lead.assignmentStatus === "assigned").length,
      overdue: dashboardLeads.filter((lead) => lead.stage === "overdue").length,
      pending: dashboardLeads.filter((lead) => lead.qualificationStatus === "pending").length,
      won: dashboardLeads.filter((lead) => lead.conversionStatus === "won").length,
      feedbacksToday: dashboardLeads.filter((lead) => lead.stage === "today").length,
      attempts: dashboardLeads.reduce((total, lead) => total + lead.attemptsCount, 0),
    },
  };
}
