"use client";

import { useMemo, useState } from "react";
import {
  dateLabel,
  statusClasses,
  structuralStatusLabels,
  type EmployeeMovement,
  type StructuralCompany,
  type StructuralDepartment,
  type StructuralEmployee,
  type StructuralJobPosition,
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
type MovementStatus = EmployeeMovement["status"];

type MovementForm = {
  birthDate: string;
  cboCode: string;
  cpf: string;
  department: string;
  departmentId: string;
  email: string;
  employeeId: string;
  exclusionDate: string;
  fullName: string;
  inclusionDate: string;
  jobPosition: string;
  jobPositionId: string;
  notes: string;
  phone: string;
  type: MovementType;
};

const clientAudiences = new Set(["client", "client_hr", "client_manager"]);

const movementTypeLabels: Record<MovementType, string> = {
  inclusion: "Inclusão",
  termination: "Desligamento",
  update: "Alteração cadastral",
};

const movementStatusLabels: Record<MovementStatus, string> = {
  approved: "Aprovada",
  pending: "Pendente PRONUS",
  rejected: "Recusada",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function emptyMovementForm(): MovementForm {
  return {
    birthDate: "",
    cboCode: "",
    cpf: "",
    department: "",
    departmentId: "",
    email: "",
    employeeId: "",
    exclusionDate: "",
    fullName: "",
    inclusionDate: todayIso(),
    jobPosition: "",
    jobPositionId: "",
    notes: "",
    phone: "",
    type: "inclusion",
  };
}

export function ClientEmployeeSearchPanel({
  company,
  departments,
  employees,
  jobPositions,
  movements,
}: Readonly<{
  company: StructuralCompany;
  departments: StructuralDepartment[];
  employees: StructuralEmployee[];
  jobPositions: StructuralJobPosition[];
  movements: EmployeeMovement[];
}>) {
  const [currentEmployees] = useState(employees);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState<StructuralStatus | "all">("all");
  const [submitted, setSubmitted] = useState(false);
  const [movementForm, setMovementForm] = useState<MovementForm>(emptyMovementForm);
  const [movementRequests, setMovementRequests] = useState<EmployeeMovement[]>(movements);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isSavingMovement, setIsSavingMovement] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const departmentFilters = useMemo(
    () => Array.from(new Set(currentEmployees.map((employee) => employee.department))).sort(),
    [currentEmployees],
  );
  const catalogDepartments = useMemo(
    () =>
      departments
        .filter(
          (item) =>
            item.status === "active" &&
            clientAudiences.has(item.audience) &&
            item.companyTradeName === company.tradeName,
        )
        .sort((first, second) => first.name.localeCompare(second.name)),
    [company.tradeName, departments],
  );
  const catalogJobPositions = useMemo(
    () =>
      jobPositions
        .filter(
          (item) =>
            item.status === "active" &&
            clientAudiences.has(item.audience) &&
            item.companyTradeName === company.tradeName,
        )
        .sort((first, second) => first.title.localeCompare(second.title)),
    [company.tradeName, jobPositions],
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
      const employeeDepartment = catalogDepartments.find(
        (departmentOption) => departmentOption.name === employee?.department,
      );
      const employeeJobPosition = catalogJobPositions.find(
        (jobPositionOption) => jobPositionOption.title === employee?.jobPosition,
      );

      setMovementForm((current) => ({
        ...current,
        cboCode: employee?.cboCode ?? employeeJobPosition?.cboCode ?? current.cboCode,
        cpf: employee?.cpf ?? current.cpf,
        department: employee?.department ?? current.department,
        departmentId: employeeDepartment?.id ?? (employee?.department ? "manual" : ""),
        employeeId: value,
        fullName: employee?.fullName ?? current.fullName,
        jobPosition: employee?.jobPosition ?? current.jobPosition,
        jobPositionId: employeeJobPosition?.id ?? (employee?.jobPosition ? "manual" : ""),
      }));
      return;
    }

    if (field === "departmentId") {
      const selectedDepartment = catalogDepartments.find((item) => item.id === value);

      setMovementForm((current) => ({
        ...current,
        cboCode: "",
        department: selectedDepartment?.name ?? "",
        departmentId: value,
        jobPosition: "",
        jobPositionId: "",
      }));
      return;
    }

    if (field === "jobPositionId") {
      if (value === "manual" || value === "") {
        setMovementForm((current) => ({
          ...current,
          cboCode: "",
          jobPosition: "",
          jobPositionId: value,
        }));
        return;
      }

      const selectedJobPosition = catalogJobPositions.find((item) => item.id === value);
      const matchingDepartment = catalogDepartments.find(
        (item) => item.name === selectedJobPosition?.departmentName,
      );

      setMovementForm((current) => ({
        ...current,
        cboCode: selectedJobPosition?.cboCode ?? current.cboCode,
        department: selectedJobPosition?.departmentName ?? current.department,
        departmentId: matchingDepartment?.id ?? current.departmentId,
        jobPosition: selectedJobPosition?.title ?? "",
        jobPositionId: value,
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
        movementForm.cboCode,
      ];

      return required.every((value) => value.trim().length > 0);
    }

    if (movementForm.employeeId.trim().length === 0) {
      return false;
    }

    if (movementForm.type === "termination") {
      return movementForm.exclusionDate.trim().length > 0;
    }

    return (
      movementForm.department.trim().length > 0 ||
      movementForm.jobPosition.trim().length > 0 ||
      movementForm.cboCode.trim().length > 0
    );
  }

  async function submitMovement() {
    if (!validateMovement()) {
      setMessage("Preencha os campos obrigatórios da movimentação.");
      return;
    }

    setIsSavingMovement(true);
    setMessage(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
      const response = await fetch(`${apiUrl}/structural/employee-movements`, {
        body: JSON.stringify({
          birthDate: movementForm.birthDate,
          cboCode: movementForm.cboCode,
          companyId: company.id,
          cpf: movementForm.cpf,
          department: movementForm.department,
          email: movementForm.email,
          employeeId: movementForm.employeeId || undefined,
          exclusionDate: movementForm.exclusionDate,
          fullName: movementForm.fullName,
          inclusionDate: movementForm.inclusionDate,
          jobPosition: movementForm.jobPosition,
          notes: movementForm.notes,
          phone: movementForm.phone,
          requestedBy: "RH cliente",
          source: "client_portal",
          type: movementForm.type,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as EmployeeMovement | { message?: string };

      if (!response.ok) {
        setMessage(
          typeof payload === "object" && payload !== null && "message" in payload
            ? String(payload.message)
            : "Nao foi possivel enviar a movimentacao.",
        );
        return;
      }

      setMovementRequests((current) => [payload as EmployeeMovement, ...current]);
      setSubmitted(true);
      setIsMovementModalOpen(false);
      setMovementForm(emptyMovementForm());
      setMessage("Movimentacao enviada para fila de validacao PRONUS.");
    } catch {
      setMessage("Nao foi possivel conectar a API local.");
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
              {departmentFilters.map((item) => (
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
                    {employee.cboCode ? ` / CBO ${employee.cboCode}` : ""}
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
                    {request.cboCode ? ` / CBO ${request.cboCode}` : ""}
                  </p>
                </div>
                <div className="text-sm text-slate-500">{dateLabel(request.createdAt)}</div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isMovementModalOpen && (
        <MovementModal
          catalogDepartments={catalogDepartments}
          catalogJobPositions={catalogJobPositions}
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
  catalogDepartments,
  catalogJobPositions,
  companyName,
  employees,
  form,
  isSaving,
  onClose,
  onSubmit,
  onUpdate,
}: Readonly<{
  catalogDepartments: StructuralDepartment[];
  catalogJobPositions: StructuralJobPosition[];
  companyName: string;
  employees: StructuralEmployee[];
  form: MovementForm;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onUpdate: (field: keyof MovementForm, value: string) => void;
}>) {
  const availableJobPositions = useMemo(() => {
    if (form.department.trim().length === 0) {
      return catalogJobPositions;
    }

    return catalogJobPositions.filter(
      (jobPosition) =>
        jobPosition.departmentName === undefined || jobPosition.departmentName === form.department,
    );
  }, [catalogJobPositions, form.department]);

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
          <CatalogSelect
            label="Setor cadastrado"
            manualLabel="Informar setor manualmente"
            options={catalogDepartments.map((departmentOption) => ({
              label: `${departmentOption.name}${
                departmentOption.code ? ` / ${departmentOption.code}` : ""
              }`,
              value: departmentOption.id,
            }))}
            value={form.departmentId}
            onChange={(value) => onUpdate("departmentId", value)}
          />
          {form.departmentId === "manual" && (
            <Field
              label="Setor informado"
              value={form.department}
              onChange={(value) => onUpdate("department", value)}
            />
          )}
          <CatalogSelect
            label="Cargo cadastrado"
            manualLabel="Informar cargo manualmente"
            options={availableJobPositions.map((jobPosition) => ({
              label: `${jobPosition.title}${jobPosition.cboCode ? ` / CBO ${jobPosition.cboCode}` : ""}`,
              value: jobPosition.id,
            }))}
            value={form.jobPositionId}
            onChange={(value) => onUpdate("jobPositionId", value)}
          />
          {form.jobPositionId === "manual" && (
            <Field
              label="Cargo informado"
              value={form.jobPosition}
              onChange={(value) => onUpdate("jobPosition", value)}
            />
          )}
          <Field
            label="CBO"
            value={form.cboCode}
            onChange={(value) => onUpdate("cboCode", value)}
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

function CatalogSelect({
  label,
  manualLabel,
  onChange,
  options,
  value,
}: Readonly<{
  label: string;
  manualLabel: string;
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
        <option value="">Selecionar</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        <option value="manual">{manualLabel}</option>
      </select>
    </label>
  );
}
