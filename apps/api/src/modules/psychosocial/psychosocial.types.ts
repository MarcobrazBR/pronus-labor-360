export type PsychosocialRiskLevel = "low" | "moderate" | "high" | "critical";
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
  scores: Array<{
    questionId: string;
    score: number;
  }>;
}

export interface PsychosocialAnswerReceipt {
  id: string;
  campaignId: string;
  sectorName: string;
  averageScore: number;
  riskLevel: PsychosocialRiskLevel;
  createdAt: string;
}
