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
  { name: "NR-01 / GRO / PGR", owner: "SST", progress: 28, status: "Modelagem" },
  { name: "Risco psicossocial", owner: "Psicologia", progress: 22, status: "Modelagem" },
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

const psychosocialSignals: Array<{
  sector: string;
  company: string;
  respondents: string;
  riskLevel: RiskLevel;
}> = [
  {
    sector: "Producao",
    company: "Industria Horizonte",
    respondents: "91%",
    riskLevel: "moderate",
  },
  {
    sector: "Atendimento",
    company: "Rede Norte",
    respondents: "77%",
    riskLevel: "low",
  },
  {
    sector: "Manutencao",
    company: "Industria Horizonte",
    respondents: "5 pessoas",
    riskLevel: "high",
  },
];

const structuralStatusLabels: Record<StructuralStatus, string> = {
  active: "Ativo",
  pending_validation: "Validacao",
  blocked: "Bloqueado",
  inactive: "Inativo",
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

export default async function PronusHomePage() {
  const [summary, companies, employees, units, departments, jobPositions] = await Promise.all([
    fetchApi<StructuralSummary>("/structural/summary", fallbackSummary),
    fetchApi<StructuralCompany[]>("/structural/companies", fallbackCompanies),
    fetchApi<StructuralEmployee[]>("/structural/employees", fallbackEmployees),
    fetchApi<StructuralUnit[]>("/structural/units", fallbackUnits),
    fetchApi<StructuralDepartment[]>("/structural/departments", fallbackDepartments),
    fetchApi<StructuralJobPosition[]>("/structural/job-positions", fallbackJobPositions),
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
    { label: "Acoes NR-01", value: "18", detail: "5 vencem em 30 dias" },
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

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                  <article key={employee.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto]">
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
                <h3 className="text-base font-semibold">Sinais psicossociais</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {psychosocialSignals.map((signal) => (
                  <article
                    key={`${signal.company}-${signal.sector}`}
                    className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <h4 className="text-sm font-semibold">{signal.sector}</h4>
                      <p className="mt-1 text-sm text-slate-600">
                        {signal.company} / respostas {signal.respondents}
                      </p>
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
        </div>
      </div>
    </main>
  );
}
