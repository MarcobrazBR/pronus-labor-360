"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  companyContractStatusLabels,
  contractStatusClasses,
  legalObligationLabels,
  statusClasses,
  structuralStatusLabels,
  type CompanyContractStatus,
  type RegulatoryCnae,
  type StructuralCompany,
  type StructuralEmployee,
  type StructuralStatus,
} from "../pronus-data";

type CompanyTab = "general" | "coverage" | "employees" | "psychosocial" | "financial";

type CompanyForm = {
  groupName: string;
  tradeName: string;
  legalName: string;
  cnpj: string;
  contractStatus: CompanyContractStatus;
  status: StructuralStatus;
  contractDueDate: string;
  selectedPackage: string;
  eSocialValidFrom: string;
  eSocialValidTo: string;
  taxClassification: string;
  cooperativeIndicator: string;
  constructionCompanyIndicator: string;
  payrollExemptionIndicator: string;
  electronicRegistrationIndicator: string;
  educationalEntityIndicator: string;
  temporaryWorkCompanyIndicator: string;
  temporaryWorkRegistration: string;
  primaryCnae: string;
  contactName: string;
  contactCpf: string;
  contactPhone: string;
  contactMobile: string;
  contactEmail: string;
};

type EmployeeForm = {
  fullName: string;
  cpf: string;
  birthDate: string;
  inclusionDate: string;
  department: string;
  jobPosition: string;
  email: string;
  phone: string;
};

type SubmittedSearch = {
  contractStatus: CompanyContractStatus | "all";
  periodEnd: string;
  periodStart: string;
  query: string;
};

const emptyForm: CompanyForm = {
  groupName: "",
  tradeName: "",
  legalName: "",
  cnpj: "",
  contractStatus: "onboarding",
  status: "active",
  contractDueDate: "",
  selectedPackage: "",
  eSocialValidFrom: "",
  eSocialValidTo: "",
  taxClassification: "",
  cooperativeIndicator: "0",
  constructionCompanyIndicator: "0",
  payrollExemptionIndicator: "0",
  electronicRegistrationIndicator: "1",
  educationalEntityIndicator: "N",
  temporaryWorkCompanyIndicator: "N",
  temporaryWorkRegistration: "",
  primaryCnae: "",
  contactName: "",
  contactCpf: "",
  contactPhone: "",
  contactMobile: "",
  contactEmail: "",
};

const emptyEmployeeForm: EmployeeForm = {
  fullName: "",
  cpf: "",
  birthDate: "",
  inclusionDate: "",
  department: "",
  jobPosition: "",
  email: "",
  phone: "",
};

const contractStatuses: CompanyContractStatus[] = [
  "prospecting",
  "onboarding",
  "active",
  "suspended",
  "closed",
];

const structuralStatuses: StructuralStatus[] = [
  "active",
  "pending_validation",
  "blocked",
  "inactive",
];

const coverageSeed = [
  {
    company: "Industria Horizonte",
    specialty: "Medicina ocupacional",
    entitled: 120,
    used: 68,
    absenteeism: 7.2,
  },
  {
    company: "Industria Horizonte",
    specialty: "Psicologia",
    entitled: 40,
    used: 19,
    absenteeism: 4.8,
  },
  {
    company: "Industria Horizonte",
    specialty: "Fonoaudiologia",
    entitled: 20,
    used: 6,
    absenteeism: 2.1,
  },
  {
    company: "Rede Norte",
    specialty: "Medicina ocupacional",
    entitled: 180,
    used: 111,
    absenteeism: 8.7,
  },
  { company: "Rede Norte", specialty: "Psicologia", entitled: 60, used: 24, absenteeism: 5.3 },
];

const psychosocialCompanySeed = [
  { company: "Industria Horizonte", dueDate: "2026-05-01", responseCount: 134 },
  { company: "Rede Norte", dueDate: "2026-05-10", responseCount: 251 },
];

const psychosocialAnswerSeed = [
  { completedAt: "2026-04-18", employeeId: "employee-001", responded: true },
  { completedAt: undefined, employeeId: "employee-002", responded: false },
  { completedAt: "2026-04-20", employeeId: "employee-003", responded: true },
];

const invoiceSeed = [
  {
    company: "Industria Horizonte",
    number: 1,
    dueDate: "2026-01-10",
    amount: 8500,
    type: "Mensalidade",
    status: "paid",
  },
  {
    company: "Industria Horizonte",
    number: 2,
    dueDate: "2026-02-10",
    amount: 8500,
    type: "Mensalidade",
    status: "paid",
  },
  {
    company: "Industria Horizonte",
    number: 3,
    dueDate: "2026-03-10",
    amount: 8500,
    type: "Mensalidade",
    status: "open",
  },
  {
    company: "Industria Horizonte",
    number: 4,
    dueDate: "2026-04-10",
    amount: 1200,
    type: "Compra avulsa de pacote",
    status: "overdue",
  },
  {
    company: "Rede Norte",
    number: 1,
    dueDate: "2026-01-15",
    amount: 12400,
    type: "Mensalidade",
    status: "paid",
  },
  {
    company: "Rede Norte",
    number: 2,
    dueDate: "2026-02-15",
    amount: 12400,
    type: "Mensalidade",
    status: "open",
  },
  {
    company: "Rede Norte",
    number: 3,
    dueDate: "2026-03-15",
    amount: 12400,
    type: "Mensalidade",
    status: "overdue",
  },
];

const tabs: Array<{ id: CompanyTab; label: string }> = [
  { id: "general", label: "Geral" },
  { id: "coverage", label: "Cobertura" },
  { id: "employees", label: "Clientes" },
  { id: "psychosocial", label: "Psicossocial" },
  { id: "financial", label: "Financeiro" },
];

function companyToForm(company: StructuralCompany): CompanyForm {
  return {
    ...emptyForm,
    groupName: company.groupName ?? "",
    tradeName: company.tradeName,
    legalName: company.legalName ?? "",
    cnpj: company.cnpj,
    contractStatus: company.contractStatus ?? "onboarding",
    status: company.status,
    contractDueDate: company.contractDueDate ?? "",
    selectedPackage: company.selectedPackage ?? "",
    eSocialValidFrom: company.eSocialValidFrom ?? "",
    eSocialValidTo: company.eSocialValidTo ?? "",
    taxClassification: company.taxClassification ?? "",
    cooperativeIndicator: company.cooperativeIndicator ?? "0",
    constructionCompanyIndicator: company.constructionCompanyIndicator ?? "0",
    payrollExemptionIndicator: company.payrollExemptionIndicator ?? "0",
    electronicRegistrationIndicator: company.electronicRegistrationIndicator ?? "1",
    educationalEntityIndicator: company.educationalEntityIndicator ?? "N",
    temporaryWorkCompanyIndicator: company.temporaryWorkCompanyIndicator ?? "N",
    temporaryWorkRegistration: company.temporaryWorkRegistration ?? "",
    primaryCnae: company.primaryCnae ?? "",
    contactName: company.contactName ?? "",
    contactCpf: company.contactCpf ?? "",
    contactPhone: company.contactPhone ?? "",
    contactMobile: company.contactMobile ?? "",
    contactEmail: company.contactEmail ?? "",
  };
}

function responseMessage(payload: unknown, fallback: string) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return fallback;
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function money(value: number) {
  return value.toLocaleString("pt-BR", { currency: "BRL", style: "currency" });
}

function dateLabel(value: string | undefined) {
  if (value === undefined || value.length === 0) {
    return "Pendente";
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

function escapeHtml(value: string | undefined) {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function savePsychosocialPendingPdf(
  company: StructuralCompany,
  dueDate: string,
  employees: StructuralEmployee[],
) {
  const reportWindow = window.open("", "_blank", "width=920,height=720");

  if (reportWindow === null) {
    return;
  }

  const rows = employees
    .map(
      (employee) => `
        <tr>
          <td>${escapeHtml(employee.id)}</td>
          <td>${escapeHtml(employee.fullName)}</td>
          <td>${escapeHtml(employee.department)}</td>
          <td>${escapeHtml(employee.jobPosition)}</td>
        </tr>`,
    )
    .join("");

  reportWindow.document.write(`
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Pendentes psicossociais - ${escapeHtml(company.tradeName)}</title>
        <style>
          body { color: #1f2937; font-family: Arial, sans-serif; margin: 32px; }
          h1 { color: #003b71; font-size: 22px; margin: 0 0 8px; }
          p { font-size: 13px; margin: 0 0 18px; }
          table { border-collapse: collapse; font-size: 12px; width: 100%; }
          th, td { border: 1px solid #d8dee9; padding: 8px; text-align: left; }
          th { background: #eef4f8; color: #475569; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <h1>Clientes pendentes na pesquisa psicossocial</h1>
        <p>Empresa: ${escapeHtml(company.tradeName)} / CNPJ: ${escapeHtml(company.cnpj)} / Prazo: ${escapeHtml(dateLabel(dueDate))}</p>
        <table>
          <thead>
            <tr>
              <th>Codigo do cliente</th>
              <th>Nome completo</th>
              <th>Setor</th>
              <th>Cargo</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `);
  reportWindow.document.close();
  reportWindow.focus();
  reportWindow.print();
}

function invoiceStatusLabel(status: string) {
  if (status === "paid") {
    return "Paga";
  }

  if (status === "overdue") {
    return "Vencida";
  }

  return "A pagar";
}

function invoiceStatusClasses(status: string) {
  if (status === "paid") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (status === "overdue") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
}

export function CompanyManagementPanel({
  initialCompanies,
  initialEmployees,
  regulatoryCnaes = [],
}: Readonly<{
  initialCompanies: StructuralCompany[];
  initialEmployees: StructuralEmployee[];
  regulatoryCnaes?: RegulatoryCnae[];
}>) {
  const router = useRouter();
  const [companies, setCompanies] = useState(initialCompanies);
  const [employees, setEmployees] = useState(initialEmployees);
  const [query, setQuery] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [contractStatus, setContractStatus] = useState<CompanyContractStatus | "all">("all");
  const [submittedSearch, setSubmittedSearch] = useState<SubmittedSearch | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CompanyTab>("general");
  const [editingCompany, setEditingCompany] = useState<StructuralCompany | null>(null);
  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [employeeForm, setEmployeeForm] = useState<EmployeeForm>(emptyEmployeeForm);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filteredCompanies = useMemo(() => {
    if (submittedSearch === null) {
      return [];
    }

    const normalizedQuery = submittedSearch.query.trim().toLowerCase();

    return companies.filter((company) => {
      const companyContractStatus = company.contractStatus ?? "onboarding";
      const searchText = [
        company.tradeName,
        company.legalName,
        company.groupName,
        company.cnpj,
        companyContractStatus,
        companyContractStatusLabels[companyContractStatus],
        structuralStatusLabels[company.status],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesQuery = normalizedQuery.length === 0 || searchText.includes(normalizedQuery);
      const matchesContract =
        submittedSearch.contractStatus === "all" ||
        companyContractStatus === submittedSearch.contractStatus;

      return matchesQuery && matchesContract;
    });
  }, [companies, submittedSearch]);
  const selectedCompany = filteredCompanies.find((company) => company.id === selectedCompanyId);

  function submitSearch() {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length === 0 && contractStatus === "all") {
      setError("Informe nome, CNPJ ou status para buscar uma empresa.");
      setSubmittedSearch(null);
      setSelectedCompanyId(null);
      return;
    }

    setError(null);
    setSuccess(null);
    setSubmittedSearch({ contractStatus, periodEnd, periodStart, query: normalizedQuery });
    setSelectedCompanyId(null);
    setActiveTab("general");
  }

  function openCreateModal() {
    setEditingCompany(null);
    setForm(emptyForm);
    setError(null);
    setSuccess(null);
    setIsCompanyModalOpen(true);
  }

  function openEditModal(company: StructuralCompany) {
    setEditingCompany(company);
    setForm(companyToForm(company));
    setError(null);
    setSuccess(null);
    setIsCompanyModalOpen(true);
  }

  function updateForm(field: keyof CompanyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateEmployeeForm(field: keyof EmployeeForm, value: string) {
    setEmployeeForm((current) => ({ ...current, [field]: value }));
  }

  async function submitCompany() {
    const requiredFields: Array<[keyof CompanyForm, string]> = [
      ["groupName", "Grupo empresarial"],
      ["tradeName", "Nome fantasia"],
      ["legalName", "Razao social"],
      ["cnpj", "CNPJ"],
      ["eSocialValidFrom", "Inicio validade"],
      ["taxClassification", "Classificacao tributaria"],
      ["contactName", "Nome contato"],
      ["contactCpf", "CPF contato"],
      ["contactEmail", "E-mail"],
    ];
    const missingField = requiredFields.find(([field]) => form[field].trim().length === 0);

    if (missingField !== undefined) {
      setError(`Preencha o campo obrigatorio: ${missingField[1]}.`);
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
      const response = await fetch(
        editingCompany === null
          ? `${apiUrl}/structural/companies`
          : `${apiUrl}/structural/companies/${editingCompany.id}`,
        {
          body: JSON.stringify(form),
          headers: { "Content-Type": "application/json" },
          method: editingCompany === null ? "POST" : "PATCH",
        },
      );
      const payload = (await response.json()) as StructuralCompany | { message?: string };

      if (!response.ok) {
        setError(responseMessage(payload, "Nao foi possivel salvar a empresa."));
        return;
      }

      const savedCompany = payload as StructuralCompany;
      setCompanies((current) =>
        editingCompany === null
          ? [savedCompany, ...current]
          : current.map((company) => (company.id === savedCompany.id ? savedCompany : company)),
      );
      setSelectedCompanyId(savedCompany.id);
      setSubmittedSearch({
        contractStatus: "all",
        periodEnd,
        periodStart,
        query: savedCompany.tradeName,
      });
      setSuccess(
        editingCompany === null
          ? "Empresa cadastrada com sucesso."
          : "Cadastro da empresa atualizado.",
      );
      setIsCompanyModalOpen(false);
      router.refresh();
    } catch {
      setError("Nao foi possivel conectar a API local.");
    } finally {
      setIsSaving(false);
    }
  }

  async function submitEmployee() {
    if (selectedCompany === undefined) {
      return;
    }

    const requiredFields: Array<[keyof EmployeeForm, string]> = [
      ["fullName", "Nome completo"],
      ["cpf", "CPF"],
      ["department", "Setor"],
      ["jobPosition", "Cargo"],
    ];
    const missingField = requiredFields.find(([field]) => employeeForm[field].trim().length === 0);

    if (missingField !== undefined) {
      setError(`Preencha o campo obrigatorio: ${missingField[1]}.`);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
      const response = await fetch(`${apiUrl}/structural/employees`, {
        body: JSON.stringify({
          ...employeeForm,
          companyId: selectedCompany.id,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as StructuralEmployee | { message?: string };

      if (!response.ok) {
        setError(responseMessage(payload, "Nao foi possivel cadastrar o cliente avulso."));
        return;
      }

      setEmployees((current) => [payload as StructuralEmployee, ...current]);
      setEmployeeForm(emptyEmployeeForm);
      setIsEmployeeModalOpen(false);
      setSuccess("Cliente avulso cadastrado para a empresa.");
      router.refresh();
    } catch {
      setError("Nao foi possivel conectar a API local.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-base font-semibold">Consulta operacional</h3>
            <p className="mt-1 text-sm text-slate-500">
              Localize a empresa e abra o cadastro somente quando precisar analisar detalhes.
            </p>
          </div>
          <button
            aria-label="Incluir empresa"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-pronus-primary text-xl font-semibold leading-none text-white shadow-sm"
            title="Incluir empresa"
            type="button"
            onClick={openCreateModal}
          >
            +
          </button>
        </div>
        <div className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(18rem,1.4fr)_minmax(13rem,0.8fr)_minmax(10rem,0.7fr)_minmax(10rem,0.7fr)]">
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-500">Pesquisar</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              placeholder="Nome, razao social, CNPJ ou status"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="block min-w-48">
            <span className="text-xs font-semibold uppercase text-slate-500">Status contrato</span>
            <select
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              value={contractStatus}
              onChange={(event) =>
                setContractStatus(event.target.value as CompanyContractStatus | "all")
              }
            >
              <option value="all">Todos</option>
              {contractStatuses.map((status) => (
                <option key={status} value={status}>
                  {companyContractStatusLabels[status]}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Inicio financeiro"
            type="date"
            value={periodStart}
            onChange={setPeriodStart}
          />
          <Field label="Fim financeiro" type="date" value={periodEnd} onChange={setPeriodEnd} />
        </div>
        <div className="flex justify-end border-t border-slate-100 px-5 py-4">
          <button
            className="rounded-md border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700"
            type="button"
            onClick={submitSearch}
          >
            Buscar
          </button>
        </div>

        {error !== null && (
          <div className="mx-5 mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
        {success !== null && (
          <div className="mx-5 mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        {submittedSearch === null ? (
          <EmptySearch />
        ) : filteredCompanies.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-500">
            Nenhuma empresa encontrada para os filtros aplicados.
          </div>
        ) : (
          <div className="p-5">
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Empresa</th>
                    <th className="px-4 py-3 font-semibold">CNPJ</th>
                    <th className="px-4 py-3 font-semibold">Contrato</th>
                    <th className="px-4 py-3 font-semibold">Situacao</th>
                    <th className="px-4 py-3 text-right font-semibold">Cadastro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCompanies.map((company) => {
                    const companyContractStatus = company.contractStatus ?? "onboarding";
                    const isSelected = selectedCompany?.id === company.id;

                    return (
                      <tr key={company.id} className={isSelected ? "bg-slate-50" : undefined}>
                        <td className="px-4 py-3">
                          <strong className="block font-semibold">{company.tradeName}</strong>
                          <span className="mt-1 block text-xs text-slate-500">
                            {company.legalName ?? "Razao social pendente"}
                          </span>
                        </td>
                        <td className="px-4 py-3">{company.cnpj}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${contractStatusClasses(
                              companyContractStatus,
                            )}`}
                          >
                            {companyContractStatusLabels[companyContractStatus]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                              company.status,
                            )}`}
                          >
                            {structuralStatusLabels[company.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            aria-label={`Abrir cadastro de ${company.tradeName}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-base font-semibold text-slate-700 hover:border-pronus-primary hover:text-pronus-primary"
                            title="Abrir cadastro"
                            type="button"
                            onClick={() => {
                              setSelectedCompanyId(company.id);
                              setActiveTab("general");
                            }}
                          >
                            ⌕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {selectedCompany === undefined ? (
              <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-center text-sm text-slate-500">
                Clique na lupa ao lado da empresa para abrir cadastro, coberturas, clientes e
                financeiro.
              </div>
            ) : (
              <div className="mt-5">
                <CompanyDetails
                  activeTab={activeTab}
                  company={selectedCompany}
                  employees={employees.filter(
                    (employee) => employee.companyTradeName === selectedCompany.tradeName,
                  )}
                  periodEnd={submittedSearch.periodEnd}
                  periodStart={submittedSearch.periodStart}
                  setActiveTab={setActiveTab}
                  onEdit={() => openEditModal(selectedCompany)}
                  onOpenEmployee={() => {
                    setEmployeeForm(emptyEmployeeForm);
                    setIsEmployeeModalOpen(true);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </section>

      {isCompanyModalOpen && (
        <CompanyModal
          editingCompany={editingCompany}
          error={error}
          form={form}
          isSaving={isSaving}
          regulatoryCnaes={regulatoryCnaes}
          updateForm={updateForm}
          onClose={() => setIsCompanyModalOpen(false)}
          onSubmit={() => void submitCompany()}
        />
      )}

      {isEmployeeModalOpen && selectedCompany !== undefined && (
        <EmployeeModal
          company={selectedCompany}
          form={employeeForm}
          isSaving={isSaving}
          updateForm={updateEmployeeForm}
          onClose={() => setIsEmployeeModalOpen(false)}
          onSubmit={() => void submitEmployee()}
        />
      )}
    </>
  );
}

function EmptySearch() {
  return (
    <div className="px-5 py-10 text-center text-sm text-slate-500">
      Use a busca para localizar uma empresa. Nenhum dado e carregado automaticamente nesta tela.
    </div>
  );
}

function CompanyDetails({
  activeTab,
  company,
  employees,
  onEdit,
  onOpenEmployee,
  periodEnd,
  periodStart,
  setActiveTab,
}: Readonly<{
  activeTab: CompanyTab;
  company: StructuralCompany;
  employees: StructuralEmployee[];
  onEdit: () => void;
  onOpenEmployee: () => void;
  periodEnd: string;
  periodStart: string;
  setActiveTab: (tab: CompanyTab) => void;
}>) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-base font-semibold">{company.tradeName}</h3>
          <p className="mt-1 text-sm text-slate-600">{company.legalName ?? company.cnpj}</p>
        </div>
        <button
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
          type="button"
          onClick={onEdit}
        >
          Ajustar cadastro
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 px-5 py-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${
              activeTab === tab.id
                ? "bg-pronus-primary text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-5">
        {activeTab === "general" && <GeneralTab company={company} />}
        {activeTab === "coverage" && <CoverageTab company={company} />}
        {activeTab === "employees" && (
          <EmployeesTab employees={employees} onOpenEmployee={onOpenEmployee} />
        )}
        {activeTab === "psychosocial" && (
          <PsychosocialTab company={company} employees={employees} />
        )}
        {activeTab === "financial" && (
          <FinancialTab company={company} periodEnd={periodEnd} periodStart={periodStart} />
        )}
      </div>
    </div>
  );
}

function GeneralTab({ company }: Readonly<{ company: StructuralCompany }>) {
  const contractStatus = company.contractStatus ?? "onboarding";

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Info label="Razao social" value={company.legalName ?? "Pendente"} />
      <Info label="CNPJ" value={company.cnpj} />
      <Info label="Pacote escolhido" value={company.selectedPackage ?? "Pendente"} />
      <Info label="Data de vencimento" value={dateLabel(company.contractDueDate)} />
      <Info label="Status do contrato" value={companyContractStatusLabels[contractStatus]} />
      <Info label="Classificacao tributaria" value={company.taxClassification ?? "Pendente"} />
      <Info label="CNAE preponderante" value={company.primaryCnae ?? "Pendente"} />
      <Info label="Contato eSocial" value={company.contactName ?? "Pendente"} />
    </div>
  );
}

function CoverageTab({ company }: Readonly<{ company: StructuralCompany }>) {
  const coverages = coverageSeed.filter((item) => item.company === company.tradeName);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Cobertura</th>
            <th className="px-4 py-3 font-semibold">Direito</th>
            <th className="px-4 py-3 font-semibold">Usadas</th>
            <th className="px-4 py-3 font-semibold">Absenteismo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {coverages.map((coverage) => (
            <tr key={coverage.specialty}>
              <td className="px-4 py-3 font-semibold">{coverage.specialty}</td>
              <td className="px-4 py-3">{coverage.entitled}</td>
              <td className="px-4 py-3">{coverage.used}</td>
              <td className="px-4 py-3">{coverage.absenteeism}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      {coverages.length === 0 && (
        <div className="py-6 text-sm text-slate-500">Nenhuma cobertura cadastrada.</div>
      )}
    </div>
  );
}

function EmployeesTab({
  employees,
  onOpenEmployee,
}: Readonly<{ employees: StructuralEmployee[]; onOpenEmployee: () => void }>) {
  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          aria-label="Inserir cliente avulso"
          className="rounded-md bg-pronus-primary px-3 py-2 text-sm font-semibold text-white"
          type="button"
          onClick={onOpenEmployee}
        >
          + Cliente avulso
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Nome</th>
              <th className="px-4 py-3 font-semibold">Nascimento</th>
              <th className="px-4 py-3 font-semibold">Inclusao</th>
              <th className="px-4 py-3 font-semibold">Exclusao</th>
              <th className="px-4 py-3 font-semibold">Setor</th>
              <th className="px-4 py-3 font-semibold">Psicossocial</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-4 py-3 font-semibold">{employee.fullName}</td>
                <td className="px-4 py-3">{dateLabel(employee.birthDate)}</td>
                <td className="px-4 py-3">{dateLabel(employee.inclusionDate)}</td>
                <td className="px-4 py-3">{dateLabel(employee.exclusionDate)}</td>
                <td className="px-4 py-3">{employee.department}</td>
                <td className="px-4 py-3">
                  <PsychosocialAnswerBadge employeeId={employee.id} />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                      employee.registrationStatus,
                    )}`}
                  >
                    {structuralStatusLabels[employee.registrationStatus]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PsychosocialAnswerBadge({ employeeId }: Readonly<{ employeeId: string }>) {
  const answer = psychosocialAnswerSeed.find((item) => item.employeeId === employeeId);
  const hasResponded = answer?.responded === true;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
        hasResponded
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-red-50 text-red-700 ring-1 ring-red-200"
      }`}
      title={hasResponded ? "Pesquisa respondida" : "Pesquisa pendente"}
    >
      <span
        aria-hidden="true"
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
          hasResponded ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}
      >
        {hasResponded ? "✓" : "X"}
      </span>
      {hasResponded ? "Respondido" : "Pendente"}
    </span>
  );
}

function PsychosocialTab({
  company,
  employees,
}: Readonly<{ company: StructuralCompany; employees: StructuralEmployee[] }>) {
  const companyConfig = psychosocialCompanySeed.find((item) => item.company === company.tradeName);
  const [dueDate, setDueDate] = useState(companyConfig?.dueDate ?? "");

  useEffect(() => {
    setDueDate(companyConfig?.dueDate ?? "");
  }, [companyConfig?.dueDate, company.tradeName]);

  const responseCount =
    companyConfig?.responseCount ??
    employees.filter((employee) => {
      const answer = psychosocialAnswerSeed.find((item) => item.employeeId === employee.id);

      return answer?.responded === true;
    }).length;
  const pendingCount = Math.max(company.employees - responseCount, 0);
  const responseRate =
    company.employees === 0 ? 0 : Math.round((responseCount / company.employees) * 100);
  const pendingEmployees = employees.filter((employee) => {
    const answer = psychosocialAnswerSeed.find((item) => item.employeeId === employee.id);

    return answer?.responded !== true;
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr]">
        <label className="rounded-md bg-slate-100 px-3 py-2">
          <span className="text-xs font-medium text-slate-500">Prazo da campanha</span>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </label>
        <Info label="Vidas no contrato" value={String(company.employees)} />
        <Info label="Respondidas" value={String(responseCount)} />
        <Info label="Faltam responder" value={`${pendingCount} / ${responseRate}% adesao`} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-950">Clientes pendentes</h4>
          <p className="mt-1 text-sm text-slate-600">
            Lista operacional para acionar o RH quando a adesao estiver abaixo do esperado.
          </p>
        </div>
        <button
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-pronus-primary hover:text-pronus-primary"
          type="button"
          onClick={() => savePsychosocialPendingPdf(company, dueDate, pendingEmployees)}
        >
          Salvar PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Codigo</th>
              <th className="px-4 py-3 font-semibold">Nome</th>
              <th className="px-4 py-3 font-semibold">Setor</th>
              <th className="px-4 py-3 font-semibold">Cargo</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pendingEmployees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-4 py-3 font-semibold">{employee.id}</td>
                <td className="px-4 py-3">{employee.fullName}</td>
                <td className="px-4 py-3">{employee.department}</td>
                <td className="px-4 py-3">{employee.jobPosition}</td>
                <td className="px-4 py-3">
                  <PsychosocialAnswerBadge employeeId={employee.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pendingEmployees.length === 0 && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Todos os clientes listados responderam a pesquisa psicossocial.
        </div>
      )}
    </div>
  );
}

function FinancialTab({
  company,
  periodEnd,
  periodStart,
}: Readonly<{ company: StructuralCompany; periodEnd: string; periodStart: string }>) {
  const invoices = invoiceSeed.filter((invoice) => {
    if (invoice.company !== company.tradeName) {
      return false;
    }

    if (periodStart.length > 0 && invoice.dueDate < periodStart) {
      return false;
    }

    if (periodEnd.length > 0 && invoice.dueDate > periodEnd) {
      return false;
    }

    return true;
  });
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid");
  const openInvoices = invoices.filter((invoice) => invoice.status !== "paid");
  const total = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paid = paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const open = openInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const delinquency = total === 0 ? 0 : Math.round((open / total) * 1000) / 10;

  return (
    <div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Info label="Parcelas" value={String(invoices.length)} />
        <Info label="Pagas" value={String(paidInvoices.length)} />
        <Info label="Em aberto" value={String(openInvoices.length)} />
        <Info label="Valor total" value={money(total)} />
        <Info label="Total pago" value={money(paid)} />
        <Info label="Inadimplencia" value={`${delinquency}%`} />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Parcela</th>
              <th className="px-4 py-3 font-semibold">Valor</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Vencimento</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((invoice) => (
              <tr key={`${invoice.company}-${invoice.number}-${invoice.type}`}>
                <td className="px-4 py-3">{invoice.number}</td>
                <td className="px-4 py-3">{money(invoice.amount)}</td>
                <td className="px-4 py-3">{invoice.type}</td>
                <td className="px-4 py-3">{dateLabel(invoice.dueDate)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${invoiceStatusClasses(
                      invoice.status,
                    )}`}
                  >
                    {invoiceStatusLabel(invoice.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Info({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <article className="min-w-0 rounded-md bg-slate-100 px-3 py-2">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <strong className="mt-1 block break-words text-sm font-semibold text-slate-900">
        {value}
      </strong>
    </article>
  );
}

function CompanyModal({
  editingCompany,
  error,
  form,
  isSaving,
  regulatoryCnaes,
  onClose,
  onSubmit,
  updateForm,
}: Readonly<{
  editingCompany: StructuralCompany | null;
  error: string | null;
  form: CompanyForm;
  isSaving: boolean;
  regulatoryCnaes: RegulatoryCnae[];
  onClose: () => void;
  onSubmit: () => void;
  updateForm: (field: keyof CompanyForm, value: string) => void;
}>) {
  const normalizedCnae = onlyDigits(form.primaryCnae);
  const matchedCnae = regulatoryCnaes.find((cnae) => cnae.code === normalizedCnae);

  return (
    <Modal
      title={editingCompany === null ? "Incluir nova empresa" : "Ajustar empresa"}
      onClose={onClose}
    >
      <div className="max-h-[72vh] overflow-y-auto px-5 py-4">
        <FormSection title="Identificacao e contrato">
          <Field
            label="Grupo empresarial"
            required
            value={form.groupName}
            onChange={(value) => updateForm("groupName", value)}
          />
          <Field
            label="Nome fantasia"
            required
            value={form.tradeName}
            onChange={(value) => updateForm("tradeName", value)}
          />
          <Field
            label="Razao social"
            required
            value={form.legalName}
            onChange={(value) => updateForm("legalName", value)}
          />
          <Field
            label="CNPJ"
            required
            value={form.cnpj}
            onChange={(value) => updateForm("cnpj", value)}
          />
          <Field
            label="Data vencimento"
            type="date"
            value={form.contractDueDate}
            onChange={(value) => updateForm("contractDueDate", value)}
          />
          <Field
            label="Pacote escolhido"
            value={form.selectedPackage}
            onChange={(value) => updateForm("selectedPackage", value)}
          />
          <SelectField
            label="Status do contrato"
            value={form.contractStatus}
            onChange={(value) => updateForm("contractStatus", value)}
            options={contractStatuses.map((status) => ({
              label: companyContractStatusLabels[status],
              value: status,
            }))}
          />
          <SelectField
            label="Situacao cadastral"
            value={form.status}
            onChange={(value) => updateForm("status", value)}
            options={structuralStatuses.map((status) => ({
              label: structuralStatusLabels[status],
              value: status,
            }))}
          />
        </FormSection>
        <FormSection title="eSocial S-1000">
          <Field
            label="Inicio validade"
            placeholder="AAAA-MM"
            required
            value={form.eSocialValidFrom}
            onChange={(value) => updateForm("eSocialValidFrom", value)}
          />
          <Field
            label="Fim validade"
            placeholder="AAAA-MM"
            value={form.eSocialValidTo}
            onChange={(value) => updateForm("eSocialValidTo", value)}
          />
          <Field
            label="Classificacao tributaria"
            required
            value={form.taxClassification}
            onChange={(value) => updateForm("taxClassification", value)}
          />
          <Field
            label="CNAE preponderante"
            placeholder="7 digitos"
            value={form.primaryCnae}
            onChange={(value) => updateForm("primaryCnae", value)}
          />
          {form.primaryCnae.trim().length > 0 && (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 md:col-span-2 xl:col-span-3">
              {matchedCnae === undefined ? (
                <p className="text-sm font-medium text-amber-700">
                  CNAE ainda nao parametrizado no modulo Configuracoes.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm text-slate-900">{matchedCnae.description}</strong>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      Grau {matchedCnae.riskDegree}
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      {matchedCnae.activityClassification}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[...matchedCnae.obligations, ...matchedCnae.conditionalObligations].map(
                      (obligation) => (
                        <span
                          key={obligation}
                          className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                        >
                          {legalObligationLabels[obligation]}
                        </span>
                      ),
                    )}
                  </div>
                </>
              )}
            </div>
          )}
          <SelectField
            label="Cooperativa"
            value={form.cooperativeIndicator}
            onChange={(value) => updateForm("cooperativeIndicator", value)}
            options={[
              { label: "0 - Nao e cooperativa", value: "0" },
              { label: "1 - Cooperativa de trabalho", value: "1" },
              { label: "2 - Outras cooperativas", value: "2" },
            ]}
          />
          <SelectField
            label="Construtora"
            value={form.constructionCompanyIndicator}
            onChange={(value) => updateForm("constructionCompanyIndicator", value)}
            options={[
              { label: "0 - Nao", value: "0" },
              { label: "1 - Sim", value: "1" },
            ]}
          />
          <SelectField
            label="Desoneracao folha"
            value={form.payrollExemptionIndicator}
            onChange={(value) => updateForm("payrollExemptionIndicator", value)}
            options={[
              { label: "0 - Nao aplicavel", value: "0" },
              { label: "1 - Empresa enquadrada", value: "1" },
            ]}
          />
          <SelectField
            label="Registro eletronico"
            value={form.electronicRegistrationIndicator}
            onChange={(value) => updateForm("electronicRegistrationIndicator", value)}
            options={[
              { label: "0 - Nao optante", value: "0" },
              { label: "1 - Optante", value: "1" },
            ]}
          />
          <SelectField
            label="Entidade educativa"
            value={form.educationalEntityIndicator}
            onChange={(value) => updateForm("educationalEntityIndicator", value)}
            options={[
              { label: "N - Nao", value: "N" },
              { label: "S - Sim", value: "S" },
            ]}
          />
          <SelectField
            label="Empresa trabalho temporario"
            value={form.temporaryWorkCompanyIndicator}
            onChange={(value) => updateForm("temporaryWorkCompanyIndicator", value)}
            options={[
              { label: "N - Nao", value: "N" },
              { label: "S - Sim", value: "S" },
            ]}
          />
          <Field
            label="Registro MTE ETT"
            value={form.temporaryWorkRegistration}
            onChange={(value) => updateForm("temporaryWorkRegistration", value)}
          />
        </FormSection>
        <FormSection title="Contato responsavel pelo eSocial">
          <Field
            label="Nome contato"
            required
            value={form.contactName}
            onChange={(value) => updateForm("contactName", value)}
          />
          <Field
            label="CPF contato"
            required
            value={form.contactCpf}
            onChange={(value) => updateForm("contactCpf", value)}
          />
          <Field
            label="Telefone fixo"
            value={form.contactPhone}
            onChange={(value) => updateForm("contactPhone", value)}
          />
          <Field
            label="Celular"
            value={form.contactMobile}
            onChange={(value) => updateForm("contactMobile", value)}
          />
          <Field
            label="E-mail"
            required
            type="email"
            value={form.contactEmail}
            onChange={(value) => updateForm("contactEmail", value)}
          />
        </FormSection>
        {error !== null && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
      </div>
      <ModalFooter
        isSaving={isSaving}
        onClose={onClose}
        onSubmit={onSubmit}
        submitLabel="Salvar empresa"
      />
    </Modal>
  );
}

function EmployeeModal({
  company,
  form,
  isSaving,
  onClose,
  onSubmit,
  updateForm,
}: Readonly<{
  company: StructuralCompany;
  form: EmployeeForm;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: () => void;
  updateForm: (field: keyof EmployeeForm, value: string) => void;
}>) {
  return (
    <Modal title={`Inserir cliente avulso - ${company.tradeName}`} onClose={onClose}>
      <div className="px-5 py-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Nome completo"
            required
            value={form.fullName}
            onChange={(value) => updateForm("fullName", value)}
          />
          <Field
            label="CPF"
            required
            value={form.cpf}
            onChange={(value) => updateForm("cpf", value)}
          />
          <Field
            label="Data nascimento"
            type="date"
            value={form.birthDate}
            onChange={(value) => updateForm("birthDate", value)}
          />
          <Field
            label="Data inclusao"
            type="date"
            value={form.inclusionDate}
            onChange={(value) => updateForm("inclusionDate", value)}
          />
          <Field
            label="Setor"
            required
            value={form.department}
            onChange={(value) => updateForm("department", value)}
          />
          <Field
            label="Cargo"
            required
            value={form.jobPosition}
            onChange={(value) => updateForm("jobPosition", value)}
          />
          <Field
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(value) => updateForm("email", value)}
          />
          <Field
            label="Telefone"
            value={form.phone}
            onChange={(value) => updateForm("phone", value)}
          />
        </div>
      </div>
      <ModalFooter
        isSaving={isSaving}
        onClose={onClose}
        onSubmit={onSubmit}
        submitLabel="Salvar cliente"
      />
    </Modal>
  );
}

function Modal({
  children,
  onClose,
  title,
}: Readonly<{ children: ReactNode; onClose: () => void; title: string }>) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 px-4 py-6">
      <div className="w-full max-w-5xl rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-pronus-primary">
              Empresas
            </p>
            <h3 className="mt-1 text-lg font-semibold">{title}</h3>
          </div>
          <button
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
            type="button"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalFooter({
  isSaving,
  onClose,
  onSubmit,
  submitLabel,
}: Readonly<{
  isSaving: boolean;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
}>) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end">
      <button
        className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
        type="button"
        onClick={onClose}
      >
        Cancelar
      </button>
      <button
        className="rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSaving}
        type="button"
        onClick={onSubmit}
      >
        {isSaving ? "Salvando..." : submitLabel}
      </button>
    </div>
  );
}

function FormSection({ children, title }: Readonly<{ children: ReactNode; title: string }>) {
  return (
    <section className="mt-4 first:mt-0">
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  onChange,
  placeholder,
  required,
  type = "text",
  value,
}: Readonly<{
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
}>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: Readonly<{
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <select
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
