"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  statusClasses,
  structuralAudienceLabels,
  structuralStatusLabels,
  type StructuralAudience,
  type StructuralDepartment,
  type StructuralStatus,
} from "../pronus-data";

type SearchState = {
  audience: StructuralAudience | "all";
  query: string;
  status: StructuralStatus | "all";
};

type DepartmentForm = {
  audience: StructuralAudience;
  code: string;
  name: string;
};

const emptyForm: DepartmentForm = {
  audience: "client",
  code: "",
  name: "",
};

const audiences: StructuralAudience[] = [
  "client",
  "client_hr",
  "client_manager",
  "pronus_administrative",
  "pronus_clinical",
];

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
  initialDepartments,
}: Readonly<{
  initialDepartments: StructuralDepartment[];
}>) {
  const router = useRouter();
  const [departments, setDepartments] = useState(initialDepartments);
  const [query, setQuery] = useState("");
  const [audience, setAudience] = useState<StructuralAudience | "all">("all");
  const [status, setStatus] = useState<StructuralStatus | "all">("all");
  const [submittedSearch, setSubmittedSearch] = useState<SearchState | null>(null);
  const [form, setForm] = useState<DepartmentForm>(emptyForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const results = useMemo(() => {
    if (submittedSearch === null) {
      return [];
    }

    const normalizedQuery = submittedSearch.query.trim().toLowerCase();

    return departments.filter((department) => {
      const text = [
        department.name,
        department.code,
        structuralAudienceLabels[department.audience],
        structuralStatusLabels[department.status],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesQuery = normalizedQuery.length === 0 || text.includes(normalizedQuery);
      const matchesAudience =
        submittedSearch.audience === "all" || department.audience === submittedSearch.audience;
      const matchesStatus =
        submittedSearch.status === "all" || department.status === submittedSearch.status;

      return matchesQuery && matchesAudience && matchesStatus;
    });
  }, [departments, submittedSearch]);

  function updateForm(field: keyof DepartmentForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submitSearch() {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length === 0 && audience === "all" && status === "all") {
      setError("Informe setor, codigo, perfil ou status para pesquisar.");
      setSubmittedSearch(null);
      return;
    }

    setError(null);
    setSuccess(null);
    setSubmittedSearch({ audience, query: normalizedQuery, status });
  }

  function openCreateModal() {
    setForm(emptyForm);
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  }

  async function submitDepartment() {
    if (form.name.trim().length === 0) {
      setError("Informe o nome do setor.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
      const response = await fetch(`${apiUrl}/structural/departments`, {
        body: JSON.stringify(form),
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
        audience: "all",
        query: created.name,
        status: "all",
      });
      setIsModalOpen(false);
      setSuccess("Setor cadastrado com perfil de uso para empresas, clientes e colaboradores.");
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
        <div className="grid gap-3 border-b border-slate-200 px-5 py-4 lg:grid-cols-[1fr_220px_180px_auto]">
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-500">Pesquisar</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              placeholder="Setor ou codigo"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <Select
            label="Perfil"
            value={audience}
            onChange={(value) => setAudience(value as StructuralAudience | "all")}
            options={[
              { label: "Todos", value: "all" },
              ...audiences.map((item) => ({
                label: structuralAudienceLabels[item],
                value: item,
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
              aria-label="Cadastrar setor"
              className="flex h-10 w-10 items-center justify-center rounded-md bg-pronus-primary text-xl font-semibold leading-none text-white shadow-sm"
              title="Cadastrar setor"
              type="button"
              onClick={openCreateModal}
            >
              +
            </button>
          </div>
        </div>

        {error !== null && !isModalOpen && (
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
                  <th className="px-4 py-3 font-semibold">Perfil</th>
                  <th className="px-4 py-3 font-semibold">Codigo</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((department) => (
                  <tr key={department.id}>
                    <td className="px-4 py-3 font-semibold">{department.name}</td>
                    <td className="px-4 py-3">{structuralAudienceLabels[department.audience]}</td>
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
              label="Perfil"
              value={form.audience}
              onChange={(value) => updateForm("audience", value)}
              options={audiences.map((item) => ({
                label: structuralAudienceLabels[item],
                value: item,
              }))}
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
    <label className="block min-w-0">
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
