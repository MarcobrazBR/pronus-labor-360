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

export interface StructuralCompany {
  id: string;
  tradeName: string;
  legalName?: string;
  cnpj: string;
  contractStatus?: CompanyContractStatus;
  contractDueDate?: string;
  selectedPackage?: string;
  primaryCnae?: string;
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
  department: string;
  jobPosition: string;
  cboCode?: string;
  email?: string;
  phone?: string;
  registrationStatus: StructuralStatus;
  updatedAt?: string;
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

export type DivergenceStatus = "pending" | "approved" | "rejected";

export interface EmployeeDivergence {
  id: string;
  companyTradeName: string;
  fullName: string;
  cpf: string;
  status: DivergenceStatus;
  changes: Array<{
    field: string;
    currentValue: string;
    submittedValue: string;
  }>;
  createdAt: string;
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

export interface Nr01Risk {
  id: string;
  companyTradeName: string;
  unitName?: string;
  departmentName: string;
  jobPositionTitle?: string;
  type?: "physical" | "chemical" | "biological" | "ergonomic" | "accident";
  danger: string;
  risk: string;
  level: "low" | "moderate" | "high" | "critical";
  status: "draft" | "active" | "review" | "archived";
}

export interface Nr01ActionPlanItem {
  id: string;
  companyTradeName: string;
  title: string;
  responsible: string;
  dueDate: string;
  status: "open" | "in_progress" | "done" | "overdue";
  evidenceCount: number;
}

export interface PronusDocument {
  id: string;
  title: string;
  companyTradeName: string;
  type: "pgr" | "aso" | "psychosocial_report" | "term" | "contract" | "evidence" | "other";
  status: "draft" | "in_review" | "approved" | "published" | "signed" | "expired";
  owner: string;
  version: string;
  dueDate?: string;
  publishedAt?: string;
}

export interface DocumentSignatureRequest {
  id: string;
  title: string;
  companyTradeName: string;
  signerName: string;
  signerRole: string;
  status: "pending" | "signed" | "expired";
  requestedAt: string;
  signedAt?: string;
  expiresAt?: string;
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
  riskLevel: "low" | "moderate" | "high" | "critical";
  privacyStatus: "visible" | "aggregated";
  recommendation: string;
}

export interface ClientPortalData {
  activeCompany: StructuralCompany;
  companies: StructuralCompany[];
  divergences: EmployeeDivergence[];
  documents: PronusDocument[];
  departments: StructuralDepartment[];
  employees: StructuralEmployee[];
  employeeMovements: EmployeeMovement[];
  jobPositions: StructuralJobPosition[];
  psychosocialCampaigns: PsychosocialCampaign[];
  psychosocialSignals: PsychosocialSectorSignal[];
  risks: Nr01Risk[];
  riskActions: Nr01ActionPlanItem[];
  signatures: DocumentSignatureRequest[];
}

export const structuralStatusLabels: Record<StructuralStatus, string> = {
  active: "Ativo",
  pending_validation: "Validação",
  blocked: "Bloqueado",
  inactive: "Inativo",
};

export const contractStatusLabels: Record<CompanyContractStatus, string> = {
  active: "Contrato ativo",
  closed: "Encerrado",
  onboarding: "Implantação",
  prospecting: "Prospecção",
  suspended: "Suspenso",
};

export const divergenceStatusLabels: Record<DivergenceStatus, string> = {
  approved: "Aprovada",
  pending: "Pendente",
  rejected: "Recusada",
};

export const employeeMovementTypeLabels: Record<EmployeeMovementType, string> = {
  inclusion: "Inclusao",
  termination: "Desligamento",
  update: "Alteracao cadastral",
};

export const employeeMovementStatusLabels: Record<EmployeeMovementStatus, string> = {
  approved: "Aprovada",
  pending: "Pendente PRONUS",
  rejected: "Recusada",
};

export const fieldLabels: Record<string, string> = {
  department: "Setor",
  email: "E-mail",
  jobPosition: "Cargo",
  phone: "Telefone",
};

export const riskLevelLabels: Record<Nr01Risk["level"], string> = {
  critical: "Crítico",
  high: "Alto",
  low: "Baixo",
  moderate: "Médio",
};

export const actionStatusLabels: Record<Nr01ActionPlanItem["status"], string> = {
  done: "Concluída",
  in_progress: "Em execução",
  open: "Aberta",
  overdue: "Vencida",
};

export const documentStatusLabels: Record<PronusDocument["status"], string> = {
  approved: "Aprovado",
  draft: "Rascunho",
  expired: "Vencido",
  in_review: "Em revisão",
  published: "Publicado",
  signed: "Assinado",
};

export const campaignStatusLabels: Record<PsychosocialCampaignStatus, string> = {
  active: "Ativa",
  analysis_in_progress: "Em análise",
  closed: "Encerrada",
  completed: "Concluída",
  draft: "Rascunho",
  expired: "Expirada",
  extended: "Prorrogada",
  threshold_reached: "Amostra atingida",
};

const fallbackCompanies: StructuralCompany[] = [
  {
    cnpj: "12.345.678/0001-90",
    contractDueDate: "2026-12-31",
    contractStatus: "active",
    departments: 6,
    employees: 148,
    id: "company-pronus-demo",
    legalName: "Industria Horizonte Ltda.",
    primaryCnae: "1091102",
    selectedPackage: "Essencial SST + Psicossocial",
    status: "active",
    tradeName: "Industria Horizonte",
    units: 2,
  },
  {
    cnpj: "98.765.432/0001-10",
    contractDueDate: "2026-10-31",
    contractStatus: "onboarding",
    departments: 11,
    employees: 326,
    id: "company-pronus-retail",
    legalName: "Rede Norte Comercio S.A.",
    primaryCnae: "4711302",
    selectedPackage: "Completo Ocupacional",
    status: "pending_validation",
    tradeName: "Rede Norte",
    units: 4,
  },
];
const fallbackActiveCompany: StructuralCompany = {
  cnpj: "00.000.000/0000-00",
  contractStatus: "onboarding",
  departments: 0,
  employees: 0,
  id: "company-fallback",
  legalName: "Empresa cliente",
  selectedPackage: "Pendente",
  status: "pending_validation",
  tradeName: "Empresa cliente",
  units: 0,
};

const fallbackEmployees: StructuralEmployee[] = [
  {
    companyTradeName: "Industria Horizonte",
    cpf: "123.456.789-09",
    department: "Producao",
    fullName: "Ana Cristina Ramos",
    id: "employee-001",
    inclusionDate: "2026-01-05",
    jobPosition: "Operadora de Maquina",
    cboCode: "7842-05",
    registrationStatus: "active",
  },
  {
    companyTradeName: "Industria Horizonte",
    cpf: "987.654.321-00",
    department: "Manutencao",
    fullName: "Rafael Moreira Lima",
    id: "employee-002",
    inclusionDate: "2026-01-05",
    jobPosition: "Tecnico de Seguranca",
    cboCode: "3516-05",
    registrationStatus: "pending_validation",
  },
  {
    companyTradeName: "Rede Norte",
    cpf: "456.789.123-44",
    department: "Atendimento",
    fullName: "Beatriz Almeida Souza",
    id: "employee-003",
    inclusionDate: "2026-02-12",
    jobPosition: "Supervisora de Loja",
    cboCode: "5201-10",
    registrationStatus: "active",
  },
];

const fallbackDepartments: StructuralDepartment[] = [
  {
    companyTradeName: "Industria Horizonte",
    id: "department-horizonte-producao",
    name: "Producao",
    code: "PROD",
    audience: "client",
    status: "active",
    unitName: "Matriz",
  },
  {
    companyTradeName: "Industria Horizonte",
    id: "department-horizonte-manutencao",
    name: "Manutencao",
    code: "MAN",
    audience: "client",
    status: "active",
    unitName: "Matriz",
  },
  {
    companyTradeName: "Industria Horizonte",
    id: "department-horizonte-rh",
    name: "Recursos Humanos",
    code: "RH",
    audience: "client_hr",
    status: "active",
    unitName: "Centro de Distribuicao",
  },
];

const fallbackJobPositions: StructuralJobPosition[] = [
  {
    companyTradeName: "Industria Horizonte",
    departmentName: "Producao",
    id: "job-horizonte-operadora-maquina",
    title: "Operadora de Maquina",
    audience: "client",
    eSocialCode: "CARGO-001",
    cboCode: "7842-05",
    status: "active",
  },
  {
    companyTradeName: "Industria Horizonte",
    departmentName: "Manutencao",
    id: "job-horizonte-tecnico-seguranca",
    title: "Tecnico de Seguranca",
    audience: "client",
    eSocialCode: "CARGO-002",
    cboCode: "3516-05",
    status: "active",
  },
  {
    companyTradeName: "Industria Horizonte",
    departmentName: "Recursos Humanos",
    id: "job-horizonte-analista-rh",
    title: "Analista de RH",
    audience: "client_hr",
    eSocialCode: "CARGO-007",
    cboCode: "2524-05",
    status: "active",
  },
];

const fallbackDivergences: EmployeeDivergence[] = [
  {
    changes: [{ currentValue: "", field: "phone", submittedValue: "11 98888-7777" }],
    companyTradeName: "Industria Horizonte",
    cpf: "987.654.321-00",
    createdAt: new Date().toISOString(),
    fullName: "Rafael Moreira Lima",
    id: "divergence-001",
    status: "pending",
  },
];

const fallbackEmployeeMovements: EmployeeMovement[] = [
  {
    companyId: "company-pronus-demo",
    companyTradeName: "Industria Horizonte",
    cpf: "987.654.321-00",
    createdAt: new Date().toISOString(),
    department: "Manutencao",
    employeeId: "employee-002",
    fullName: "Rafael Moreira Lima",
    id: "movement-horizonte-update-001",
    jobPosition: "Tecnico de Seguranca",
    cboCode: "3516-05",
    notes: "RH solicitou atualizacao de telefone antes do proximo exame periodico.",
    phone: "11 98888-7777",
    requestedBy: "Mariana Costa",
    slaDueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    source: "client_portal",
    status: "pending",
    type: "update",
    updatedAt: new Date().toISOString(),
  },
];

const fallbackRisks: Nr01Risk[] = [
  {
    companyTradeName: "Industria Horizonte",
    danger: "Ruido continuo acima do nivel de acao",
    departmentName: "Producao",
    id: "risk-horizonte-ruido",
    jobPositionTitle: "Operadora de Maquina",
    level: "high",
    risk: "Perda auditiva induzida por ruido",
    status: "active",
    type: "physical",
    unitName: "Matriz",
  },
  {
    companyTradeName: "Industria Horizonte",
    danger: "Posturas forcadas em manutencao corretiva",
    departmentName: "Manutencao",
    id: "risk-horizonte-ergonomia",
    jobPositionTitle: "Tecnico de Seguranca",
    level: "high",
    risk: "Disturbios osteomusculares relacionados ao trabalho",
    status: "review",
    type: "ergonomic",
    unitName: "Matriz",
  },
];

const fallbackRiskActions: Nr01ActionPlanItem[] = [
  {
    companyTradeName: "Industria Horizonte",
    dueDate: "2026-05-20",
    evidenceCount: 1,
    id: "action-ruido-dosimetria",
    responsible: "Equipe SST PRONUS",
    status: "in_progress",
    title: "Atualizar dosimetria da linha de envase",
  },
];

const fallbackDocuments: PronusDocument[] = [
  {
    companyTradeName: "Industria Horizonte",
    dueDate: "2026-05-10",
    id: "document-horizonte-pgr-2026",
    owner: "SST PRONUS",
    status: "in_review",
    title: "PGR 2026 - Industria Horizonte",
    type: "pgr",
    version: "1.0",
  },
  {
    companyTradeName: "Industria Horizonte",
    id: "document-horizonte-termo-lgpd",
    owner: "Operacao PRONUS",
    publishedAt: "2026-04-24",
    status: "published",
    title: "Termo de ciencia LGPD - Industria Horizonte",
    type: "term",
    version: "1.1",
  },
];

const fallbackSignatures: DocumentSignatureRequest[] = [
  {
    companyTradeName: "Industria Horizonte",
    expiresAt: "2026-05-08",
    id: "signature-horizonte-termo-lgpd",
    requestedAt: "2026-04-24",
    signerName: "Mariana Costa",
    signerRole: "RH cliente",
    status: "pending",
    title: "Termo de ciencia LGPD - Industria Horizonte",
  },
];

const fallbackCampaigns: PsychosocialCampaign[] = [
  {
    companyTradeName: "Industria Horizonte",
    endDate: "2026-05-01",
    id: "campaign-horizonte-2026-01",
    name: "Campanha Psicossocial 2026 - Industria Horizonte",
    responseCount: 134,
    responseRate: 91,
    startDate: "2026-04-01",
    status: "threshold_reached",
    targetParticipants: 148,
  },
];

const fallbackSignals: PsychosocialSectorSignal[] = [
  {
    companyTradeName: "Industria Horizonte",
    id: "signal-horizonte-producao",
    participants: 82,
    privacyStatus: "visible",
    recommendation: "Monitorar carga de trabalho e reforcar comunicacao com liderancas.",
    responseRate: 91,
    responses: 75,
    riskLevel: "moderate",
    sectorName: "Producao",
  },
  {
    companyTradeName: "Industria Horizonte",
    id: "signal-horizonte-manutencao",
    participants: 5,
    privacyStatus: "visible",
    recommendation: "Priorizar entrevista tecnica e revisao de organizacao de plantao.",
    responseRate: 100,
    responses: 5,
    riskLevel: "high",
    sectorName: "Manutencao",
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

function byCompany<T extends { companyTradeName?: string }>(items: T[], companyTradeName: string) {
  return items.filter((item) => item.companyTradeName === companyTradeName);
}

export async function loadClientPortalData(companyTradeName = "Industria Horizonte") {
  const [
    companies,
    employees,
    employeeMovements,
    departments,
    jobPositions,
    divergences,
    risks,
    riskActions,
    documents,
    signatures,
    campaigns,
    signals,
  ] = await Promise.all([
    fetchApi<StructuralCompany[]>("/structural/companies", fallbackCompanies),
    fetchApi<StructuralEmployee[]>("/structural/employees", fallbackEmployees),
    fetchApi<EmployeeMovement[]>("/structural/employee-movements", fallbackEmployeeMovements),
    fetchApi<StructuralDepartment[]>("/structural/departments", fallbackDepartments),
    fetchApi<StructuralJobPosition[]>("/structural/job-positions", fallbackJobPositions),
    fetchApi<EmployeeDivergence[]>("/employee-access/divergences", fallbackDivergences),
    fetchApi<Nr01Risk[]>("/nr01/risks", fallbackRisks),
    fetchApi<Nr01ActionPlanItem[]>("/nr01/action-plan", fallbackRiskActions),
    fetchApi<PronusDocument[]>("/documents", fallbackDocuments),
    fetchApi<DocumentSignatureRequest[]>("/documents/signatures", fallbackSignatures),
    fetchApi<PsychosocialCampaign[]>("/psychosocial/campaigns", fallbackCampaigns),
    fetchApi<PsychosocialSectorSignal[]>("/psychosocial/sector-signals", fallbackSignals),
  ]);
  const activeCompany =
    companies.find((company) => company.tradeName === companyTradeName) ??
    companies[0] ??
    fallbackCompanies[0] ??
    fallbackActiveCompany;
  const activeName = activeCompany.tradeName;

  return {
    activeCompany,
    companies,
    departments: byCompany(departments, activeName),
    divergences: byCompany(divergences, activeName),
    documents: byCompany(documents, activeName),
    employees: byCompany(employees, activeName),
    employeeMovements: byCompany(employeeMovements, activeName),
    jobPositions: byCompany(jobPositions, activeName),
    psychosocialCampaigns: byCompany(campaigns, activeName),
    psychosocialSignals: byCompany(signals, activeName),
    risks: byCompany(risks, activeName),
    riskActions: byCompany(riskActions, activeName),
    signatures: byCompany(signatures, activeName),
  };
}

export function dateLabel(value: string | undefined) {
  if (value === undefined || value.length === 0) {
    return "Pendente";
  }

  const date = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Pendente";
  }

  return date.toLocaleDateString("pt-BR");
}

export function statusClasses(status: StructuralStatus | DivergenceStatus | string) {
  if (
    status === "active" ||
    status === "approved" ||
    status === "published" ||
    status === "signed" ||
    status === "sent"
  ) {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (
    status === "pending" ||
    status === "pending_validation" ||
    status === "in_review" ||
    status === "in_progress" ||
    status === "threshold_reached" ||
    status === "draft"
  ) {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }

  if (
    status === "overdue" ||
    status === "rejected" ||
    status === "expired" ||
    status === "critical" ||
    status === "failed"
  ) {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  if (status === "high") {
    return "bg-orange-50 text-orange-700 ring-1 ring-orange-200";
  }

  if (status === "moderate") {
    return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}
