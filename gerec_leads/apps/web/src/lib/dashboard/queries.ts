import {
  buildDashboardData,
  type RawAttempt,
  type RawCampaign,
  type RawCompany,
  type RawLead,
  type RawProfile,
  type RawSale,
  type RawSourceRecord,
} from "./build-dashboard-data";
import { getDemoDashboardData } from "./demo-data";
import type { DashboardData, SessionProfile } from "./types";
import { inFilter, supabaseRestSelect } from "../supabase/rest";

async function selectByLeadIds<T>(tablePath: string, leadIds: number[], accessToken: string) {
  if (leadIds.length === 0) return [];
  return supabaseRestSelect<T>(`${tablePath}&lead_id=in.${inFilter(leadIds)}`, accessToken);
}

export async function getDashboardData(
  profile: SessionProfile,
  accessToken: string,
): Promise<DashboardData> {
  try {
    const leads = await supabaseRestSelect<RawLead>(
      [
        "leads?select=id,company_id,campaign_id,current_assignee_id,assignment_status,qualification_status,conversion_status,source_entered_at,feedback_due_at,updated_at",
        "archived_at=is.null",
        "order=feedback_due_at.asc.nullslast",
        "limit=200",
      ].join("&"),
      accessToken,
    );
    const leadIds = leads.map((lead) => lead.id);
    const companyIds = [...new Set(leads.map((lead) => lead.company_id))];
    const campaignIds = [...new Set(leads.map((lead) => lead.campaign_id))];

    const [profiles, companies, campaigns, sourceRecords, attempts, sales] = await Promise.all([
      profile.role === "admin"
        ? supabaseRestSelect<RawProfile>(
            "profiles?select=user_id,full_name,email&is_active=eq.true",
            accessToken,
          )
        : Promise.resolve([
            { user_id: profile.userId, full_name: profile.fullName, email: profile.email },
          ]),
      companyIds.length === 0
        ? Promise.resolve([])
        : supabaseRestSelect<RawCompany>(
            `companies?select=id,legal_name,document_display&id=in.${inFilter(companyIds)}`,
            accessToken,
          ),
      campaignIds.length === 0
        ? Promise.resolve([])
        : supabaseRestSelect<RawCampaign>(
            `campaigns?select=id,display_name&id=in.${inFilter(campaignIds)}`,
            accessToken,
          ),
      selectByLeadIds<RawSourceRecord>(
        "lead_source_records?select=lead_id,mock_has_cnpj_or_mei,full_name,phone,email",
        leadIds,
        accessToken,
      ),
      selectByLeadIds<RawAttempt>("contact_attempts?select=lead_id", leadIds, accessToken),
      selectByLeadIds<RawSale>("sales?select=lead_id", leadIds, accessToken),
    ]);

    return buildDashboardData({
      leads,
      profiles,
      companies,
      campaigns,
      sourceRecords,
      attempts,
      sales,
      source: "supabase",
    });
  } catch (error) {
    return {
      ...getDemoDashboardData(profile),
      warning:
        error instanceof Error
          ? `Falha ao consultar Supabase local: ${error.message}`
          : "Falha ao consultar Supabase local.",
    };
  }
}
