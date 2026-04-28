"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  dateLabel,
  divergenceStatusLabels,
  fieldLabels,
  statusClasses,
  type DivergenceStatus,
  type EmployeeDivergence,
} from "../client-data";

export function ClientDivergencePanel({
  divergences,
}: Readonly<{ divergences: EmployeeDivergence[] }>) {
  const router = useRouter();
  const [items, setItems] = useState(divergences);
  const [filter, setFilter] = useState<DivergenceStatus | "all">("pending");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const filtered = items.filter((item) => filter === "all" || item.status === filter);

  async function updateDivergence(id: string, status: Exclude<DivergenceStatus, "pending">) {
    setIsSaving(true);
    setMessage(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
      const response = await fetch(`${apiUrl}/employee-access/divergences/${id}`, {
        body: JSON.stringify({ reviewerName: "RH Cliente", status }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const payload = (await response.json()) as EmployeeDivergence | { message?: string };

      if (!response.ok) {
        setMessage("Não foi possível atualizar a divergência.");
        return;
      }

      setItems((current) =>
        current.map((item) => (item.id === id ? (payload as EmployeeDivergence) : item)),
      );
      setMessage(status === "approved" ? "Divergência aprovada." : "Divergência recusada.");
      router.refresh();
    } catch {
      setMessage("Não foi possível conectar a API local.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <h3 className="text-base font-semibold">Fila de divergências</h3>
        <label className="block md:w-52">
          <span className="sr-only">Status</span>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            value={filter}
            onChange={(event) => setFilter(event.target.value as DivergenceStatus | "all")}
          >
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovadas</option>
            <option value="rejected">Recusadas</option>
            <option value="all">Todas</option>
          </select>
        </label>
      </div>

      {message !== null && (
        <div className="mx-5 mt-4 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-800">
          {message}
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {filtered.map((divergence) => (
          <article key={divergence.id} className="grid gap-4 px-5 py-4 xl:grid-cols-[1fr_auto]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-semibold">{divergence.fullName}</h4>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                    divergence.status,
                  )}`}
                >
                  {divergenceStatusLabels[divergence.status]}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {divergence.cpf} / enviada em {dateLabel(divergence.createdAt)}
              </p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {divergence.changes.map((change) => (
                  <div
                    key={`${divergence.id}-${change.field}`}
                    className="rounded-md bg-slate-100 px-3 py-2"
                  >
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      {fieldLabels[change.field] ?? change.field}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Atual: {change.currentValue || "Não informado"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      Novo: {change.submittedValue}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {divergence.status === "pending" && (
              <div className="flex gap-2 xl:flex-col xl:justify-center">
                <button
                  className="rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  disabled={isSaving}
                  type="button"
                  onClick={() => void updateDivergence(divergence.id, "approved")}
                >
                  Aprovar
                </button>
                <button
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
                  disabled={isSaving}
                  type="button"
                  onClick={() => void updateDivergence(divergence.id, "rejected")}
                >
                  Recusar
                </button>
              </div>
            )}
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-slate-500">
            Nenhuma divergência neste filtro.
          </div>
        )}
      </div>
    </section>
  );
}
