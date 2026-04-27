import type { RiskLevel } from "@pronus/types";
import { riskLevelColorClasses, riskLevelLabels } from "@pronus/ui";
import { EmployeeImportPanel } from "./employee-import-panel";

export const dynamic = "force-dynamic";

type StructuralStatus = "active" | "pending_validation" | "blocked" | "inactive";

interface StructuralSummary {
  companies: number;
  units: number;
  departments: number;
  jobPositions: number;
  employees: number;
  pendingValidations: number;
}

interface StructuralCompany {
  id: string;
  tradeName: string;
  cnpj: string;
  units: number;
  departments: number;
  employees: number;
  status: StructuralStatus;
}

interface StructuralEmployee {
  id: string;
  companyTradeName: string;
  fullName: string;
  department: string;
  jobPosition: string;
  registrationStatus: StructuralStatus;
}

interface StructuralUnit {
  id: string;
  companyTradeName: string;
  name: string;
  code?: string;
  status: StructuralStatus;
}

interface StructuralDepartment {
  id: string;
  companyTradeName: string;
  unitName?: string;
  name: string;
  code?: string;
  status: StructuralStatus;
}

interface StructuralJobPosition {
  id: string;
  companyTradeName: string;
  departmentName?: string;
  title: string;
  cboCode?: string;
  status: StructuralStatus;
}

interface Nr01Summary {
  risks: number;
  criticalRisks: number;
  highRisks: number;
  openActions: number;
  overdueActions: number;
  evidences: number;
}

interface Nr01Risk {
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

interface Nr01ActionPlanItem {
  id: string;
  companyTradeName: string;
  title: string;
  responsible: string;
  dueDate: string;
  status: "open" | "in_progress" | "done" | "overdue";
  evidenceCount: number;
}

type PsychosocialCampaignStatus =
  | "draft"
  | "active"
  | "threshold_reached"
  | "expired"
  | "extended"
  | "closed"
  | "analysis_in_progress"
  | "completed";

interface PsychosocialSummary {
  generatedAt: string;
  campaigns: number;
  activeCampaigns: number;
  thresholdReached: number;
  averageResponseRate: number;
  highOrCriticalSectors: number;
  pendingInterviews: number;
}

interface PsychosocialCampaign {
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

interface PsychosocialSectorSignal {
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
    tradeName: "Industria Horizonte",
    cnpj: "12.345.678/0001-90",
    units: 2,
    departments: 6,
    employees: 148,
    status: "active",
  },
  {
    id: "company-pronus-retail",
    tradeName: "Rede Norte",
    cnpj: "98.765.432/0001-10",
    units: 4,
    departments: 11,
    employees: 326,
    status: "pending_validation",
  },
];

const modules = [
  { name: "Cadastro estrutural", owner: "Operacao", progress: 72, status: "Em desenvolvimento" },
  { name: "NR-01 / GRO / PGR", owner: "SST", progress: 40, status: "Base inicial" },
  { name: "Risco psicossocial", owner: "Psicologia", progress: 34, status: "Base inicial" },
  { name: "Documentos iniciais", owner: "Operacao", progress: 12, status: "Fila" },
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

const structuralStatusLabels: Record<StructuralStatus, string> = {
  active: "Ativo",
  pending_validation: "Validacao",
  blocked: "Bloqueado",
  inactive: "Inativo",
};

const nr01ActionStatusLabels: Record<Nr01ActionPlanItem["status"], string> = {
  open: "Aberta",
  in_progress: "Em execucao",
  done: "Concluida",
  overdue: "Vencida",
};

const psychosocialCampaignStatusLabels: Record<PsychosocialCampaignStatus, string> = {
  draft: "Rascunho",
  active: "Ativa",
  threshold_reached: "Amostra atingida",
  expired: "Expirada",
  extended: "Prorrogada",
  closed: "Encerrada",
  analysis_in_progress: "Em analise",
  completed: "Concluida",
};

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

function statusClasses(status: StructuralStatus) {
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

function actionStatusClasses(status: Nr01ActionPlanItem["status"]) {
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

function campaignStatusClasses(status: PsychosocialCampaignStatus) {
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

export default async function PronusHomePage() {
  const [
    summary,
    companies,
    employees,
    units,
    departments,
    jobPositions,
    nr01Summary,
    nr01Risks,
    nr01Actions,
    psychosocialSummary,
    psychosocialCampaigns,
    psychosocialSignals,
  ] = await Promise.all([
    fetchApi<StructuralSummary>("/structural/summary", fallbackSummary),
    fetchApi<StructuralCompany[]>("/structural/companies", fallbackCompanies),
    fetchApi<StructuralEmployee[]>("/structural/employees", fallbackEmployees),
    fetchApi<StructuralUnit[]>("/structural/units", fallbackUnits),
    fetchApi<StructuralDepartment[]>("/structural/departments", fallbackDepartments),
    fetchApi<StructuralJobPosition[]>("/structural/job-positions", fallbackJobPositions),
    fetchApi<Nr01Summary>("/nr01/summary", fallbackNr01Summary),
    fetchApi<Nr01Risk[]>("/nr01/risks", fallbackNr01Risks),
    fetchApi<Nr01ActionPlanItem[]>("/nr01/action-plan", fallbackNr01Actions),
    fetchApi<PsychosocialSummary>("/psychosocial/summary", fallbackPsychosocialSummary),
    fetchApi<PsychosocialCampaign[]>("/psychosocial/campaigns", fallbackPsychosocialCampaigns),
    fetchApi<PsychosocialSectorSignal[]>(
      "/psychosocial/sector-signals",
      fallbackPsychosocialSignals,
    ),
  ]);

  const summaryCards = [
    {
      label: "Empresas ativas",
      value: String(summary.companies),
      detail: `${summary.units} unidades mapeadas`,
    },
    {
      label: "Colaboradores",
      value: String(summary.employees),
      detail: `${summary.pendingValidations} pendencia cadastral`,
    },
    {
      label: "Setores e cargos",
      value: `${summary.departments}/${summary.jobPositions}`,
      detail: "base para PGR",
    },
    {
      label: "Acoes NR-01",
      value: String(nr01Summary.openActions + nr01Summary.overdueActions),
      detail: `${nr01Summary.overdueActions} vencida`,
    },
    {
      label: "Campanhas psicossociais",
      value: String(psychosocialSummary.activeCampaigns),
      detail: `${psychosocialSummary.thresholdReached} com amostra minima`,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-7xl gap-8 px-5 py-5 lg:px-8">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 pr-6 xl:block">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-pronus-primary">
              Pronus Labor 360
            </p>
            <h1 className="mt-1 text-xl font-semibold">Portal PRONUS</h1>
          </div>

          <nav className="space-y-1 text-sm font-medium text-slate-600">
            {["Painel", "Empresas", "Colaboradores", "NR-01/PGR", "Psicossocial", "Documentos"].map(
              (item) => (
                <a
                  key={item}
                  className={`block rounded-md px-3 py-2 ${
                    item === "Painel"
                      ? "bg-pronus-primary text-white"
                      : "hover:bg-white hover:text-pronus-text"
                  }`}
                  href="#"
                >
                  {item}
                </a>
              ),
            )}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
                Operacao PRONUS
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-normal">Painel do MVP</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white shadow-sm">
                Nova empresa
              </button>
              <button className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                Importar planilha
              </button>
            </div>
          </header>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {summaryCards.map((card) => (
              <article key={card.label} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <strong className="mt-2 block text-3xl font-semibold tracking-normal">
                  {card.value}
                </strong>
                <span className="mt-2 block text-sm text-slate-600">{card.detail}</span>
              </article>
            ))}
          </section>

          <section className="mt-6 grid gap-4 xl:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-base font-semibold">Unidades</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {units.slice(0, 4).map((unit) => (
                  <article key={unit.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold">{unit.name}</h4>
                        <p className="mt-1 text-sm text-slate-600">{unit.companyTradeName}</p>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">{unit.code}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-base font-semibold">Setores</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {departments.slice(0, 4).map((department) => (
                  <article key={department.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold">{department.name}</h4>
                        <p className="mt-1 text-sm text-slate-600">
                          {department.companyTradeName} / {department.unitName ?? "Sem unidade"}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {department.code}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-base font-semibold">Cargos</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {jobPositions.slice(0, 4).map((jobPosition) => (
                  <article key={jobPosition.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold">{jobPosition.title}</h4>
                        <p className="mt-1 text-sm text-slate-600">
                          {jobPosition.companyTradeName} /{" "}
                          {jobPosition.departmentName ?? "Sem setor"}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {jobPosition.cboCode}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-base font-semibold">Empresas e CNPJs</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Empresa</th>
                      <th className="px-5 py-3 font-semibold">Estrutura</th>
                      <th className="px-5 py-3 font-semibold">Colaboradores</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {companies.map((company) => (
                      <tr key={company.id}>
                        <td className="px-5 py-4">
                          <strong className="block font-semibold">{company.tradeName}</strong>
                          <span className="text-slate-500">{company.cnpj}</span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {company.units} unidades / {company.departments} setores
                        </td>
                        <td className="px-5 py-4 font-semibold">{company.employees}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                              company.status,
                            )}`}
                          >
                            {structuralStatusLabels[company.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-base font-semibold">Avanco por modulo</h3>
              </div>
              <div className="space-y-4 p-5">
                {modules.map((module) => (
                  <article key={module.name}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold">{module.name}</h4>
                        <p className="text-xs text-slate-500">{module.owner}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {module.status}
                      </span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-pronus-primary"
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-base font-semibold">NR-01 / Inventario de riscos</h3>
              </div>
              <div className="grid gap-3 border-b border-slate-100 p-5 sm:grid-cols-3">
                <div className="rounded-md bg-slate-100 px-3 py-2">
                  <p className="text-xs font-medium text-slate-500">Riscos</p>
                  <strong className="mt-1 block text-xl">{nr01Summary.risks}</strong>
                </div>
                <div className="rounded-md bg-slate-100 px-3 py-2">
                  <p className="text-xs font-medium text-slate-500">Altos/Criticos</p>
                  <strong className="mt-1 block text-xl">
                    {nr01Summary.highRisks + nr01Summary.criticalRisks}
                  </strong>
                </div>
                <div className="rounded-md bg-slate-100 px-3 py-2">
                  <p className="text-xs font-medium text-slate-500">Evidencias</p>
                  <strong className="mt-1 block text-xl">{nr01Summary.evidences}</strong>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {nr01Risks.slice(0, 3).map((risk) => (
                  <article key={risk.id} className="px-5 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="text-sm font-semibold">{risk.danger}</h4>
                        <p className="mt-1 text-sm text-slate-600">
                          {risk.companyTradeName} / {risk.departmentName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{risk.risk}</p>
                      </div>
                      <span
                        className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${riskLevelColorClasses[risk.level]}`}
                      >
                        {riskLevelLabels[risk.level]}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-base font-semibold">Plano de acao PGR</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {nr01Actions.slice(0, 4).map((action) => (
                  <article key={action.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_auto]">
                    <div>
                      <h4 className="text-sm font-semibold">{action.title}</h4>
                      <p className="mt-1 text-sm text-slate-600">
                        {action.companyTradeName} / {action.responsible}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Prazo {new Date(`${action.dueDate}T00:00:00`).toLocaleDateString("pt-BR")} /
                        evidencias {action.evidenceCount}
                      </p>
                    </div>
                    <span
                      className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${actionStatusClasses(
                        action.status,
                      )}`}
                    >
                      {nr01ActionStatusLabels[action.status]}
                    </span>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-base font-semibold">Campanhas psicossociais</h3>
              </div>
              <div className="grid gap-3 border-b border-slate-100 p-5 sm:grid-cols-3">
                <div className="rounded-md bg-slate-100 px-3 py-2">
                  <p className="text-xs font-medium text-slate-500">Campanhas</p>
                  <strong className="mt-1 block text-xl">{psychosocialSummary.campaigns}</strong>
                </div>
                <div className="rounded-md bg-slate-100 px-3 py-2">
                  <p className="text-xs font-medium text-slate-500">Adesao media</p>
                  <strong className="mt-1 block text-xl">
                    {psychosocialSummary.averageResponseRate}%
                  </strong>
                </div>
                <div className="rounded-md bg-slate-100 px-3 py-2">
                  <p className="text-xs font-medium text-slate-500">Entrevistas</p>
                  <strong className="mt-1 block text-xl">
                    {psychosocialSummary.pendingInterviews}
                  </strong>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {psychosocialCampaigns.slice(0, 3).map((campaign) => (
                  <article
                    key={campaign.id}
                    className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <h4 className="text-sm font-semibold">{campaign.name}</h4>
                      <p className="mt-1 text-sm text-slate-600">
                        {campaign.companyTradeName} / {campaign.responseCount} de{" "}
                        {campaign.targetParticipants} respostas
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Janela{" "}
                        {new Date(`${campaign.startDate}T00:00:00`).toLocaleDateString("pt-BR")} a{" "}
                        {new Date(`${campaign.endDate}T00:00:00`).toLocaleDateString("pt-BR")} /
                        adesao {campaign.responseRate}%
                      </p>
                    </div>
                    <span
                      className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${campaignStatusClasses(
                        campaign.status,
                      )}`}
                    >
                      {psychosocialCampaignStatusLabels[campaign.status]}
                    </span>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-base font-semibold">Sinais psicossociais por setor</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {psychosocialSignals.slice(0, 4).map((signal) => (
                  <article key={signal.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_auto]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold">{signal.sectorName}</h4>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          {signal.privacyStatus === "aggregated" ? "Agregado" : "Visivel"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {signal.companyTradeName} / {signal.responses} de {signal.participants}{" "}
                        respostas ({signal.responseRate}%)
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{signal.recommendation}</p>
                    </div>
                    <span
                      className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${riskLevelColorClasses[signal.riskLevel]}`}
                    >
                      {riskLevelLabels[signal.riskLevel]}
                    </span>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <EmployeeImportPanel
            companies={companies.map((company) => ({
              id: company.id,
              tradeName: company.tradeName,
              cnpj: company.cnpj,
            }))}
          />

          <section className="mt-4 grid gap-4 xl:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-base font-semibold">Colaboradores recentes</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {employees.map((employee) => (
                  <article
                    key={employee.id}
                    className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <h4 className="text-sm font-semibold">{employee.fullName}</h4>
                      <p className="mt-1 text-sm text-slate-600">
                        {employee.companyTradeName} / {employee.department} / {employee.jobPosition}
                      </p>
                    </div>
                    <span
                      className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                        employee.registrationStatus,
                      )}`}
                    >
                      {structuralStatusLabels[employee.registrationStatus]}
                    </span>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-base font-semibold">Governanca psicossocial</h3>
              </div>
              <div className="grid gap-3 p-5 sm:grid-cols-3 xl:grid-cols-1">
                <article className="rounded-md bg-slate-100 px-3 py-2">
                  <p className="text-xs font-medium text-slate-500">Setores altos/criticos</p>
                  <strong className="mt-1 block text-xl">
                    {psychosocialSummary.highOrCriticalSectors}
                  </strong>
                  <span className="mt-1 block text-xs text-slate-600">
                    prioridade para escuta tecnica
                  </span>
                </article>
                <article className="rounded-md bg-slate-100 px-3 py-2">
                  <p className="text-xs font-medium text-slate-500">Amostra minima</p>
                  <strong className="mt-1 block text-xl">
                    {psychosocialSummary.thresholdReached}
                  </strong>
                  <span className="mt-1 block text-xs text-slate-600">
                    campanhas acima de 89% de adesao
                  </span>
                </article>
                <article className="rounded-md bg-slate-100 px-3 py-2">
                  <p className="text-xs font-medium text-slate-500">Privacidade</p>
                  <strong className="mt-1 block text-xl">
                    {
                      psychosocialSignals.filter((signal) => signal.privacyStatus === "aggregated")
                        .length
                    }
                  </strong>
                  <span className="mt-1 block text-xs text-slate-600">
                    recortes protegidos por agregacao
                  </span>
                </article>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
