"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  companyContractStatusLabels,
  contractStatusClasses,
  statusClasses,
  structuralStatusLabels,
  type CompanyContractStatus,
  type StructuralCompany,
  type StructuralStatus,
} from "../pronus-data";

type CompanyForm = {
  groupName: string;
  tradeName: string;
  legalName: string;
  cnpj: string;
  contractStatus: CompanyContractStatus;
  status: StructuralStatus;
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

const emptyForm: CompanyForm = {
  groupName: "",
  tradeName: "",
  legalName: "",
  cnpj: "",
  contractStatus: "onboarding",
  status: "active",
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

function companyToForm(company: StructuralCompany): CompanyForm {
  return {
    ...emptyForm,
    groupName: company.groupName ?? "",
    tradeName: company.tradeName,
    legalName: company.legalName ?? "",
    cnpj: company.cnpj,
    contractStatus: company.contractStatus ?? "onboarding",
    status: company.status,
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

export function CompanyManagementPanel({
  initialCompanies,
}: Readonly<{ initialCompanies: StructuralCompany[] }>) {
  const router = useRouter();
  const [companies, setCompanies] = useState(initialCompanies);
  const [query, setQuery] = useState("");
  const [contractStatus, setContractStatus] = useState<CompanyContractStatus | "all">("all");
  const [editingCompany, setEditingCompany] = useState<StructuralCompany | null>(null);
  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filteredCompanies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

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
      const matchesContract = contractStatus === "all" || companyContractStatus === contractStatus;

      return matchesQuery && matchesContract;
    });
  }, [companies, contractStatus, query]);

  function openCreateModal() {
    setEditingCompany(null);
    setForm(emptyForm);
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  }

  function openEditModal(company: StructuralCompany) {
    setEditingCompany(company);
    setForm(companyToForm(company));
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  }

  function updateForm(field: keyof CompanyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
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
          method: editingCompany === null ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
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
      setSuccess(
        editingCompany === null
          ? "Empresa cadastrada com sucesso."
          : "Cadastro da empresa atualizado.",
      );
      setIsModalOpen(false);
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
        <div className="grid gap-3 border-b border-slate-200 px-5 py-4 lg:grid-cols-[1fr_auto_auto]">
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

          <div className="flex items-end">
            <button
              className="w-full rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white shadow-sm"
              type="button"
              onClick={openCreateModal}
            >
              Incluir nova empresa
            </button>
          </div>
        </div>

        {success !== null && (
          <div className="mx-5 mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Empresa</th>
                <th className="px-5 py-3 font-semibold">Contrato</th>
                <th className="px-5 py-3 font-semibold">eSocial</th>
                <th className="px-5 py-3 font-semibold">Estrutura</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCompanies.map((company) => {
                const currentContractStatus = company.contractStatus ?? "onboarding";

                return (
                  <tr key={company.id}>
                    <td className="px-5 py-4">
                      <strong className="block font-semibold">{company.tradeName}</strong>
                      <span className="block text-slate-500">{company.legalName}</span>
                      <span className="block text-xs text-slate-500">{company.cnpj}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${contractStatusClasses(
                          currentContractStatus,
                        )}`}
                      >
                        {companyContractStatusLabels[currentContractStatus]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <span className="block">
                        Validade {company.eSocialValidFrom ?? "pendente"}
                      </span>
                      <span className="block text-xs text-slate-500">
                        Class. trib. {company.taxClassification ?? "pendente"} / CNAE{" "}
                        {company.primaryCnae ?? "pendente"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {company.units} unidades / {company.departments} setores
                      <span className="block text-xs text-slate-500">
                        {company.employees} colaboradores
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                          company.status,
                        )}`}
                      >
                        {structuralStatusLabels[company.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                        type="button"
                        onClick={() => openEditModal(company)}
                      >
                        Ajustar cadastro
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCompanies.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-slate-500">
            Nenhuma empresa encontrada para os filtros aplicados.
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 px-4 py-6">
          <div className="w-full max-w-5xl rounded-lg border border-slate-200 bg-white shadow-xl">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-pronus-primary">
                  Cadastro de empresa
                </p>
                <h3 className="mt-1 text-lg font-semibold">
                  {editingCompany === null ? "Incluir nova empresa" : "Ajustar empresa"}
                </h3>
              </div>
              <button
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                Fechar
              </button>
            </div>

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

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving}
                type="button"
                onClick={() => void submitCompany()}
              >
                {isSaving ? "Salvando..." : "Salvar empresa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
