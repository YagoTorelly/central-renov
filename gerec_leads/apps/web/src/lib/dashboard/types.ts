export type UserRole = "admin" | "seller";

export type SessionProfile = {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
};

export type LeadStage = "overdue" | "today" | "scheduled" | "none";

export type DashboardLead = {
  id: number;
  contactAnswer: string;
  contactName: string;
  phone: string;
  email: string;
  companyName: string;
  campaignName: string;
  sellerName: string;
  assignmentStatus: string;
  qualificationStatus: string;
  conversionStatus: string;
  sourceEnteredAt: string;
  feedbackDueAt: string | null;
  lastActivityAt: string;
  attemptsCount: number;
  stage: LeadStage;
  isBlockedBySla: boolean;
};

export type DashboardSummary = {
  total: number;
  queued: number;
  overdue: number;
  pending: number;
  won: number;
  feedbacksToday: number;
  attempts: number;
};

export type DashboardData = {
  leads: DashboardLead[];
  summary: DashboardSummary;
  generatedAt: string;
  source: "supabase" | "demo";
  warning?: string;
};
