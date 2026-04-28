"use client";

import { useMemo, useState } from "react";
import {
  dateLabel,
  statusClasses,
  structuralStatusLabels,
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

export function ClientEmployeeSearchPanel({
  employees,
}: Readonly<{ employees: StructuralEmployee[] }>) {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState<StructuralStatus | "all">("all");
  const [submitted, setSubmitted] = useState(false);

  const departments = useMemo(
    () => Array.from(new Set(employees.map((employee) => employee.department))).sort(),
    [employees],
  );
  const filtered = useMemo(() => {
    if (!submitted) {
      return [];
    }

    const normalized = query.trim().toLowerCase();

    return employees.filter((employee) => {
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
  }, [department, employees, query, status, submitted]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold">Consulta de clientes</h3>
      </div>
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
                  {employee.cpf ?? "CPF pendente"} / {employee.department} / {employee.jobPosition}
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
  );
}
