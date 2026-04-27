"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  statusClasses,
  structuralStatusLabels,
  type StructuralCompany,
  type StructuralDepartment,
  type StructuralStatus,
  type StructuralUnit,
} from "../pronus-data";

type SearchState = {
  companyId: string;
  query: string;
  status: StructuralStatus | "all";
};

type DepartmentForm = {
  code: string;
  companyId: string;
  name: string;
  unitId: string;
};

const emptyForm: DepartmentForm = {
  code: "",
  companyId: "",
  name: "",
  unitId: "",
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

export function DepartmentManagementPanel({
  initialCompanies,
  initialDepartments,
  initialUnits,
}: Readonly<{
  initialCompanies: StructuralCompany[];
  initialDepartments: StructuralDepartment[];
  initialUnits: StructuralUnit[];
}>) {
  const router = useRouter();
  const [departments, setDepartments] = useState(initialDepartments);
  const [query, setQuery] = useState("");
  const [companyId, setCompanyId] = useState("all");
  const [status, setStatus] = useState<StructuralStatus | "all">("all");
  const [submittedSearch, setSubmittedSearch] = useState<SearchState | null>(null);
  const [form, setForm] = useState<DepartmentForm>(emptyForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filteredUnits = useMemo(() => {
    if (form.companyId.length === 0) {
      return [];
    }

    const company = initialCompanies.find((item) => item.id === form.companyId);

    if (company === undefined) {
      return [];
    }

    return initialUnits.filter((unit) => unit.companyTradeName === company.tradeName);
  }, [form.companyId, initialCompanies, initialUnits]);

  const results = useMemo(() => {
    if (submittedSearch === null) {
      return [];
    }

    const normalizedQuery = submittedSearch.query.trim().toLowerCase();
    const selectedCompany =
      submittedSearch.companyId === "all"
        ? undefined
        : initialCompanies.find((company) => company.id === submittedSearch.companyId);

    return departments.filter((department) => {
      const text = [
        department.name,
        department.code,
        department.companyTradeName,
        department.unitName,
        structuralStatusLabels[department.status],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesQuery = normalizedQuery.length === 0 || text.includes(normalizedQuery);
      const matchesCompany =
        selectedCompany === undefined || department.companyTradeName === selectedCompany.tradeName;
      const matchesStatus =
        submittedSearch.status === "all" || department.status === submittedSearch.status;

      return matchesQuery && matchesCompany && matchesStatus;
    });
  }, [departments, initialCompanies, submittedSearch]);

  function updateForm(field: keyof DepartmentForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "companyId" ? { unitId: "" } : {}),
    }));
  }

  function submitSearch() {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length === 0 && companyId === "all" && status === "all") {
      setError("Informe setor, codigo, empresa ou status para pesquisar.");
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

  async function submitDepartment() {
    if (form.companyId.length === 0 || form.name.trim().length === 0) {
      setError("Informe a empresa e o nome do setor.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
      const response = await fetch(`${apiUrl}/structural/departments`, {
        body: JSON.stringify({
          code: form.code,
          companyId: form.companyId,
          name: form.name,
          unitId: form.unitId || undefined,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as StructuralDepartment | { message?: string };

      if (!response.ok) {
        setError(responseMessage(payload, "Nao foi possivel cadastrar o setor."));
        return;
      }

      const created = payload as StructuralDepartment;
      setDepartments((current) => [created, ...current]);
      setSubmittedSearch({
        companyId: "all",
        query: created.name,
        status: "all",
      });
      setIsModalOpen(false);
      setSuccess("Setor cadastrado e pronto para uso em empresas e colaboradores.");
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
              placeholder="Setor, codigo ou unidade"
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
              Novo setor
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
            Nenhum setor encontrado para os filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto p-5">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Setor</th>
                  <th className="px-4 py-3 font-semibold">Empresa</th>
                  <th className="px-4 py-3 font-semibold">Unidade</th>
                  <th className="px-4 py-3 font-semibold">Codigo</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((department) => (
                  <tr key={department.id}>
                    <td className="px-4 py-3 font-semibold">{department.name}</td>
                    <td className="px-4 py-3">{department.companyTradeName}</td>
                    <td className="px-4 py-3">{department.unitName ?? "Sem unidade"}</td>
                    <td className="px-4 py-3">{department.code ?? "Pendente"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                          department.status,
                        )}`}
                      >
                        {structuralStatusLabels[department.status]}
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
        <Modal title="Cadastrar setor" onClose={() => setIsModalOpen(false)}>
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
              label="Unidade"
              value={form.unitId}
              onChange={(value) => updateForm("unitId", value)}
              options={[
                { label: "Sem unidade definida", value: "" },
                ...filteredUnits.map((unit) => ({
                  label: unit.name,
                  value: unit.id,
                })),
              ]}
            />
            <Field
              label="Nome do setor"
              required
              value={form.name}
              onChange={(value) => updateForm("name", value)}
            />
            <Field
              label="Codigo interno"
              value={form.code}
              onChange={(value) => updateForm("code", value)}
            />
            {error !== null && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 md:col-span-2">
                {error}
              </div>
            )}
          </div>
          <ModalFooter
            isSaving={isSaving}
            submitLabel="Salvar setor"
            onClose={() => setIsModalOpen(false)}
            onSubmit={() => void submitDepartment()}
          />
        </Modal>
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div className="px-5 py-10 text-center text-sm text-slate-500">
      Use a busca para localizar setores. Nenhum dado e carregado automaticamente nesta tela.
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
      <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-pronus-primary">
              Setores
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
