"use client";

import { useMemo, useState } from "react";
import {
  statusClasses,
  structuralStatusLabels,
  type StructuralCompany,
  type StructuralEmployee,
  type StructuralStatus,
} from "../../pronus-data";

const statusOptions: Array<{ label: string; value: StructuralStatus | "all" }> = [
  { label: "Todos", value: "all" },
  { label: structuralStatusLabels.active, value: "active" },
  { label: structuralStatusLabels.pending_validation, value: "pending_validation" },
  { label: structuralStatusLabels.blocked, value: "blocked" },
  { label: structuralStatusLabels.inactive, value: "inactive" },
];

type ClientInclusionForm = {
  birthDate: string;
  companyId: string;
  cpf: string;
  department: string;
  email: string;
  fullName: string;
  inclusionDate: string;
  jobPosition: string;
  notes: string;
  phone: string;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function emptyInclusionForm(companies: StructuralCompany[]): ClientInclusionForm {
  return {
    birthDate: "",
    companyId: companies[0]?.id ?? "",
    cpf: "",
    department: "",
    email: "",
    fullName: "",
    inclusionDate: todayIso(),
    jobPosition: "",
    notes: "",
    phone: "",
  };
}

function dateLabel(value: string | undefined) {
  if (value === undefined || value.length === 0) {
    return "Pendente";
  }

  const date = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Pendente";
  }

  return date.toLocaleDateString("pt-BR");
}

export function CompanyClientsPanel({
  companies,
  employees,
}: Readonly<{ companies: StructuralCompany[]; employees: StructuralEmployee[] }>) {
  const [currentEmployees, setCurrentEmployees] = useState(employees);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StructuralStatus | "all">("all");
  const [hasSearched, setHasSearched] = useState(false);
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isInclusionOpen, setIsInclusionOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [inclusionForm, setInclusionForm] = useState<ClientInclusionForm>(() =>
    emptyInclusionForm(companies),
  );

  const filteredEmployees = useMemo(() => {
    if (!hasSearched) {
      return [];
    }

    const normalizedQuery = submittedSearch.trim().toLowerCase();

    return currentEmployees.filter((client) => {
      const text = [
        client.fullName,
        client.cpf,
        client.companyTradeName,
        client.department,
        client.jobPosition,
        structuralStatusLabels[client.registrationStatus],
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = normalizedQuery.length === 0 || text.includes(normalizedQuery);
      const matchesStatus = status === "all" || client.registrationStatus === status;

      return matchesQuery && matchesStatus;
    });
  }, [currentEmployees, hasSearched, status, submittedSearch]);

  function searchClients() {
    if (query.trim().length === 0 && status === "all") {
      setError("Informe nome, CPF, empresa, setor, cargo ou status para buscar clientes.");
      setHasSearched(false);
      return;
    }

    setError(null);
    setSubmittedSearch(query);
    setHasSearched(true);
  }

  function clearSearch() {
    setQuery("");
    setStatus("all");
    setSubmittedSearch("");
    setHasSearched(false);
    setError(null);
  }

  function updateInclusionForm(field: keyof ClientInclusionForm, value: string) {
    setInclusionForm((current) => ({ ...current, [field]: value }));
  }

  function openInclusionModal() {
    setInclusionForm(emptyInclusionForm(companies));
    setError(null);
    setMessage(null);
    setIsInclusionOpen(true);
  }

  function validateInclusion() {
    return [
      inclusionForm.companyId,
      inclusionForm.fullName,
      inclusionForm.cpf,
      inclusionForm.department,
      inclusionForm.jobPosition,
    ].every((value) => value.trim().length > 0);
  }

  async function submitInclusion() {
    if (!validateInclusion()) {
      setMessage("Preencha empresa, nome, CPF, setor e cargo para incluir o cliente.");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
      const response = await fetch(`${apiUrl}/structural/employees`, {
        body: JSON.stringify({
          birthDate: inclusionForm.birthDate,
          companyId: inclusionForm.companyId,
          cpf: inclusionForm.cpf,
          department: inclusionForm.department,
          email: inclusionForm.email,
          fullName: inclusionForm.fullName,
          inclusionDate: inclusionForm.inclusionDate,
          jobPosition: inclusionForm.jobPosition,
          phone: inclusionForm.phone,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as StructuralEmployee | { message?: string };

      if (!response.ok) {
        setMessage(
          typeof payload === "object" && payload !== null && "message" in payload
            ? String(payload.message)
            : "Nao foi possivel enviar a inclusao.",
        );
        return;
      }

      setCurrentEmployees((current) => [payload as StructuralEmployee, ...current]);
      setHasSearched(true);
      setSubmittedSearch("");
      setStatus("pending_validation");
      setIsInclusionOpen(false);
      setInclusionForm(emptyInclusionForm(companies));
      setMessage("Inclusao enviada para validacao operacional.");
    } catch {
      setMessage("Nao foi possivel conectar a API local.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <section className="mt-4 rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-base font-semibold">Consulta de clientes</h3>
              <p className="mt-1 text-sm text-slate-500">
                Funcionarios das empresas contratantes ficam nesta area para inclusao, conferencia e
                ajuste cadastral.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                {currentEmployees.length} clientes vinculados
              </span>
              <button
                className="rounded-md bg-pronus-primary px-3 py-2 text-sm font-semibold text-white"
                type="button"
                onClick={openInclusionModal}
              >
                + Incluir cliente
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px_auto]">
            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">Pesquisar</span>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
                placeholder="Nome, CPF, empresa, setor, cargo ou status"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">Status</span>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
                value={status}
                onChange={(event) => setStatus(event.target.value as StructuralStatus | "all")}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end gap-2">
              <button
                className="rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white"
                type="button"
                onClick={searchClients}
              >
                Buscar
              </button>
              <button
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                type="button"
                onClick={clearSearch}
              >
                Limpar
              </button>
            </div>
          </div>

          {(error !== null || message !== null) && (
            <div
              className={`mt-3 rounded-md border px-3 py-2 text-sm font-medium ${
                error !== null || message !== "Inclusao enviada para validacao operacional."
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-sky-200 bg-sky-50 text-sky-800"
              }`}
            >
              {error ?? message}
            </div>
          )}
        </div>

        {!hasSearched ? (
          <div className="px-5 py-6 text-sm text-slate-500">
            Use a pesquisa para listar clientes. A tela permanece limpa ate existir uma consulta.
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="px-5 py-6 text-sm text-slate-500">
            Nenhum cliente encontrado para os criterios informados.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {filteredEmployees.map((client) => (
              <article key={client.id} className="grid gap-3 px-5 py-4 xl:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold">{client.fullName}</h4>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                        client.registrationStatus,
                      )}`}
                    >
                      {structuralStatusLabels[client.registrationStatus]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {client.cpf ?? "CPF pendente"} / {client.companyTradeName} / {client.department}{" "}
                    / {client.jobPosition}
                  </p>
                </div>
                <div className="text-sm text-slate-500">
                  Inclusao {dateLabel(client.inclusionDate)}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isInclusionOpen && (
        <ClientInclusionModal
          companies={companies}
          form={inclusionForm}
          isSaving={isSaving}
          onClose={() => setIsInclusionOpen(false)}
          onSubmit={() => void submitInclusion()}
          onUpdate={updateInclusionForm}
        />
      )}
    </>
  );
}

function ClientInclusionModal({
  companies,
  form,
  isSaving,
  onClose,
  onSubmit,
  onUpdate,
}: Readonly<{
  companies: StructuralCompany[];
  form: ClientInclusionForm;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onUpdate: (field: keyof ClientInclusionForm, value: string) => void;
}>) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 px-4 py-6">
      <div className="w-full max-w-3xl rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-pronus-primary">
              Clientes
            </p>
            <h3 className="mt-1 text-lg font-semibold">Inclusao de cliente</h3>
          </div>
          <button
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
            type="button"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
        <div className="grid gap-3 p-5 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-xs font-semibold uppercase text-slate-500">Empresa</span>
            <select
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              value={form.companyId}
              onChange={(event) => onUpdate("companyId", event.target.value)}
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.tradeName} - {company.cnpj}
                </option>
              ))}
            </select>
          </label>

          <Field
            label="Nome completo"
            value={form.fullName}
            onChange={(value) => onUpdate("fullName", value)}
          />
          <Field label="CPF" value={form.cpf} onChange={(value) => onUpdate("cpf", value)} />
          <Field
            label="Setor"
            value={form.department}
            onChange={(value) => onUpdate("department", value)}
          />
          <Field
            label="Cargo"
            value={form.jobPosition}
            onChange={(value) => onUpdate("jobPosition", value)}
          />
          <Field
            label="Data nascimento"
            type="date"
            value={form.birthDate}
            onChange={(value) => onUpdate("birthDate", value)}
          />
          <Field
            label="Data inclusao"
            type="date"
            value={form.inclusionDate}
            onChange={(value) => onUpdate("inclusionDate", value)}
          />
          <Field label="E-mail" value={form.email} onChange={(value) => onUpdate("email", value)} />
          <Field
            label="Telefone"
            value={form.phone}
            onChange={(value) => onUpdate("phone", value)}
          />

          <label className="block md:col-span-2">
            <span className="text-xs font-semibold uppercase text-slate-500">Observacao</span>
            <textarea
              className="mt-1 min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              value={form.notes}
              onChange={(event) => onUpdate("notes", event.target.value)}
            />
          </label>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            type="button"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={isSaving}
            type="button"
            onClick={onSubmit}
          >
            {isSaving ? "Enviando..." : "Enviar para validacao"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  onChange,
  type = "text",
  value,
}: Readonly<{
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
