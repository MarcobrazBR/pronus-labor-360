"use client";

import { useEffect, useMemo, useState } from "react";

interface EmployeePasswordResetRequest {
  id: string;
  employeeId: string;
  companyTradeName: string;
  fullName: string;
  cpf: string;
  status: "pending" | "completed";
  requestedAt: string;
  resolvedAt?: string;
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

export function EmployeePasswordResetCard({
  companyTradeName,
}: Readonly<{ companyTradeName: string }>) {
  const [requests, setRequests] = useState<EmployeePasswordResetRequest[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let shouldIgnore = false;

    async function loadRequests() {
      try {
        const response = await fetch(`${getApiUrl()}/employee-access/password-reset-requests`);

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as EmployeePasswordResetRequest[];

        if (!shouldIgnore) {
          setRequests(payload);
        }
      } catch {
        if (!shouldIgnore) {
          setError("Nao foi possivel carregar pedidos de senha.");
        }
      }
    }

    void loadRequests();

    return () => {
      shouldIgnore = true;
    };
  }, []);

  const companyRequests = useMemo(
    () => requests.filter((request) => request.companyTradeName === companyTradeName),
    [companyTradeName, requests],
  );
  const pendingRequests = companyRequests.filter((request) => request.status === "pending");
  const hasPending = pendingRequests.length > 0;

  async function resolveRequest(requestId: string) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${getApiUrl()}/employee-access/password-reset-requests/${requestId}/resolve`,
        { method: "PATCH" },
      );
      const payload = (await response.json()) as EmployeePasswordResetRequest;

      if (!response.ok) {
        setError("Nao foi possivel liberar o reset.");
        return;
      }

      setRequests((current) =>
        current.map((request) => (request.id === payload.id ? payload : request)),
      );
    } catch {
      setError("Nao foi possivel conectar a API local.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        className={`rounded-lg border p-4 text-left transition ${
          hasPending
            ? "border-red-200 bg-red-50 text-red-800 hover:border-red-300"
            : "border-slate-200 bg-white text-slate-700"
        }`}
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <p className="text-sm font-medium">Reset de senha</p>
        <strong className="mt-2 block text-3xl font-semibold tracking-normal">
          {pendingRequests.length}
        </strong>
        <span className="mt-2 block text-sm">
          {hasPending ? "Pedido do colaborador pendente" : "Nenhum pedido pendente"}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
          <section className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Pedidos de reset</h2>
                <p className="mt-1 text-sm text-slate-600">{companyTradeName}</p>
              </div>
              <button
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                Fechar
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5">
              {companyRequests.length === 0 ? (
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-600">
                  Nenhum pedido foi registrado para esta empresa.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {companyRequests.map((request) => (
                    <article
                      key={request.id}
                      className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
                    >
                      <div>
                        <h3 className="text-sm font-semibold text-slate-950">{request.fullName}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {request.cpf} / pedido {dateLabel(request.requestedAt)}
                        </p>
                      </div>
                      <button
                        aria-label={`Liberar reset de ${request.fullName}`}
                        className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-semibold ${
                          request.status === "completed"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-400"
                        }`}
                        disabled={request.status === "completed" || isLoading}
                        title={
                          request.status === "completed"
                            ? "Senha padrao liberada"
                            : "Liberar senha padrao"
                        }
                        type="button"
                        onClick={() => void resolveRequest(request.id)}
                      >
                        ✓
                      </button>
                    </article>
                  ))}
                </div>
              )}
              {error !== null && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
