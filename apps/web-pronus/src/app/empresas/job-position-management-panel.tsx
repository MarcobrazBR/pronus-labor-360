"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  statusClasses,
  structuralStatusLabels,
  type StructuralCompany,
  type StructuralDepartment,
  type StructuralJobPosition,
  type StructuralStatus,
} from "../pronus-data";

type SearchState = {
  companyId: string;
  query: string;
  status: StructuralStatus | "all";
};

type JobPositionForm = {
  cboCode: string;
  companyId: string;
  departmentId: string;
  description: string;
  eSocialCode: string;
  title: string;
};

const emptyForm: JobPositionForm = {
  cboCode: "",
  companyId: "",
  departmentId: "",
  description: "",
  eSocialCode: "",
  title: "",
};

const statuses: StructuralStatus[] = ["active", "pending_validation", "blocked", "inactive"];

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

export function JobPositionManagementPanel({
  initialCompanies,
  initialDepartments,
  initialJobPositions,
}: Readonly<{
  initialCompanies: StructuralCompany[];
  initialDepartments: StructuralDepartment[];
  initialJobPositions: StructuralJobPosition[];
}>) {
  const router = useRouter();
  const [jobPositions, setJobPositions] = useState(initialJobPositions);
  const [query, setQuery] = useState("");
  const [companyId, setCompanyId] = useState("all");
  const [status, setStatus] = useState<StructuralStatus | "all">("all");
  const [submittedSearch, setSubmittedSearch] = useState<SearchState | null>(null);
  const [form, setForm] = useState<JobPositionForm>(emptyForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filteredDepartments = useMemo(() => {
    if (form.companyId.length === 0) {
      return [];
    }

    const company = initialCompanies.find((item) => item.id === form.companyId);

    if (company === undefined) {
      return [];
    }

    return initialDepartments.filter(
      (department) => department.companyTradeName === company.tradeName,
    );
  }, [form.companyId, initialCompanies, initialDepartments]);

  const results = useMemo(() => {
    if (submittedSearch === null) {
      return [];
    }

    const normalizedQuery = submittedSearch.query.trim().toLowerCase();
    const selectedCompany =
      submittedSearch.companyId === "all"
        ? undefined
        : initialCompanies.find((company) => company.id === submittedSearch.companyId);

    return jobPositions.filter((jobPosition) => {
      const text = [
        jobPosition.title,
        jobPosition.companyTradeName,
        jobPosition.departmentName,
        jobPosition.eSocialCode,
        jobPosition.cboCode,
        jobPosition.description,
        structuralStatusLabels[jobPosition.status],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesQuery = normalizedQuery.length === 0 || text.includes(normalizedQuery);
      const matchesCompany =
        selectedCompany === undefined || jobPosition.companyTradeName === selectedCompany.tradeName;
      const matchesStatus =
        submittedSearch.status === "all" || jobPosition.status === submittedSearch.status;

      return matchesQuery && matchesCompany && matchesStatus;
    });
  }, [initialCompanies, jobPositions, submittedSearch]);

  function updateForm(field: keyof JobPositionForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "companyId" ? { departmentId: "" } : {}),
    }));
  }

  function submitSearch() {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length === 0 && companyId === "all" && status === "all") {
      setError("Informe descricao, empresa, status, codigo eSocial ou CBO para pesquisar.");
      setSubmittedSearch(null);
      return;
    }

    setError(null);
    setSuccess(null);
    setSubmittedSearch({ companyId, query: normalizedQuery, status });
  }

  function openCreateModal() {
    setForm({
      ...emptyForm,
      companyId: initialCompanies[0]?.id ?? "",
    });
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  }

  async function submitJobPosition() {
    if (form.companyId.length === 0 || form.title.trim().length === 0) {
      setError("Informe a empresa e a descricao do cargo.");
      return;
    }

    if (form.eSocialCode.trim().length === 0 && form.cboCode.trim().length === 0) {
      setError("Informe ao menos um codigo de referencia para o eSocial ou CBO.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
      const response = await fetch(`${apiUrl}/structural/job-positions`, {
        body: JSON.stringify({
          cboCode: form.cboCode,
          companyId: form.companyId,
          departmentId: form.departmentId || undefined,
          description: form.description,
          eSocialCode: form.eSocialCode,
          title: form.title,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as StructuralJobPosition | { message?: string };

      if (!response.ok) {
        setError(responseMessage(payload, "Nao foi possivel cadastrar o cargo."));
        return;
      }

      const created = payload as StructuralJobPosition;
      setJobPositions((current) => [created, ...current]);
      setSubmittedSearch({
        companyId: "all",
        query: created.title,
        status: "all",
      });
      setIsModalOpen(false);
      setSuccess("Cargo cadastrado com referencia para o eSocial.");
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
        <div className="grid gap-3 border-b border-slate-200 px-5 py-4 xl:grid-cols-[1fr_auto_auto_auto]">
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-500">Pesquisar</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              placeholder="Descricao, codigo eSocial ou CBO"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <Select
            label="Empresa"
            value={companyId}
            onChange={setCompanyId}
            options={[
              { label: "Todas", value: "all" },
              ...initialCompanies.map((company) => ({
                label: company.tradeName,
                value: company.id,
              })),
            ]}
          />
          <Select
            label="Status"
            value={status}
            onChange={(value) => setStatus(value as StructuralStatus | "all")}
            options={[
              { label: "Todos", value: "all" },
              ...statuses.map((statusItem) => ({
                label: structuralStatusLabels[statusItem],
                value: statusItem,
              })),
            ]}
          />
          <div className="flex items-end gap-2">
            <button
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              type="button"
              onClick={submitSearch}
            >
              Buscar
            </button>
            <button
              className="rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white shadow-sm"
              type="button"
              onClick={openCreateModal}
            >
              Novo cargo
            </button>
          </div>
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
          <EmptyState />
        ) : results.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-500">
            Nenhum cargo encontrado para os filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto p-5">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Cargo</th>
                  <th className="px-4 py-3 font-semibold">Empresa</th>
                  <th className="px-4 py-3 font-semibold">Setor</th>
                  <th className="px-4 py-3 font-semibold">eSocial</th>
                  <th className="px-4 py-3 font-semibold">CBO</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((jobPosition) => (
                  <tr key={jobPosition.id}>
                    <td className="px-4 py-3">
                      <strong className="block font-semibold">{jobPosition.title}</strong>
                      <span className="mt-1 block max-w-sm text-xs text-slate-500">
                        {jobPosition.description ?? "Sem descricao complementar"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{jobPosition.companyTradeName}</td>
                    <td className="px-4 py-3">{jobPosition.departmentName ?? "Sem setor"}</td>
                    <td className="px-4 py-3">{jobPosition.eSocialCode ?? "Pendente"}</td>
                    <td className="px-4 py-3">{jobPosition.cboCode ?? "Pendente"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                          jobPosition.status,
                        )}`}
                      >
                        {structuralStatusLabels[jobPosition.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isModalOpen && (
        <Modal title="Cadastrar cargo" onClose={() => setIsModalOpen(false)}>
          <div className="grid gap-3 px-5 py-4 md:grid-cols-2">
            <Select
              label="Empresa"
              value={form.companyId}
              onChange={(value) => updateForm("companyId", value)}
              options={initialCompanies.map((company) => ({
                label: company.tradeName,
                value: company.id,
              }))}
            />
            <Select
              label="Setor"
              value={form.departmentId}
              onChange={(value) => updateForm("departmentId", value)}
              options={[
                { label: "Sem setor definido", value: "" },
                ...filteredDepartments.map((department) => ({
                  label: department.name,
                  value: department.id,
                })),
              ]}
            />
            <Field
              label="Descricao do cargo"
              required
              value={form.title}
              onChange={(value) => updateForm("title", value)}
            />
            <Field
              label="Codigo eSocial"
              value={form.eSocialCode}
              onChange={(value) => updateForm("eSocialCode", value)}
            />
            <Field
              label="Codigo CBO"
              value={form.cboCode}
              onChange={(value) => updateForm("cboCode", value)}
            />
            <label className="block md:col-span-2">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Descricao operacional
              </span>
              <textarea
                className="mt-1 min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                value={form.description}
                onChange={(event) => updateForm("description", event.target.value)}
              />
            </label>
            {error !== null && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 md:col-span-2">
                {error}
              </div>
            )}
          </div>
          <ModalFooter
            isSaving={isSaving}
            submitLabel="Salvar cargo"
            onClose={() => setIsModalOpen(false)}
            onSubmit={() => void submitJobPosition()}
          />
        </Modal>
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div className="px-5 py-10 text-center text-sm text-slate-500">
      Use a busca para localizar cargos. Nenhum dado e carregado automaticamente nesta tela.
    </div>
  );
}

function Field({
  label,
  onChange,
  required,
  value,
}: Readonly<{
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
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
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Select({
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
    <label className="block min-w-48">
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

function Modal({
  children,
  onClose,
  title,
}: Readonly<{ children: ReactNode; onClose: () => void; title: string }>) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 px-4 py-6">
      <div className="w-full max-w-3xl rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-pronus-primary">
              Cargos
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
