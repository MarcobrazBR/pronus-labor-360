export type LegalObligationKey =
  | "pgr"
  | "pcmso"
  | "ltcat"
  | "cipa"
  | "sesmt"
  | "aet"
  | "esocial_s2210"
  | "esocial_s2220"
  | "esocial_s2240";

export type RiskTypeKey = "physical" | "chemical" | "biological" | "ergonomic" | "accident";

export type AnalysisDepth = "basic" | "intermediate" | "detailed" | "critical";

export type RiskScoreClass = "low" | "medium" | "high" | "critical";

export interface LegalObligationDefinition {
  key: LegalObligationKey;
  label: string;
  reference: string;
}

export interface RegulatoryCnae {
  code: string;
  description: string;
  riskDegree: 1 | 2 | 3 | 4;
  activityClassification: string;
  obligations: LegalObligationKey[];
  conditionalObligations: LegalObligationKey[];
  sourceNote: string;
}

export interface RegulatoryRiskDegree {
  degree: 1 | 2 | 3 | 4;
  description: string;
  requiredRiskTypes: RiskTypeKey[];
  analysisDepth: AnalysisDepth;
  inventoryRequired: boolean;
  actionPlanRequired: boolean;
  reviewFrequencyMonths: number;
}

export interface AssessCompanyInput {
  cnaeCode: string;
  employeeCount: number;
  sectors?: Array<{
    name: string;
    employeeCount: number;
  }>;
}

export interface ResolvedLegalObligation {
  key: LegalObligationKey;
  label: string;
  reference: string;
  status: "required" | "conditional";
  reason: string;
}

export interface TechnicalChecklistItem {
  id: string;
  group: string;
  label: string;
  required: boolean;
  evidenceHint: string;
}

export interface CompanyRegulatoryAssessment {
  generatedAt: string;
  cnae: RegulatoryCnae;
  riskDegree: RegulatoryRiskDegree;
  employeeCount: number;
  obligations: ResolvedLegalObligation[];
  checklist: TechnicalChecklistItem[];
  pgrBase: {
    inventoryRequired: boolean;
    actionPlanRequired: boolean;
    requiredRiskTypes: RiskTypeKey[];
    analysisDepth: AnalysisDepth;
    reviewFrequencyMonths: number;
  };
  pcmsoBase?: {
    required: boolean;
    reason: string;
  };
  riskScore: {
    value: number;
    classification: RiskScoreClass;
    label: string;
  };
  alerts: Array<{
    id: string;
    title: string;
    severity: "info" | "warning" | "critical";
    dueHint: string;
  }>;
  timeline: Array<{
    id: string;
    title: string;
    status: "pending" | "planned" | "active";
  }>;
}
