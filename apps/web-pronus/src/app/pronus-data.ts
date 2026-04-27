import type { RiskLevel } from "@pronus/types";

export type StructuralStatus = "active" | "pending_validation" | "blocked" | "inactive";
export type CompanyContractStatus =
  | "prospecting"
  | "onboarding"
  | "active"
  | "suspended"
  | "closed";

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
  companyTradeName: string;
  fullName: string;
  department: string;
  jobPosition: string;
  registrationStatus: StructuralStatus;
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
  companyTradeName: string;
  unitName?: string;
  name: string;
  code?: string;
  status: StructuralStatus;
}

export interface StructuralJobPosition {
  id: string;
  companyTradeName: string;
  departmentName?: string;
  title: string;
  cboCode?: string;
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
  departmentName: string;
  danger: string;
  risk: string;
  probability: number;
  severity: number;
  level: RiskLevel;
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

export const modules = [
  { name: "Cadastro estrutural", owner: "Operacao", progress: 72, status: "Em desenvolvimento" },
  { name: "NR-01 / GRO / PGR", owner: "SST", progress: 40, status: "Base inicial" },
  { name: "Risco psicossocial", owner: "Psicologia", progress: 34, status: "Base inicial" },
  { name: "Documentos iniciais", owner: "Operacao", progress: 12, status: "Fila" },
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

const fallbackSummary: StructuralSummary = {
  companies: 2,
  units: 6,
  departments: 6,
  jobPositions: 4,
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
    status: "active",
  },
  {
    id: "department-horizonte-manutencao",
    companyTradeName: "Industria Horizonte",
    unitName: "Matriz",
    name: "Manutencao",
    code: "MAN",
    status: "active",
  },
  {
    id: "department-rede-norte-atendimento",
    companyTradeName: "Rede Norte",
    unitName: "Loja 01",
    name: "Atendimento",
    code: "ATD",
    status: "active",
  },
];

const fallbackJobPositions: StructuralJobPosition[] = [
  {
    id: "job-horizonte-operadora-maquina",
    companyTradeName: "Industria Horizonte",
    departmentName: "Producao",
    title: "Operadora de Maquina",
    cboCode: "7842-05",
    status: "active",
  },
  {
    id: "job-horizonte-tecnico-seguranca",
    companyTradeName: "Industria Horizonte",
    departmentName: "Manutencao",
    title: "Tecnico de Seguranca",
    cboCode: "3516-05",
    status: "active",
  },
  {
    id: "job-rede-norte-supervisora-loja",
    companyTradeName: "Rede Norte",
    departmentName: "Atendimento",
    title: "Supervisora de Loja",
    cboCode: "5201-10",
    status: "active",
  },
];

const fallbackEmployees: StructuralEmployee[] = [
  {
    id: "employee-001",
    companyTradeName: "Industria Horizonte",
    fullName: "Ana Cristina Ramos",
    department: "Producao",
    jobPosition: "Operadora de Maquina",
    registrationStatus: "active",
  },
  {
    id: "employee-002",
    companyTradeName: "Industria Horizonte",
    fullName: "Rafael Moreira Lima",
    department: "Manutencao",
    jobPosition: "Tecnico de Seguranca",
    registrationStatus: "pending_validation",
  },
  {
    id: "employee-003",
    companyTradeName: "Rede Norte",
    fullName: "Beatriz Almeida Souza",
    department: "Atendimento",
    jobPosition: "Supervisora de Loja",
    registrationStatus: "active",
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
    departmentName: "Producao",
    danger: "Ruido continuo acima do nivel de acao",
    risk: "Perda auditiva induzida por ruido",
    probability: 4,
    severity: 4,
    level: "high",
    status: "active",
  },
  {
    id: "risk-rede-norte-queda",
    companyTradeName: "Rede Norte",
    departmentName: "Logistica",
    danger: "Circulacao em area com empilhadeiras",
    risk: "Atropelamento ou colisao interna",
    probability: 3,
    severity: 5,
    level: "high",
    status: "active",
  },
];

const fallbackNr01Actions: Nr01ActionPlanItem[] = [
  {
    id: "action-ruido-dosimetria",
    companyTradeName: "Industria Horizonte",
    title: "Atualizar dosimetria da linha de envase",
    responsible: "Equipe SST PRONUS",
    dueDate: "2026-05-20",
    status: "in_progress",
    evidenceCount: 1,
  },
  {
    id: "action-ergonomia-procedimento",
    companyTradeName: "Industria Horizonte",
    title: "Revisar procedimento de manutencao corretiva",
    responsible: "Engenharia de Seguranca",
    dueDate: "2026-04-20",
    status: "overdue",
    evidenceCount: 0,
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
  const [summary, companies, employees, units, departments, jobPositions] = await Promise.all([
    fetchApi<StructuralSummary>("/structural/summary", fallbackSummary),
    fetchApi<StructuralCompany[]>("/structural/companies", fallbackCompanies),
    fetchApi<StructuralEmployee[]>("/structural/employees", fallbackEmployees),
    fetchApi<StructuralUnit[]>("/structural/units", fallbackUnits),
    fetchApi<StructuralDepartment[]>("/structural/departments", fallbackDepartments),
    fetchApi<StructuralJobPosition[]>("/structural/job-positions", fallbackJobPositions),
  ]);

  return { summary, companies, employees, units, departments, jobPositions };
}

export async function loadNr01Data() {
  const [summary, risks, actions] = await Promise.all([
    fetchApi<Nr01Summary>("/nr01/summary", fallbackNr01Summary),
    fetchApi<Nr01Risk[]>("/nr01/risks", fallbackNr01Risks),
    fetchApi<Nr01ActionPlanItem[]>("/nr01/action-plan", fallbackNr01Actions),
  ]);

  return { summary, risks, actions };
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
