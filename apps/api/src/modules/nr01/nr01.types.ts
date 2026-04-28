export type Nr01RiskLevel = "low" | "moderate" | "high" | "critical";
export type Nr01RiskType = "physical" | "chemical" | "biological" | "ergonomic" | "accident";
export type Nr01RecordStatus = "draft" | "active" | "review" | "archived";
export type Nr01ActionStatus = "open" | "in_progress" | "done" | "overdue";
export type Nr01EvidenceType = "photo" | "report" | "training_record" | "measurement" | "other";
export type Nr01EvidenceStatus = "pending_review" | "accepted" | "rejected";
export type Nr01DocumentType = "pgr" | "inventory" | "technical_report" | "action_plan" | "other";
export type Nr01DocumentStatus = "draft" | "in_review" | "approved" | "published";

export interface Nr01Risk {
  id: string;
  companyTradeName: string;
  unitName: string;
  departmentName: string;
  jobPositionTitle?: string;
  type: Nr01RiskType;
  danger: string;
  risk: string;
  probability: number;
  severity: number;
  level: Nr01RiskLevel;
  controlMeasures: string[];
  status: Nr01RecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Nr01ActionPlanItem {
  id: string;
  riskId: string;
  companyTradeName: string;
  title: string;
  responsible: string;
  dueDate: string;
  status: Nr01ActionStatus;
  evidenceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Nr01Evidence {
  id: string;
  actionId: string;
  riskId: string;
  companyTradeName: string;
  title: string;
  type: Nr01EvidenceType;
  responsible: string;
  receivedAt: string;
  status: Nr01EvidenceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Nr01Document {
  id: string;
  companyTradeName: string;
  title: string;
  type: Nr01DocumentType;
  referencePeriod: string;
  status: Nr01DocumentStatus;
  generatedAt: string;
  approvedAt?: string;
  updatedAt: string;
}

export interface Nr01Summary {
  generatedAt: string;
  risks: number;
  criticalRisks: number;
  highRisks: number;
  openActions: number;
  overdueActions: number;
  evidences: number;
}

export interface CreateNr01RiskInput {
  companyTradeName: string;
  unitName: string;
  departmentName: string;
  jobPositionTitle?: string;
  type: Nr01RiskType;
  danger: string;
  risk: string;
  probability: number;
  severity: number;
  controlMeasures?: string[];
}

export type UpdateNr01RiskInput = Partial<CreateNr01RiskInput> & {
  status?: Nr01RecordStatus;
};

export interface CreateNr01ActionPlanItemInput {
  riskId: string;
  title: string;
  responsible: string;
  dueDate: string;
}

export type UpdateNr01ActionPlanItemInput = Partial<
  Pick<CreateNr01ActionPlanItemInput, "title" | "responsible" | "dueDate">
> & {
  status?: Nr01ActionStatus;
  evidenceCount?: number;
};

export interface CreateNr01EvidenceInput {
  actionId: string;
  title: string;
  type: Nr01EvidenceType;
  responsible: string;
  receivedAt?: string;
  notes?: string;
}

export type UpdateNr01EvidenceInput = Partial<
  Pick<CreateNr01EvidenceInput, "title" | "type" | "responsible" | "receivedAt" | "notes">
> & {
  status?: Nr01EvidenceStatus;
};

export interface CreateNr01DocumentInput {
  companyTradeName: string;
  title: string;
  type: Nr01DocumentType;
  referencePeriod: string;
}

export type UpdateNr01DocumentInput = Partial<CreateNr01DocumentInput> & {
  status?: Nr01DocumentStatus;
  approvedAt?: string;
};
