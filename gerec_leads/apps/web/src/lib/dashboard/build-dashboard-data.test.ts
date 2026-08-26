import { describe, expect, it } from "vitest";

import { buildDashboardData } from "./build-dashboard-data";

describe("buildDashboardData", () => {
  it("isola a visao do vendedor para os leads retornados pela RLS", () => {
    const data = buildDashboardData({
      leads: [
        {
          id: 1,
          company_id: 10,
          campaign_id: 20,
          current_assignee_id: "seller-1",
          assignment_status: "assigned",
          qualification_status: "pending",
          conversion_status: "active",
          source_entered_at: "2026-08-26T11:00:00.000Z",
          feedback_due_at: "2026-08-26T18:00:00.000Z",
          updated_at: "2026-08-26T11:10:00.000Z",
        },
      ],
      profiles: [{ user_id: "seller-1", full_name: "Renato", email: "renato@gerec.local" }],
      companies: [{ id: 10, legal_name: "Empresa A", document_display: "12.000.000/0001-00" }],
      campaigns: [{ id: 20, display_name: "Campanha" }],
      sourceRecords: [
        {
          lead_id: 1,
          mock_has_cnpj_or_mei: "sim",
          full_name: "Cliente A",
          phone: "(11) 90000-0000",
          email: "cliente@exemplo.com",
        },
      ],
      attempts: [{ lead_id: 1 }],
      sales: [],
      now: new Date("2026-08-26T12:00:00.000Z"),
      source: "supabase",
    });

    expect(data.summary.total).toBe(1);
    expect(data.summary.feedbacksToday).toBe(1);
    expect(data.leads[0]).toMatchObject({
      contactName: "Cliente A",
      sellerName: "Renato",
      attemptsCount: 1,
      stage: "today",
    });
  });
});
