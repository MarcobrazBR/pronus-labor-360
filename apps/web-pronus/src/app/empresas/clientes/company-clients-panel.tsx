"use client";

import { useMemo, useState } from "react";
import {
  statusClasses,
  structuralStatusLabels,
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

export function CompanyClientsPanel({ employees }: Readonly<{ employees: StructuralEmployee[] }>) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StructuralStatus | "all">("all");
  const [hasSearched, setHasSearched] = useState(false);
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filteredEmployees = useMemo(() => {
    if (!hasSearched) {
      return [];
    }

    const normalizedQuery = submittedSearch.trim().toLowerCase();

    return employees.filter((client) => {
      const text = [
        client.fullName,
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
  }, [employees, hasSearched, status, submittedSearch]);

  function searchClients() {
    if (query.trim().length === 0 && status === "all") {
      setError("Informe nome, empresa, setor, cargo ou status para buscar clientes.");
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

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-base font-semibold">Consulta de clientes</h3>
            <p className="mt-1 text-sm text-slate-500">
              Funcionarios das empresas contratantes ficam nesta area para inclusao, conferencia e
              ajuste cadastral.
            </p>
          </div>
          <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
            {employees.length} clientes vinculados
          </span>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-500">Pesquisar</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
              placeholder="Nome, empresa, setor, cargo ou status"
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

        {error !== null && (
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
            {error}
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
        <div className="overflow-x-auto p-5">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Empresa</th>
                <th className="px-4 py-3 font-semibold">Setor</th>
                <th className="px-4 py-3 font-semibold">Cargo</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((client) => (
                <tr key={client.id}>
                  <td className="px-4 py-3 font-semibold">{client.fullName}</td>
                  <td className="px-4 py-3">{client.companyTradeName}</td>
                  <td className="px-4 py-3">{client.department}</td>
                  <td className="px-4 py-3">{client.jobPosition}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                        client.registrationStatus,
                      )}`}
                    >
                      {structuralStatusLabels[client.registrationStatus]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
