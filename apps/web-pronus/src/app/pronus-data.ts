import type { RiskLevel } from "@pronus/types";

export type StructuralStatus = "active" | "pending_validation" | "blocked" | "inactive";
export type CompanyContractStatus =
  | "prospecting"
  | "onboarding"
  | "active"
  | "suspended"
  | "closed";
export type StructuralAudience =
  | "client"
  | "client_hr"
  | "client_manager"
  | "pronus_administrative"
  | "pronus_clinical";

export interface StructuralSummary {
  companies: number;
  units: number;
  departments: number;
  jobPositions: number;
  employees: number;
  pendingValidations: number;
}

export interface StructuralCompany {
  id: string;
  tradeName: string;
  legalName?: string;
  groupName?: string;
  cnpj: string;
  contractStatus?: CompanyContractStatus;
  contractDueDate?: string;
  selectedPackage?: string;
  eSocialValidFrom?: string;
  eSocialValidTo?: string;
  taxClassification?: string;
  cooperativeIndicator?: string;
  constructionCompanyIndicator?: string;
  payrollExemptionIndicator?: string;
  electronicRegistrationIndicator?: string;
  educationalEntityIndicator?: string;
  temporaryWorkCompanyIndicator?: string;
  temporaryWorkRegistration?: string;
  primaryCnae?: string;
  contactName?: string;
  contactCpf?: string;
  contactPhone?: string;
  contactMobile?: string;
  contactEmail?: string;
  units: number;
  departments: number;
  employees: number;
  status: StructuralStatus;
}

export interface StructuralEmployee {
  id: string;
  companyId?: string;
  companyTradeName: string;
  fullName: string;
  cpf?: string;
  birthDate?: string;
  inclusionDate?: string;
  exclusionDate?: string;
  email?: string;
  phone?: string;
  department: string;
  jobPosition: string;
  cboCode?: string;
  registrationStatus: StructuralStatus;
}

export type EmployeeMovementType = "inclusion" | "update" | "termination";
export type EmployeeMovementStatus = "pending" | "approved" | "rejected";
export type EmployeeMovementSource = "client_portal" | "pronus_portal";

export interface EmployeeMovement {
  id: string;
  type: EmployeeMovementType;
  status: EmployeeMovementStatus;
  source: EmployeeMovementSource;
  companyId: string;
  companyTradeName: string;
  employeeId?: string;
  fullName: string;
  cpf: string;
  birthDate?: string;
  inclusionDate?: string;
  exclusionDate?: string;
  department: string;
  jobPosition: string;
  cboCode?: string;
  email?: string;
  phone?: string;
  notes?: string;
  requestedBy?: string;
  reviewerName?: string;
  createdAt: string;
  updatedAt: string;
  decidedAt?: string;
  slaDueAt: string;
}

export interface StructuralUnit {
  id: string;
  companyTradeName: string;
  name: string;
  code?: string;
  status: StructuralStatus;
}

export interface StructuralDepartment {
  id: string;
  companyTradeName?: string;
  unitName?: string;
  name: string;
  code?: string;
  audience: StructuralAudience;
  status: StructuralStatus;
}

export interface StructuralJobPosition {
  id: string;
  companyTradeName?: string;
  departmentName?: string;
  title: string;
  audience: StructuralAudience;
  eSocialCode?: string;
  cboCode?: string;
  description?: string;
  status: StructuralStatus;
}

export interface Nr01Summary {
  risks: number;
  criticalRisks: number;
  highRisks: number;
  openActions: number;
  overdueActions: number;
  evidences: number;
}

export interface Nr01Risk {
  id: string;
  companyTradeName: string;
  unitName?: string;
  departmentName: string;
  jobPositionTitle?: string;
  type?: "physical" | "chemical" | "biological" | "ergonomic" | "accident";
  danger: string;
  risk: string;
  probability: number;
  severity: number;
  level: RiskLevel;
  controlMeasures?: string[];
  status: "draft" | "active" | "review" | "archived";
}

export interface Nr01ActionPlanItem {
  id: string;
  riskId?: string;
  companyTradeName: string;
  title: string;
  responsible: string;
  dueDate: string;
  status: "open" | "in_progress" | "done" | "overdue";
  evidenceCount: number;
}

export interface Nr01Evidence {
  id: string;
  actionId: string;
  riskId: string;
  companyTradeName: string;
  title: string;
  type: "photo" | "report" | "training_record" | "measurement" | "other";
  responsible: string;
  receivedAt: string;
  status: "pending_review" | "accepted" | "rejected";
  notes?: string;
}

export interface Nr01Document {
  id: string;
  companyTradeName: string;
  title: string;
  type: "pgr" | "inventory" | "technical_report" | "action_plan" | "other";
  referencePeriod: string;
  status: "draft" | "in_review" | "approved" | "published";
  generatedAt: string;
  approvedAt?: string;
}

export type PsychosocialCampaignStatus =
  | "draft"
  | "active"
  | "threshold_reached"
  | "expired"
  | "extended"
  | "closed"
  | "analysis_in_progress"
  | "completed";

export interface PsychosocialSummary {
  generatedAt: string;
  campaigns: number;
  activeCampaigns: number;
  thresholdReached: number;
  averageResponseRate: number;
  highOrCriticalSectors: number;
  pendingInterviews: number;
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
}

export interface PsychosocialSectorSignal {
  id: string;
  companyTradeName: string;
  sectorName: string;
  participants: number;
  responses: number;
  responseRate: number;
  riskLevel: RiskLevel;
  privacyStatus: "visible" | "aggregated";
  recommendation: string;
}

export type PronusDocumentType =
  | "pgr"
  | "aso"
  | "psychosocial_report"
  | "term"
  | "contract"
  | "evidence"
  | "other";
export type PronusDocumentStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "published"
  | "signed"
  | "expired";
export type DocumentTemplateStatus = "draft" | "active" | "archived";
export type DocumentPublicationStatus = "scheduled" | "published" | "revoked";
export type DocumentSignatureStatus = "pending" | "signed" | "expired";
export type DocumentAudience = "pronus" | "client_hr" | "employee" | "clinical";

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

export interface DocumentsSummary {
  generatedAt: string;
  documents: number;
  pendingReview: number;
  published: number;
  pendingSignatures: number;
}

export interface PronusDocument {
  id: string;
  title: string;
  companyTradeName: string;
  type: PronusDocumentType;
  status: PronusDocumentStatus;
  owner: string;
  version: string;
  dueDate?: string;
  publishedAt?: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: PronusDocumentType;
  owner: string;
  status: DocumentTemplateStatus;
  version: string;
  updatedAt: string;
}

export interface DocumentPublication {
  id: string;
  documentId: string;
  title: string;
  companyTradeName: string;
  audience: DocumentAudience;
  status: DocumentPublicationStatus;
  publishedAt?: string;
  expiresAt?: string;
}

export interface DocumentSignatureRequest {
  id: string;
  documentId: string;
  title: string;
  companyTradeName: string;
  signerName: string;
  signerRole: string;
  status: DocumentSignatureStatus;
  requestedAt: string;
  signedAt?: string;
  expiresAt?: string;
}

export const modules = [
  { name: "Cadastro estrutural", owner: "Operacao", progress: 72, status: "Em desenvolvimento" },
  { name: "Inteligencia regulatoria", owner: "SST", progress: 28, status: "Base inicial" },
  { name: "Risco ocupacional", owner: "SST", progress: 40, status: "Base inicial" },
  { name: "Risco psicossocial", owner: "Psicologia", progress: 34, status: "Base inicial" },
  { name: "Gestao documental", owner: "Operacao", progress: 30, status: "Base inicial" },
];

export const structuralStatusLabels: Record<StructuralStatus, string> = {
  active: "Ativo",
  pending_validation: "Validacao",
  blocked: "Bloqueado",
  inactive: "Inativo",
};

export const companyContractStatusLabels: Record<CompanyContractStatus, string> = {
  prospecting: "Prospeccao",
  onboarding: "Implantacao",
  active: "Contrato ativo",
  suspended: "Suspenso",
  closed: "Encerrado",
};

export const structuralAudienceLabels: Record<StructuralAudience, string> = {
  client: "Cliente",
  client_hr: "RH cliente",
  client_manager: "Gestor cliente",
  pronus_administrative: "Administrativo PRONUS",
  pronus_clinical: "Corpo clinico PRONUS",
};

export const nr01ActionStatusLabels: Record<Nr01ActionPlanItem["status"], string> = {
  open: "Aberta",
  in_progress: "Em execucao",
  done: "Concluida",
  overdue: "Vencida",
};

export const psychosocialCampaignStatusLabels: Record<PsychosocialCampaignStatus, string> = {
  draft: "Rascunho",
  active: "Ativa",
  threshold_reached: "Amostra atingida",
  expired: "Expirada",
  extended: "Prorrogada",
  closed: "Encerrada",
  analysis_in_progress: "Em analise",
  completed: "Concluida",
};

export const pronusDocumentTypeLabels: Record<PronusDocumentType, string> = {
  pgr: "PGR",
  aso: "ASO",
  psychosocial_report: "Relatorio psicossocial",
  term: "Termo",
  contract: "Contrato",
  evidence: "Evidencia",
  other: "Outro",
};

export const pronusDocumentStatusLabels: Record<PronusDocumentStatus, string> = {
  draft: "Rascunho",
  in_review: "Em revisao",
  approved: "Aprovado",
  published: "Publicado",
  signed: "Assinado",
  expired: "Vencido",
};

export const documentTemplateStatusLabels: Record<DocumentTemplateStatus, string> = {
  draft: "Rascunho",
  active: "Ativo",
  archived: "Arquivado",
};

export const documentPublicationStatusLabels: Record<DocumentPublicationStatus, string> = {
  scheduled: "Agendado",
  published: "Publicado",
  revoked: "Revogado",
};

export const documentSignatureStatusLabels: Record<DocumentSignatureStatus, string> = {
  pending: "Pendente",
  signed: "Assinado",
  expired: "Vencido",
};

export const documentAudienceLabels: Record<DocumentAudience, string> = {
  pronus: "PRONUS",
  client_hr: "RH cliente",
  employee: "Colaborador",
  clinical: "Corpo clinico",
};

export const legalObligationLabels: Record<LegalObligationKey, string> = {
  pgr: "PGR",
  pcmso: "PCMSO",
  ltcat: "LTCAT",
  cipa: "CIPA",
  sesmt: "SESMT",
  aet: "AET",
  esocial_s2210: "S-2210 CAT",
  esocial_s2220: "S-2220 ASO",
  esocial_s2240: "S-2240 agentes nocivos",
};

export const riskTypeLabels: Record<RiskTypeKey, string> = {
  physical: "Fisicos",
  chemical: "Quimicos",
  biological: "Biologicos",
  ergonomic: "Ergonomicos",
  accident: "Acidentes",
};

export const analysisDepthLabels: Record<AnalysisDepth, string> = {
  basic: "Basico",
  intermediate: "Intermediario",
  detailed: "Detalhado",
  critical: "Completo e critico",
};

export const employeeMovementTypeLabels: Record<EmployeeMovementType, string> = {
  inclusion: "Inclusao",
  termination: "Desligamento",
  update: "Alteracao cadastral",
};

export const employeeMovementStatusLabels: Record<EmployeeMovementStatus, string> = {
  approved: "Aprovada",
  pending: "Pendente",
  rejected: "Recusada",
};

const fallbackSummary: StructuralSummary = {
  companies: 2,
  units: 6,
  departments: 5,
  jobPositions: 6,
  employees: 474,
  pendingValidations: 1,
};

const fallbackCompanies: StructuralCompany[] = [
  {
    id: "company-pronus-demo",
    groupName: "Grupo Demonstracao",
    tradeName: "Industria Horizonte",
    legalName: "Industria Horizonte Ltda.",
    cnpj: "12.345.678/0001-90",
    contractStatus: "active",
    contractDueDate: "2026-12-31",
    selectedPackage: "Essencial SST + Psicossocial",
    eSocialValidFrom: "2026-04",
    taxClassification: "99",
    primaryCnae: "1091102",
    contactName: "Mariana Costa",
    contactCpf: "111.222.333-44",
    contactPhone: "1133334444",
    contactMobile: "11988887777",
    contactEmail: "rh@industriahorizonte.com.br",
    units: 2,
    departments: 6,
    employees: 148,
    status: "active",
  },
  {
    id: "company-pronus-retail",
    groupName: "Grupo Demonstracao",
    tradeName: "Rede Norte",
    legalName: "Rede Norte Comercio S.A.",
    cnpj: "98.765.432/0001-10",
    contractStatus: "onboarding",
    contractDueDate: "2026-10-31",
    selectedPackage: "Completo Ocupacional",
    eSocialValidFrom: "2026-04",
    taxClassification: "99",
    primaryCnae: "4711302",
    contactName: "Paulo Mendes",
    contactCpf: "222.333.444-55",
    contactPhone: "1144445555",
    contactMobile: "11977776666",
    contactEmail: "rh@redenorte.com.br",
    units: 4,
    departments: 11,
    employees: 326,
    status: "pending_validation",
  },
];

const fallbackUnits: StructuralUnit[] = [
  {
    id: "unit-horizonte-matriz",
    companyTradeName: "Industria Horizonte",
    name: "Matriz",
    code: "HZ-MTZ",
    status: "active",
  },
  {
    id: "unit-horizonte-centro-distribuicao",
    companyTradeName: "Industria Horizonte",
    name: "Centro de Distribuicao",
    code: "HZ-CD",
    status: "active",
  },
  {
    id: "unit-rede-norte-loja-01",
    companyTradeName: "Rede Norte",
    name: "Loja 01",
    code: "RN-L01",
    status: "active",
  },
];

const fallbackDepartments: StructuralDepartment[] = [
  {
    id: "department-horizonte-producao",
    companyTradeName: "Industria Horizonte",
    unitName: "Matriz",
    name: "Producao",
    code: "PROD",
    audience: "client",
    status: "active",
  },
  {
    id: "department-horizonte-manutencao",
    companyTradeName: "Industria Horizonte",
    unitName: "Matriz",
    name: "Manutencao",
    code: "MAN",
    audience: "client",
    status: "active",
  },
  {
    id: "department-rede-norte-atendimento",
    companyTradeName: "Rede Norte",
    unitName: "Loja 01",
    name: "Atendimento",
    code: "ATD",
    audience: "client",
    status: "active",
  },
  {
    id: "department-pronus-administrativo",
    name: "Administrativo PRONUS",
    code: "PRONUS-ADM",
    audience: "pronus_administrative",
    status: "active",
  },
  {
    id: "department-pronus-corpo-clinico",
    name: "Corpo Clinico PRONUS",
    code: "PRONUS-CLIN",
    audience: "pronus_clinical",
    status: "active",
  },
];

const fallbackJobPositions: StructuralJobPosition[] = [
  {
    id: "job-horizonte-operadora-maquina",
    companyTradeName: "Industria Horizonte",
    departmentName: "Producao",
    title: "Operadora de Maquina",
    audience: "client",
    eSocialCode: "CARGO-001",
    cboCode: "7842-05",
    description: "Opera equipamentos industriais conforme procedimento de seguranca.",
    status: "active",
  },
  {
    id: "job-horizonte-tecnico-seguranca",
    companyTradeName: "Industria Horizonte",
    departmentName: "Manutencao",
    title: "Tecnico de Seguranca",
    audience: "client",
    eSocialCode: "CARGO-002",
    cboCode: "3516-05",
    description: "Apoia rotinas de seguranca ocupacional e controles preventivos.",
    status: "active",
  },
  {
    id: "job-rede-norte-supervisora-loja",
    companyTradeName: "Rede Norte",
    departmentName: "Atendimento",
    title: "Supervisora de Loja",
    audience: "client_manager",
    eSocialCode: "CARGO-003",
    cboCode: "5201-10",
    description: "Coordena equipe de atendimento e operacao de loja.",
    status: "active",
  },
  {
    id: "job-rede-norte-auxiliar-logistica",
    companyTradeName: "Rede Norte",
    departmentName: "Logistica",
    title: "Auxiliar de Logistica",
    audience: "client",
    eSocialCode: "CARGO-004",
    cboCode: "4141-05",
    description: "Executa recebimento, conferencia e movimentacao de mercadorias.",
    status: "active",
  },
  {
    id: "job-pronus-analista-administrativo",
    departmentName: "Administrativo PRONUS",
    title: "Analista Administrativo PRONUS",
    audience: "pronus_administrative",
    eSocialCode: "CARGO-005",
    cboCode: "4110-10",
    description: "Apoia rotina administrativa, relacionamento com clientes e controles internos.",
    status: "active",
  },
  {
    id: "job-pronus-medico-ocupacional",
    departmentName: "Corpo Clinico PRONUS",
    title: "Medico do Trabalho",
    audience: "pronus_clinical",
    eSocialCode: "CARGO-006",
    cboCode: "2251-40",
    description: "Atua em avaliacao clinica ocupacional, PCMSO e suporte tecnico ao cliente.",
    status: "active",
  },
];

const fallbackEmployees: StructuralEmployee[] = [
  {
    id: "employee-001",
    companyTradeName: "Industria Horizonte",
    fullName: "Ana Cristina Ramos",
    birthDate: "1989-03-14",
    inclusionDate: "2026-01-05",
    department: "Producao",
    jobPosition: "Operadora de Maquina",
    registrationStatus: "active",
  },
  {
    id: "employee-002",
    companyTradeName: "Industria Horizonte",
    fullName: "Rafael Moreira Lima",
    birthDate: "1982-08-21",
    inclusionDate: "2026-01-05",
    department: "Manutencao",
    jobPosition: "Tecnico de Seguranca",
    registrationStatus: "pending_validation",
  },
  {
    id: "employee-003",
    companyTradeName: "Rede Norte",
    fullName: "Beatriz Almeida Souza",
    birthDate: "1991-11-02",
    inclusionDate: "2026-02-12",
    department: "Atendimento",
    jobPosition: "Supervisora de Loja",
    registrationStatus: "active",
  },
];

const fallbackEmployeeMovements: EmployeeMovement[] = [
  {
    id: "movement-horizonte-update-001",
    type: "update",
    status: "pending",
    source: "client_portal",
    companyId: "company-pronus-demo",
    companyTradeName: "Industria Horizonte",
    employeeId: "employee-002",
    fullName: "Rafael Moreira Lima",
    cpf: "987.654.321-00",
    department: "Manutencao",
    jobPosition: "Tecnico de Seguranca",
    phone: "11 98888-7777",
    notes: "RH solicitou atualizacao de telefone antes do proximo exame periodico.",
    requestedBy: "Mariana Costa",
    createdAt: "2026-04-28T00:00:00.000Z",
    updatedAt: "2026-04-28T00:00:00.000Z",
    slaDueAt: "2026-04-30T00:00:00.000Z",
  },
];

const fallbackNr01Summary: Nr01Summary = {
  risks: 4,
  criticalRisks: 0,
  highRisks: 3,
  openActions: 2,
  overdueActions: 1,
  evidences: 1,
};

const fallbackNr01Risks: Nr01Risk[] = [
  {
    id: "risk-horizonte-ruido",
    companyTradeName: "Industria Horizonte",
    unitName: "Matriz",
    departmentName: "Producao",
    jobPositionTitle: "Operadora de Maquina",
    type: "physical",
    danger: "Ruido continuo acima do nivel de acao",
    risk: "Perda auditiva induzida por ruido",
    probability: 4,
    severity: 4,
    level: "high",
    controlMeasures: ["Uso de protetor auricular", "Dosimetria periodica"],
    status: "active",
  },
  {
    id: "risk-rede-norte-queda",
    companyTradeName: "Rede Norte",
    unitName: "Centro de Distribuicao",
    departmentName: "Logistica",
    jobPositionTitle: "Auxiliar de Logistica",
    type: "accident",
    danger: "Circulacao em area com empilhadeiras",
    risk: "Atropelamento ou colisao interna",
    probability: 3,
    severity: 5,
    level: "high",
    controlMeasures: ["Sinalizacao de rota", "Separacao fisica de pedestres"],
    status: "active",
  },
];

const fallbackNr01Actions: Nr01ActionPlanItem[] = [
  {
    id: "action-ruido-dosimetria",
    riskId: "risk-horizonte-ruido",
    companyTradeName: "Industria Horizonte",
    title: "Atualizar dosimetria da linha de envase",
    responsible: "Equipe SST PRONUS",
    dueDate: "2026-05-20",
    status: "in_progress",
    evidenceCount: 1,
  },
  {
    id: "action-ergonomia-procedimento",
    riskId: "risk-horizonte-ruido",
    companyTradeName: "Industria Horizonte",
    title: "Revisar procedimento de manutencao corretiva",
    responsible: "Engenharia de Seguranca",
    dueDate: "2026-04-20",
    status: "overdue",
    evidenceCount: 0,
  },
];

const fallbackNr01Evidences: Nr01Evidence[] = [
  {
    id: "evidence-ruido-dosimetria-2026",
    actionId: "action-ruido-dosimetria",
    riskId: "risk-horizonte-ruido",
    companyTradeName: "Industria Horizonte",
    title: "Relatorio de dosimetria atualizado",
    type: "measurement",
    responsible: "Higiene Ocupacional PRONUS",
    receivedAt: "2026-04-18",
    status: "accepted",
    notes: "Arquivo validado para revisao do inventario.",
  },
];

const fallbackNr01Documents: Nr01Document[] = [
  {
    id: "document-horizonte-pgr-2026",
    companyTradeName: "Industria Horizonte",
    title: "PGR 2026 - Industria Horizonte",
    type: "pgr",
    referencePeriod: "2026",
    status: "in_review",
    generatedAt: "2026-04-15",
  },
  {
    id: "document-rede-norte-inventario-2026",
    companyTradeName: "Rede Norte",
    title: "Inventario de riscos 2026 - Rede Norte",
    type: "inventory",
    referencePeriod: "2026",
    status: "draft",
    generatedAt: "2026-04-22",
  },
];

const fallbackPsychosocialSummary: PsychosocialSummary = {
  generatedAt: "2026-04-27T00:00:00.000Z",
  campaigns: 2,
  activeCampaigns: 2,
  thresholdReached: 1,
  averageResponseRate: 84,
  highOrCriticalSectors: 1,
  pendingInterviews: 1,
};

const fallbackPsychosocialCampaigns: PsychosocialCampaign[] = [
  {
    id: "campaign-horizonte-2026-01",
    companyTradeName: "Industria Horizonte",
    name: "Campanha Psicossocial 2026 - Industria Horizonte",
    startDate: "2026-04-01",
    endDate: "2026-05-01",
    targetParticipants: 148,
    responseCount: 134,
    responseRate: 91,
    status: "threshold_reached",
  },
  {
    id: "campaign-rede-norte-2026-01",
    companyTradeName: "Rede Norte",
    name: "Campanha Psicossocial 2026 - Rede Norte",
    startDate: "2026-04-10",
    endDate: "2026-05-10",
    targetParticipants: 326,
    responseCount: 251,
    responseRate: 77,
    status: "active",
  },
];

const fallbackPsychosocialSignals: PsychosocialSectorSignal[] = [
  {
    id: "signal-horizonte-producao",
    companyTradeName: "Industria Horizonte",
    sectorName: "Producao",
    participants: 82,
    responses: 75,
    responseRate: 91,
    riskLevel: "moderate",
    privacyStatus: "visible",
    recommendation: "Monitorar carga de trabalho e reforcar comunicacao com liderancas.",
  },
  {
    id: "signal-horizonte-manutencao",
    companyTradeName: "Industria Horizonte",
    sectorName: "Manutencao",
    participants: 5,
    responses: 5,
    responseRate: 100,
    riskLevel: "high",
    privacyStatus: "visible",
    recommendation: "Priorizar entrevista tecnica e revisao de organizacao de plantao.",
  },
  {
    id: "signal-rede-norte-atendimento",
    companyTradeName: "Rede Norte",
    sectorName: "Atendimento",
    participants: 120,
    responses: 92,
    responseRate: 77,
    riskLevel: "low",
    privacyStatus: "visible",
    recommendation: "Manter monitoramento e incentivar adesao ate 89%.",
  },
  {
    id: "signal-rede-norte-grupo-agregado",
    companyTradeName: "Rede Norte",
    sectorName: "Setores agregados",
    participants: 9,
    responses: 7,
    responseRate: 78,
    riskLevel: "moderate",
    privacyStatus: "aggregated",
    recommendation: "Dados agrupados para preservar privacidade de setores pequenos.",
  },
];

const fallbackDocumentsSummary: DocumentsSummary = {
  generatedAt: "2026-04-28T00:00:00.000Z",
  documents: 3,
  pendingReview: 1,
  published: 1,
  pendingSignatures: 1,
};

const fallbackDocuments: PronusDocument[] = [
  {
    id: "document-horizonte-pgr-2026",
    title: "PGR 2026 - Industria Horizonte",
    companyTradeName: "Industria Horizonte",
    type: "pgr",
    status: "in_review",
    owner: "SST PRONUS",
    version: "1.0",
    dueDate: "2026-05-10",
  },
  {
    id: "document-rede-norte-relatorio-psicossocial",
    title: "Relatorio psicossocial - Rede Norte",
    companyTradeName: "Rede Norte",
    type: "psychosocial_report",
    status: "draft",
    owner: "Psicologia PRONUS",
    version: "0.2",
    dueDate: "2026-05-18",
  },
  {
    id: "document-horizonte-termo-lgpd",
    title: "Termo de ciencia LGPD - Industria Horizonte",
    companyTradeName: "Industria Horizonte",
    type: "term",
    status: "published",
    owner: "Operacao PRONUS",
    version: "1.1",
    publishedAt: "2026-04-24",
  },
];

const fallbackDocumentTemplates: DocumentTemplate[] = [
  {
    id: "template-pgr",
    name: "Modelo PGR padrao PRONUS",
    type: "pgr",
    owner: "SST PRONUS",
    status: "active",
    version: "2.1",
    updatedAt: "2026-04-20",
  },
  {
    id: "template-psychosocial-report",
    name: "Modelo relatorio psicossocial agregado",
    type: "psychosocial_report",
    owner: "Psicologia PRONUS",
    status: "draft",
    version: "0.8",
    updatedAt: "2026-04-22",
  },
  {
    id: "template-term-lgpd",
    name: "Termo de ciencia e privacidade",
    type: "term",
    owner: "Operacao PRONUS",
    status: "active",
    version: "1.3",
    updatedAt: "2026-04-24",
  },
];

const fallbackDocumentPublications: DocumentPublication[] = [
  {
    id: "publication-horizonte-termo-lgpd",
    documentId: "document-horizonte-termo-lgpd",
    title: "Termo de ciencia LGPD - Industria Horizonte",
    companyTradeName: "Industria Horizonte",
    audience: "client_hr",
    status: "published",
    publishedAt: "2026-04-24",
    expiresAt: "2026-12-31",
  },
];

const fallbackDocumentSignatures: DocumentSignatureRequest[] = [
  {
    id: "signature-horizonte-termo-lgpd",
    documentId: "document-horizonte-termo-lgpd",
    title: "Termo de ciencia LGPD - Industria Horizonte",
    companyTradeName: "Industria Horizonte",
    signerName: "Mariana Costa",
    signerRole: "RH cliente",
    status: "pending",
    requestedAt: "2026-04-24",
    expiresAt: "2026-05-08",
  },
];

export const fallbackLegalObligations: LegalObligationDefinition[] = [
  { key: "pgr", label: "PGR", reference: "NR-01" },
  { key: "pcmso", label: "PCMSO", reference: "NR-07" },
  { key: "ltcat", label: "LTCAT", reference: "Lei 8.213/1991 e eSocial SST" },
  { key: "cipa", label: "CIPA", reference: "NR-05" },
  { key: "sesmt", label: "SESMT", reference: "NR-04" },
  { key: "aet", label: "AET", reference: "NR-17" },
  { key: "esocial_s2210", label: "S-2210 CAT", reference: "eSocial SST" },
  { key: "esocial_s2220", label: "S-2220 ASO", reference: "eSocial SST" },
  { key: "esocial_s2240", label: "S-2240 agentes nocivos", reference: "eSocial SST" },
];

export const fallbackRegulatoryCnaes: RegulatoryCnae[] = [
  {
    code: "1091102",
    description: "Fabricacao de produtos de panificacao industrial",
    riskDegree: 3,
    activityClassification: "Industria de alimentos",
    obligations: ["pgr", "pcmso", "ltcat", "esocial_s2210", "esocial_s2220", "esocial_s2240"],
    conditionalObligations: ["cipa", "sesmt", "aet"],
    sourceNote: "Semente PRONUS baseada no fluxo CNAE/GR da NR-04.",
  },
  {
    code: "4711302",
    description: "Comercio varejista de mercadorias em geral com predominancia de alimentos",
    riskDegree: 2,
    activityClassification: "Comercio varejista",
    obligations: ["pgr", "pcmso", "ltcat", "esocial_s2210", "esocial_s2220", "esocial_s2240"],
    conditionalObligations: ["cipa", "sesmt", "aet"],
    sourceNote: "Semente PRONUS baseada no fluxo CNAE/GR da NR-04.",
  },
  {
    code: "8211300",
    description: "Servicos combinados de escritorio e apoio administrativo",
    riskDegree: 1,
    activityClassification: "Administrativo e apoio",
    obligations: ["pgr", "pcmso", "ltcat", "esocial_s2210", "esocial_s2220", "esocial_s2240"],
    conditionalObligations: ["cipa", "sesmt", "aet"],
    sourceNote: "Semente PRONUS baseada no fluxo CNAE/GR da NR-04.",
  },
  {
    code: "4120400",
    description: "Construcao de edificios",
    riskDegree: 3,
    activityClassification: "Construcao civil",
    obligations: ["pgr", "pcmso", "ltcat", "esocial_s2210", "esocial_s2220", "esocial_s2240"],
    conditionalObligations: ["cipa", "sesmt", "aet"],
    sourceNote: "Semente PRONUS baseada no fluxo CNAE/GR da NR-04.",
  },
  {
    code: "0710301",
    description: "Extracao de minerio de ferro",
    riskDegree: 4,
    activityClassification: "Mineracao",
    obligations: ["pgr", "pcmso", "ltcat", "esocial_s2210", "esocial_s2220", "esocial_s2240"],
    conditionalObligations: ["cipa", "sesmt", "aet"],
    sourceNote: "Semente PRONUS baseada no fluxo CNAE/GR da NR-04.",
  },
];

export const fallbackRegulatoryRiskDegrees: RegulatoryRiskDegree[] = [
  {
    degree: 1,
    description: "Baixa complexidade operacional com exposicoes pontuais e baixa severidade.",
    requiredRiskTypes: ["physical", "chemical", "biological", "ergonomic", "accident"],
    analysisDepth: "basic",
    inventoryRequired: true,
    actionPlanRequired: true,
    reviewFrequencyMonths: 24,
  },
  {
    degree: 2,
    description:
      "Operacao com riscos moderados, rotinas repetitivas e necessidade de controles formais.",
    requiredRiskTypes: ["physical", "chemical", "biological", "ergonomic", "accident"],
    analysisDepth: "intermediate",
    inventoryRequired: true,
    actionPlanRequired: true,
    reviewFrequencyMonths: 18,
  },
  {
    degree: 3,
    description:
      "Operacao com exposicoes relevantes, processos produtivos e controles tecnicos obrigatorios.",
    requiredRiskTypes: ["physical", "chemical", "biological", "ergonomic", "accident"],
    analysisDepth: "detailed",
    inventoryRequired: true,
    actionPlanRequired: true,
    reviewFrequencyMonths: 12,
  },
  {
    degree: 4,
    description: "Operacao critica com alto potencial de dano, exigindo investigacao completa.",
    requiredRiskTypes: ["physical", "chemical", "biological", "ergonomic", "accident"],
    analysisDepth: "critical",
    inventoryRequired: true,
    actionPlanRequired: true,
    reviewFrequencyMonths: 6,
  },
];

async function fetchApi<T>(path: string, fallback: T): Promise<T> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

  try {
    const response = await fetch(`${apiUrl}${path}`, { cache: "no-store" });

    if (!response.ok) {
      return fallback;
    }

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function loadStructuralData() {
  const [summary, companies, employees, employeeMovements, units, departments, jobPositions] =
    await Promise.all([
      fetchApi<StructuralSummary>("/structural/summary", fallbackSummary),
      fetchApi<StructuralCompany[]>("/structural/companies", fallbackCompanies),
      fetchApi<StructuralEmployee[]>("/structural/employees", fallbackEmployees),
      fetchApi<EmployeeMovement[]>("/structural/employee-movements", fallbackEmployeeMovements),
      fetchApi<StructuralUnit[]>("/structural/units", fallbackUnits),
      fetchApi<StructuralDepartment[]>("/structural/departments", fallbackDepartments),
      fetchApi<StructuralJobPosition[]>("/structural/job-positions", fallbackJobPositions),
    ]);

  return { summary, companies, employees, employeeMovements, units, departments, jobPositions };
}

export async function loadNr01Data() {
  const [summary, risks, actions, evidences, documents] = await Promise.all([
    fetchApi<Nr01Summary>("/nr01/summary", fallbackNr01Summary),
    fetchApi<Nr01Risk[]>("/nr01/risks", fallbackNr01Risks),
    fetchApi<Nr01ActionPlanItem[]>("/nr01/action-plan", fallbackNr01Actions),
    fetchApi<Nr01Evidence[]>("/nr01/evidences", fallbackNr01Evidences),
    fetchApi<Nr01Document[]>("/nr01/documents", fallbackNr01Documents),
  ]);

  return { summary, risks, actions, evidences, documents };
}

export async function loadPsychosocialData() {
  const [summary, campaigns, signals] = await Promise.all([
    fetchApi<PsychosocialSummary>("/psychosocial/summary", fallbackPsychosocialSummary),
    fetchApi<PsychosocialCampaign[]>("/psychosocial/campaigns", fallbackPsychosocialCampaigns),
    fetchApi<PsychosocialSectorSignal[]>(
      "/psychosocial/sector-signals",
      fallbackPsychosocialSignals,
    ),
  ]);

  return { summary, campaigns, signals };
}

export async function loadDocumentsData() {
  const [summary, documents, templates, publications, signatures] = await Promise.all([
    fetchApi<DocumentsSummary>("/documents/summary", fallbackDocumentsSummary),
    fetchApi<PronusDocument[]>("/documents", fallbackDocuments),
    fetchApi<DocumentTemplate[]>("/documents/templates", fallbackDocumentTemplates),
    fetchApi<DocumentPublication[]>("/documents/publications", fallbackDocumentPublications),
    fetchApi<DocumentSignatureRequest[]>("/documents/signatures", fallbackDocumentSignatures),
  ]);

  return { summary, documents, templates, publications, signatures };
}

export async function loadRegulatoryIntelligenceData() {
  const [cnaes, riskDegrees, obligations] = await Promise.all([
    fetchApi<RegulatoryCnae[]>("/regulatory-intelligence/cnaes", fallbackRegulatoryCnaes),
    fetchApi<RegulatoryRiskDegree[]>(
      "/regulatory-intelligence/risk-degrees",
      fallbackRegulatoryRiskDegrees,
    ),
    fetchApi<LegalObligationDefinition[]>(
      "/regulatory-intelligence/obligations",
      fallbackLegalObligations,
    ),
  ]);

  return { cnaes, riskDegrees, obligations };
}

export function statusClasses(status: StructuralStatus) {
  if (status === "active") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (status === "pending_validation") {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }

  if (status === "blocked") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

export function employeeMovementStatusClasses(status: EmployeeMovementStatus) {
  if (status === "approved") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (status === "rejected") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
}

export function contractStatusClasses(status: CompanyContractStatus | undefined) {
  if (status === "active") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (status === "onboarding") {
    return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
  }

  if (status === "suspended") {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }

  if (status === "closed") {
    return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }

  return "bg-violet-50 text-violet-700 ring-1 ring-violet-200";
}

export function actionStatusClasses(status: Nr01ActionPlanItem["status"]) {
  if (status === "overdue") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  if (status === "in_progress") {
    return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
  }

  if (status === "done") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
}

export function campaignStatusClasses(status: PsychosocialCampaignStatus) {
  if (status === "threshold_reached" || status === "completed") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (status === "active" || status === "analysis_in_progress") {
    return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
  }

  if (status === "expired") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  if (status === "extended") {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

export function evidenceStatusClasses(status: Nr01Evidence["status"]) {
  if (status === "accepted") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (status === "rejected") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
}

export function documentStatusClasses(status: Nr01Document["status"]) {
  if (status === "published") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (status === "approved") {
    return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
  }

  if (status === "in_review") {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

export function pronusDocumentStatusClasses(status: PronusDocumentStatus) {
  if (status === "published" || status === "signed") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (status === "approved") {
    return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
  }

  if (status === "in_review") {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }

  if (status === "expired") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

export function documentTemplateStatusClasses(status: DocumentTemplateStatus) {
  if (status === "active") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (status === "archived") {
    return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }

  return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
}

export function documentPublicationStatusClasses(status: DocumentPublicationStatus) {
  if (status === "published") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (status === "revoked") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
}

export function documentSignatureStatusClasses(status: DocumentSignatureStatus) {
  if (status === "signed") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (status === "expired") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
}
