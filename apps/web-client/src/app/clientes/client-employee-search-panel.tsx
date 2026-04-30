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
type SearchRow =
  | { kind: "employee"; employee: StructuralEmployee }
  | { kind: "movement"; movement: EmployeeMovement };

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
  pending: "Registrada",
  rejected: "Recusada",
};

function employeeStatusDate(employee: StructuralEmployee) {
  if (employee.registrationStatus === "inactive") {
    return employee.exclusionDate ?? employee.updatedAt ?? "";
  }

  return employee.inclusionDate ?? employee.updatedAt ?? "";
}

function rowDate(row: SearchRow) {
  return row.kind === "employee" ? employeeStatusDate(row.employee) : row.movement.createdAt;
}

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
  const [currentEmployees, setCurrentEmployees] = useState(employees);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState<StructuralStatus | "all">("all");
  const [submitted, setSubmitted] = useState(false);
  const [movementForm, setMovementForm] = useState<MovementForm>(emptyMovementForm);
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
  const filtered = useMemo<SearchRow[]>(() => {
    if (!submitted) {
      return [];
    }

    const normalized = query.trim().toLowerCase();

    const employeeRows = currentEmployees
      .filter((employee) => {
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
      })
      .map((employee) => ({ employee, kind: "employee" }) as const);

    const movementRows = movements
      .filter((movement) => {
        const text = [
          movement.fullName,
          movement.cpf,
          movement.department,
          movement.jobPosition,
          movementTypeLabels[movement.type],
          movementStatusLabels[movement.status],
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const matchesText = normalized.length === 0 || text.includes(normalized);
        const matchesDepartment = department === "all" || movement.department === department;
        const matchesStatus =
          status === "all" ||
          (status === "pending_validation" && movement.status === "pending") ||
          (status === "active" && movement.status === "approved");

        return matchesText && matchesDepartment && matchesStatus;
      })
      .map((movement) => ({ kind: "movement", movement }) as const);

    return [...employeeRows, ...movementRows].sort((first, second) =>
      rowDate(second).localeCompare(rowDate(first)),
    );
  }, [currentEmployees, department, movements, query, status, submitted]);

  function openMovementModal(type: MovementType, employeeId?: string) {
    const employee = currentEmployees.find((item) => item.id === employeeId);

    setMovementForm({
      ...emptyMovementForm(),
      birthDate: employee?.birthDate ?? "",
      cboCode: employee?.cboCode ?? "",
      cpf: employee?.cpf ?? "",
      department: employee?.department ?? "",
      departmentId: "",
      email: employee?.email ?? "",
      employeeId: employee?.id ?? "",
      exclusionDate: employee?.exclusionDate ?? todayIso(),
      fullName: employee?.fullName ?? "",
      inclusionDate: employee?.inclusionDate ?? todayIso(),
      jobPosition: employee?.jobPosition ?? "",
      jobPositionId: "",
      phone: employee?.phone ?? "",
      type,
    });
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

      if (movementForm.type === "inclusion") {
        const response = await fetch(`${apiUrl}/structural/employees`, {
          body: JSON.stringify({
            birthDate: movementForm.birthDate,
            cboCode: movementForm.cboCode,
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
              : "Nao foi possivel cadastrar o cliente.",
          );
          return;
        }

        setCurrentEmployees((current) => [payload as StructuralEmployee, ...current]);
        setSubmitted(true);
        setIsMovementModalOpen(false);
        setMovementForm(emptyMovementForm());
        setMessage("Cliente cadastrado como ativo no Portal RH.");
        return;
      }

      const response = await fetch(`${apiUrl}/structural/employees/${movementForm.employeeId}`, {
        body: JSON.stringify({
          birthDate: movementForm.birthDate,
          cboCode: movementForm.cboCode,
          cpf: movementForm.cpf,
          department: movementForm.department,
          email: movementForm.email,
          exclusionDate:
            movementForm.type === "termination" ? movementForm.exclusionDate : undefined,
          fullName: movementForm.fullName,
          inclusionDate: movementForm.inclusionDate,
          jobPosition: movementForm.jobPosition,
          phone: movementForm.phone,
          registrationStatus: movementForm.type === "termination" ? "inactive" : "active",
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const payload = (await response.json()) as StructuralEmployee | { message?: string };

      if (!response.ok) {
        setMessage(
          typeof payload === "object" && payload !== null && "message" in payload
            ? String(payload.message)
            : "Nao foi possivel atualizar o cliente.",
        );
        return;
      }

      const updatedEmployee = payload as StructuralEmployee;
      setCurrentEmployees((current) =>
        current.map((employee) =>
          employee.id === updatedEmployee.id ? updatedEmployee : employee,
        ),
      );
      setSubmitted(true);
      setIsMovementModalOpen(false);
      setMovementForm(emptyMovementForm());
      setMessage(
        movementForm.type === "termination"
          ? "Cliente desligado no cadastro da empresa."
          : "Cadastro do cliente atualizado pela empresa.",
      );
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
          <div className="overflow-x-auto border-t border-slate-100">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">Situacao</th>
                  <th className="px-4 py-3 font-semibold">CPF</th>
                  <th className="px-4 py-3 font-semibold">Setor</th>
                  <th className="px-4 py-3 font-semibold">Cargo</th>
                  <th className="px-4 py-3 font-semibold">Data do status</th>
                  <th className="px-4 py-3 text-right font-semibold">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((row) =>
                  row.kind === "employee" ? (
                    <EmployeeRow
                      key={row.employee.id}
                      employee={row.employee}
                      onOpenMovement={openMovementModal}
                    />
                  ) : (
                    <MovementRow key={row.movement.id} movement={row.movement} />
                  ),
                )}
              </tbody>
            </table>
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

function EmployeeRow({
  employee,
  onOpenMovement,
}: Readonly<{
  employee: StructuralEmployee;
  onOpenMovement: (type: MovementType, employeeId?: string) => void;
}>) {
  return (
    <tr>
      <td className="px-4 py-3 font-semibold text-slate-900">{employee.fullName}</td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
            employee.registrationStatus,
          )}`}
        >
          {structuralStatusLabels[employee.registrationStatus]}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-700">{employee.cpf ?? "CPF pendente"}</td>
      <td className="px-4 py-3 text-slate-700">{employee.department}</td>
      <td className="px-4 py-3 text-slate-700">
        {employee.jobPosition}
        {employee.cboCode ? (
          <span className="mt-0.5 block text-xs text-slate-500">CBO {employee.cboCode}</span>
        ) : null}
      </td>
      <td className="px-4 py-3 text-slate-700">{dateLabel(employeeStatusDate(employee))}</td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <button
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-pronus-primary hover:text-pronus-primary"
            type="button"
            onClick={() => onOpenMovement("update", employee.id)}
          >
            Alterar
          </button>
          <button
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-red-300 hover:text-red-700"
            type="button"
            onClick={() => onOpenMovement("termination", employee.id)}
          >
            Desligar
          </button>
        </div>
      </td>
    </tr>
  );
}

function MovementRow({ movement }: Readonly<{ movement: EmployeeMovement }>) {
  return (
    <tr className="bg-slate-50/70">
      <td className="px-4 py-3 font-semibold text-slate-900">{movement.fullName}</td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
            movement.status,
          )}`}
        >
          {movementTypeLabels[movement.type]} / {movementStatusLabels[movement.status]}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-700">{movement.cpf || "CPF pendente"}</td>
      <td className="px-4 py-3 text-slate-700">{movement.department || "setor pendente"}</td>
      <td className="px-4 py-3 text-slate-700">
        {movement.jobPosition || "cargo pendente"}
        {movement.cboCode ? (
          <span className="mt-0.5 block text-xs text-slate-500">CBO {movement.cboCode}</span>
        ) : null}
      </td>
      <td className="px-4 py-3 text-slate-700">{dateLabel(movement.createdAt)}</td>
      <td className="px-4 py-3 text-right text-xs font-medium text-slate-500">Historico</td>
    </tr>
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
            {isSaving
              ? "Enviando..."
              : form.type === "inclusion"
                ? "Cadastrar cliente ativo"
                : form.type === "termination"
                  ? "Desligar cliente"
                  : "Salvar alteracao"}
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
