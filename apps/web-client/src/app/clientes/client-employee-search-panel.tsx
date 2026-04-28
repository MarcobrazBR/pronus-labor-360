"use client";

import { useMemo, useState } from "react";
import {
  dateLabel,
  statusClasses,
  structuralStatusLabels,
  type StructuralCompany,
  type StructuralEmployee,
  type StructuralStatus,
} from "../client-data";

const statusOptions: Array<StructuralStatus | "all"> = [
  "all",
  "active",
  "pending_validation",
  "blocked",
  "inactive",
];

type MovementType = "inclusion" | "update" | "termination";
type MovementStatus = "sent" | "draft" | "failed";

type MovementRequest = {
  id: string;
  cpf: string;
  department: string;
  fullName: string;
  jobPosition: string;
  requestedAt: string;
  status: MovementStatus;
  type: MovementType;
};

type MovementForm = {
  birthDate: string;
  cpf: string;
  department: string;
  email: string;
  employeeId: string;
  exclusionDate: string;
  fullName: string;
  inclusionDate: string;
  jobPosition: string;
  notes: string;
  phone: string;
  type: MovementType;
};

const movementTypeLabels: Record<MovementType, string> = {
  inclusion: "Inclusão",
  termination: "Desligamento",
  update: "Alteração cadastral",
};

const movementStatusLabels: Record<MovementStatus, string> = {
  draft: "Rascunho local",
  failed: "Falha no envio",
  sent: "Enviada",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function emptyMovementForm(): MovementForm {
  return {
    birthDate: "",
    cpf: "",
    department: "",
    email: "",
    employeeId: "",
    exclusionDate: "",
    fullName: "",
    inclusionDate: todayIso(),
    jobPosition: "",
    notes: "",
    phone: "",
    type: "inclusion",
  };
}

export function ClientEmployeeSearchPanel({
  company,
  employees,
}: Readonly<{ company: StructuralCompany; employees: StructuralEmployee[] }>) {
  const [currentEmployees, setCurrentEmployees] = useState(employees);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState<StructuralStatus | "all">("all");
  const [submitted, setSubmitted] = useState(false);
  const [movementForm, setMovementForm] = useState<MovementForm>(emptyMovementForm);
  const [movementRequests, setMovementRequests] = useState<MovementRequest[]>([]);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isSavingMovement, setIsSavingMovement] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const departments = useMemo(
    () => Array.from(new Set(currentEmployees.map((employee) => employee.department))).sort(),
    [currentEmployees],
  );
  const filtered = useMemo(() => {
    if (!submitted) {
      return [];
    }

    const normalized = query.trim().toLowerCase();

    return currentEmployees.filter((employee) => {
      const text = [
        employee.fullName,
        employee.cpf,
        employee.department,
        employee.jobPosition,
        structuralStatusLabels[employee.registrationStatus],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesText = normalized.length === 0 || text.includes(normalized);
      const matchesDepartment = department === "all" || employee.department === department;
      const matchesStatus = status === "all" || employee.registrationStatus === status;

      return matchesText && matchesDepartment && matchesStatus;
    });
  }, [currentEmployees, department, query, status, submitted]);

  function openMovementModal(type: MovementType) {
    setMovementForm({ ...emptyMovementForm(), type });
    setMessage(null);
    setIsMovementModalOpen(true);
  }

  function updateMovementForm(field: keyof MovementForm, value: string) {
    if (field === "employeeId") {
      const employee = currentEmployees.find((item) => item.id === value);

      setMovementForm((current) => ({
        ...current,
        cpf: employee?.cpf ?? current.cpf,
        department: employee?.department ?? current.department,
        employeeId: value,
        fullName: employee?.fullName ?? current.fullName,
        jobPosition: employee?.jobPosition ?? current.jobPosition,
      }));
      return;
    }

    setMovementForm((current) => ({ ...current, [field]: value }));
  }

  function validateMovement() {
    if (movementForm.type === "inclusion") {
      const required = [
        movementForm.fullName,
        movementForm.cpf,
        movementForm.department,
        movementForm.jobPosition,
      ];

      return required.every((value) => value.trim().length > 0);
    }

    if (movementForm.employeeId.trim().length === 0) {
      return false;
    }

    if (movementForm.type === "termination") {
      return movementForm.exclusionDate.trim().length > 0;
    }

    return movementForm.department.trim().length > 0 || movementForm.jobPosition.trim().length > 0;
  }

  async function submitMovement() {
    if (!validateMovement()) {
      setMessage("Preencha os campos obrigatórios da movimentação.");
      return;
    }

    setIsSavingMovement(true);
    setMessage(null);

    try {
      if (movementForm.type === "inclusion") {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
        const response = await fetch(`${apiUrl}/structural/employees`, {
          body: JSON.stringify({
            birthDate: movementForm.birthDate,
            companyId: company.id,
            cpf: movementForm.cpf,
            department: movementForm.department,
            email: movementForm.email,
            fullName: movementForm.fullName,
            inclusionDate: movementForm.inclusionDate,
            jobPosition: movementForm.jobPosition,
            phone: movementForm.phone,
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        const payload = (await response.json()) as StructuralEmployee | { message?: string };

        if (!response.ok) {
          setMessage(
            typeof payload === "object" && payload !== null && "message" in payload
              ? String(payload.message)
              : "Não foi possível enviar a inclusão.",
          );
          return;
        }

        setCurrentEmployees((current) => [payload as StructuralEmployee, ...current]);
      }

      setMovementRequests((current) => [
        {
          cpf: movementForm.cpf,
          department: movementForm.department,
          fullName: movementForm.fullName,
          id: `movement-${Date.now()}`,
          jobPosition: movementForm.jobPosition,
          requestedAt: new Date().toISOString(),
          status: movementForm.type === "inclusion" ? "sent" : "draft",
          type: movementForm.type,
        },
        ...current,
      ]);
      setSubmitted(true);
      setIsMovementModalOpen(false);
      setMovementForm(emptyMovementForm());
      setMessage(
        movementForm.type === "inclusion"
          ? "Inclusão enviada para validação operacional."
          : "Movimentação registrada localmente para a próxima fila de aprovação.",
      );
    } catch {
      setMovementRequests((current) => [
        {
          cpf: movementForm.cpf,
          department: movementForm.department,
          fullName: movementForm.fullName,
          id: `movement-${Date.now()}`,
          jobPosition: movementForm.jobPosition,
          requestedAt: new Date().toISOString(),
          status: "failed",
          type: movementForm.type,
        },
        ...current,
      ]);
      setMessage("Não foi possível conectar a API local.");
    } finally {
      setIsSavingMovement(false);
    }
  }

  return (
    <>
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <h3 className="text-base font-semibold">Consulta de clientes</h3>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-md bg-pronus-primary px-3 py-2 text-sm font-semibold text-white"
              type="button"
              onClick={() => openMovementModal("inclusion")}
            >
              + Incluir
            </button>
            <button
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
              type="button"
              onClick={() => openMovementModal("update")}
            >
              Alterar
            </button>
            <button
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
              type="button"
              onClick={() => openMovementModal("termination")}
            >
              Desligar
            </button>
          </div>
        </div>

        {message !== null && (
          <div className="mx-5 mt-4 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-800">
            {message}
          </div>
        )}

        <div className="grid gap-3 px-5 py-4 lg:grid-cols-[1.4fr_0.9fr_0.8fr_auto]">
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-500">Pesquisar</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              placeholder="Nome, CPF, cargo ou status"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-500">Setor</span>
            <select
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
            >
              <option value="all">Todos</option>
              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-500">Status</span>
            <select
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              value={status}
              onChange={(event) => setStatus(event.target.value as StructuralStatus | "all")}
            >
              {statusOptions.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "Todos" : structuralStatusLabels[item]}
                </option>
              ))}
            </select>
          </label>
          <button
            className="h-10 self-end rounded-md bg-pronus-primary px-5 text-sm font-semibold text-white"
            type="button"
            onClick={() => setSubmitted(true)}
          >
            Buscar
          </button>
        </div>

        {!submitted ? (
          <div className="border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-500">
            A lista aparece somente após uma busca.
          </div>
        ) : filtered.length === 0 ? (
          <div className="border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-500">
            Nenhum cliente encontrado para os filtros.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {filtered.map((employee) => (
              <article key={employee.id} className="grid gap-3 px-5 py-4 xl:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold">{employee.fullName}</h4>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                        employee.registrationStatus,
                      )}`}
                    >
                      {structuralStatusLabels[employee.registrationStatus]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {employee.cpf ?? "CPF pendente"} / {employee.department} /{" "}
                    {employee.jobPosition}
                  </p>
                </div>
                <div className="text-sm text-slate-500">
                  Inclusão {dateLabel(employee.inclusionDate)}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-4 rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold">Movimentações recentes</h3>
        </div>
        {movementRequests.length === 0 ? (
          <div className="px-5 py-6 text-sm text-slate-500">
            Nenhuma movimentação registrada nesta sessão.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {movementRequests.map((request) => (
              <article key={request.id} className="grid gap-3 px-5 py-4 xl:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold">{request.fullName}</h4>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                        request.status,
                      )}`}
                    >
                      {movementStatusLabels[request.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {movementTypeLabels[request.type]} / {request.cpf || "CPF pendente"} /{" "}
                    {request.department || "setor pendente"}
                  </p>
                </div>
                <div className="text-sm text-slate-500">{dateLabel(request.requestedAt)}</div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isMovementModalOpen && (
        <MovementModal
          companyName={company.tradeName}
          employees={currentEmployees}
          form={movementForm}
          isSaving={isSavingMovement}
          onClose={() => setIsMovementModalOpen(false)}
          onSubmit={() => void submitMovement()}
          onUpdate={updateMovementForm}
        />
      )}
    </>
  );
}

function MovementModal({
  companyName,
  employees,
  form,
  isSaving,
  onClose,
  onSubmit,
  onUpdate,
}: Readonly<{
  companyName: string;
  employees: StructuralEmployee[];
  form: MovementForm;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onUpdate: (field: keyof MovementForm, value: string) => void;
}>) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 px-4 py-6">
      <div className="w-full max-w-3xl rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-pronus-primary">
              Clientes
            </p>
            <h3 className="mt-1 text-lg font-semibold">Movimentação cadastral</h3>
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
          <fieldset className="md:col-span-2">
            <legend className="text-xs font-semibold uppercase text-slate-500">Tipo</legend>
            <div className="mt-1 grid gap-2 sm:grid-cols-3">
              {Object.entries(movementTypeLabels).map(([value, label]) => {
                const active = form.type === value;

                return (
                  <button
                    key={value}
                    className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                      active
                        ? "border-pronus-primary bg-pronus-primary text-white"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                    type="button"
                    onClick={() => onUpdate("type", value)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="block md:col-span-2">
            <span className="text-xs font-semibold uppercase text-slate-500">Empresa</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
              readOnly
              value={companyName}
            />
          </label>

          {form.type !== "inclusion" && (
            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">Cliente</span>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                value={form.employeeId}
                onChange={(event) => onUpdate("employeeId", event.target.value)}
              >
                <option value="">Selecionar</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.fullName}
                  </option>
                ))}
              </select>
            </label>
          )}

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

          {form.type === "inclusion" && (
            <>
              <Field
                label="Data nascimento"
                type="date"
                value={form.birthDate}
                onChange={(value) => onUpdate("birthDate", value)}
              />
              <Field
                label="Data inclusão"
                type="date"
                value={form.inclusionDate}
                onChange={(value) => onUpdate("inclusionDate", value)}
              />
              <Field
                label="E-mail"
                value={form.email}
                onChange={(value) => onUpdate("email", value)}
              />
              <Field
                label="Telefone"
                value={form.phone}
                onChange={(value) => onUpdate("phone", value)}
              />
            </>
          )}

          {form.type === "termination" && (
            <Field
              label="Data desligamento"
              type="date"
              value={form.exclusionDate}
              onChange={(value) => onUpdate("exclusionDate", value)}
            />
          )}

          <label className="block md:col-span-2">
            <span className="text-xs font-semibold uppercase text-slate-500">Observação</span>
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
            {isSaving ? "Enviando..." : "Registrar movimentação"}
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
