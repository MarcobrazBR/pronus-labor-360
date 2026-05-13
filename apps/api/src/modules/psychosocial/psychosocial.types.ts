export type PsychosocialRiskLevel = "low" | "moderate" | "high" | "critical";
export type CopsoqAxisId =
  | "work_demands"
  | "work_organization"
  | "relationships_leadership"
  | "company_worker_relation"
  | "health_wellbeing";
export type PsychosocialCampaignStatus =
  | "draft"
  | "active"
  | "threshold_reached"
  | "expired"
  | "extended"
  | "closed"
  | "analysis_in_progress"
  | "completed";

export interface PsychosocialQuestion {
  id: string;
  order: number;
  factor: string;
  prompt: string;
  reverseScored: boolean;
  options: Array<{
    value: number;
    label: string;
  }>;
}

export interface PsychosocialCampaign {
  id: string;
  companyTradeName: string;
  name: string;
  startDate: string;
  endDate: string;
  targetParticipants: number;
  responseCount: number;
  responseRate: number;
  status: PsychosocialCampaignStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PsychosocialSectorSignal {
  id: string;
  campaignId: string;
  companyTradeName: string;
  sectorName: string;
  participants: number;
  responses: number;
  responseRate: number;
  averageScore: number;
  riskLevel: PsychosocialRiskLevel;
  privacyStatus: "visible" | "aggregated";
  recommendation: string;
}

export interface PsychosocialSummary {
  generatedAt: string;
  campaigns: number;
  activeCampaigns: number;
  thresholdReached: number;
  averageResponseRate: number;
  highOrCriticalSectors: number;
  pendingInterviews: number;
}

export interface CopsoqAxisRisk {
  axisId: CopsoqAxisId;
  axisLabel: string;
  riskPercent: number;
  riskLevel: PsychosocialRiskLevel;
}

export interface PsychosocialQuestionScore {
  questionId: string;
  score: number;
}

export interface PsychosocialQuestionnaireProgress {
  id: string;
  campaignId: string;
  employeeId: string;
  companyTradeName: string;
  sectorName: string;
  scores: PsychosocialQuestionScore[];
  answeredCount: number;
  totalQuestions: number;
  progressPercent: number;
  isFinalized: boolean;
  receipt?: PsychosocialAnswerReceipt;
  startedAt: string;
  updatedAt: string;
  finalizedAt?: string;
}

export interface SavePsychosocialProgressInput {
  campaignId: string;
  employeeId: string;
  sectorName: string;
  scores: PsychosocialQuestionScore[];
}

export interface PsychosocialInterventionAction {
  id: string;
  priority: "low" | "medium" | "high" | "critical";
  target: string;
  action: string;
  ownerSuggestion: string;
  evidenceExpected: string;
}

export interface PsychosocialTechnicalReport {
  id: string;
  campaignId: string;
  companyTradeName: string;
  generatedAt: string;
  minimumAnonymousGroupSize: number;
  totalResponses: number;
  visibleGroups: number;
  aggregatedGroups: number;
  overallRiskPercent: number;
  overallRiskLevel: PsychosocialRiskLevel;
  priorityAxisLabel: string;
  executiveSummary: string;
  interventionPlan: PsychosocialInterventionAction[];
}

export interface CopsoqSectorAxisRisk {
  companyTradeName: string;
  sectorName: string;
  responses: number;
  axes: CopsoqAxisRisk[];
  accumulatedRiskPercent: number;
  accumulatedRiskLevel: PsychosocialRiskLevel;
  priorityAxisId: CopsoqAxisId;
  priorityAxisLabel: string;
  recommendation: string;
}

export interface CopsoqCompanyAnalysis {
  companyTradeName: string;
  campaignId: string;
  generatedAt: string;
  responses: number;
  overallRiskPercent: number;
  overallRiskLevel: PsychosocialRiskLevel;
  priorityAxisId: CopsoqAxisId;
  priorityAxisLabel: string;
  companyWideRecommendation: string;
  axes: CopsoqAxisRisk[];
  sectors: CopsoqSectorAxisRisk[];
}

export interface CreatePsychosocialCampaignInput {
  companyTradeName: string;
  name: string;
  startDate: string;
  endDate: string;
  targetParticipants: number;
}

export type UpdatePsychosocialCampaignInput = Partial<
  Pick<CreatePsychosocialCampaignInput, "name" | "startDate" | "endDate" | "targetParticipants">
> & {
  status?: PsychosocialCampaignStatus;
  responseCount?: number;
};

export interface SubmitPsychosocialAnswerInput {
  campaignId: string;
  employeeId?: string;
  sectorName: string;
  scores: PsychosocialQuestionScore[];
}

export interface PsychosocialAnswerReceipt {
  id: string;
  campaignId: string;
  employeeId?: string;
  sectorName: string;
  averageScore: number;
  riskPercent: number;
  riskLevel: PsychosocialRiskLevel;
  axisScores?: CopsoqAxisRisk[];
  createdAt: string;
}

export interface PsychosocialEmployeeAnswer extends PsychosocialAnswerReceipt {
  companyTradeName: string;
}
