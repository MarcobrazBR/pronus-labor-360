export const dynamic = "force-dynamic";

type DivergenceStatus = "pending" | "approved" | "rejected";

interface EmployeeDivergence {
  id: string;
  companyTradeName: string;
  fullName: string;
  cpf: string;
  status: DivergenceStatus;
  changes: Array<{
    field: string;
    currentValue: string;
    submittedValue: string;
  }>;
  createdAt: string;
}

const fallbackDivergences: EmployeeDivergence[] = [
  {
    id: "divergence-001",
    companyTradeName: "Industria Horizonte",
    fullName: "Rafael Moreira Lima",
    cpf: "987.654.321-00",
    status: "pending",
    createdAt: new Date().toISOString(),
    changes: [
      {
        field: "phone",
        currentValue: "",
        submittedValue: "11 98888-7777",
      },
    ],
  },
];

const statusLabels: Record<DivergenceStatus, string> = {
  pending: "Pendente",
  approved: "Aprovada",
  rejected: "Recusada",
};

const fieldLabels: Record<string, string> = {
  email: "E-mail",
  phone: "Telefone",
  department: "Setor",
  jobPosition: "Cargo",
};

async function fetchApi<T>(path: string, fallback: T): Promise<T> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

  try {
    const response = await fetch(`${apiUrl}${path}`, { cache: "no-store" });

    if (!response.ok) {
      return fallback;
    }

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

function statusClasses(status: DivergenceStatus) {
  if (status === "pending") {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }

  if (status === "approved") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  return "bg-red-50 text-red-700 ring-1 ring-red-200";
}

export default async function ClientHomePage() {
  const divergences = await fetchApi<EmployeeDivergence[]>(
    "/employee-access/divergences",
    fallbackDivergences,
  );
  const pendingDivergences = divergences.filter((divergence) => divergence.status === "pending");
  const indicators = [
    { label: "Colaboradores ativos", value: "474" },
    { label: "Divergencias pendentes", value: String(pendingDivergences.length) },
    { label: "Risco geral", value: "Baixo" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-6 text-slate-900 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <img alt="Pronus Labor" className="h-12 w-auto" src="/brand/pronus-logo.png" />
            <h1 className="mt-1 text-2xl font-semibold">Portal RH Cliente</h1>
          </div>
          <span className="w-fit rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
            Visao agregada e governanca cadastral
          </span>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {indicators.map((indicator) => (
            <article
              key={indicator.label}
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              <p className="text-sm text-slate-600">{indicator.label}</p>
              <strong className="mt-2 block text-2xl">{indicator.value}</strong>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold">Divergencias cadastrais</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {divergences.map((divergence) => (
              <article key={divergence.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold">{divergence.fullName}</h3>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                        divergence.status,
                      )}`}
                    >
                      {statusLabels[divergence.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {divergence.companyTradeName} / {divergence.cpf}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {divergence.changes.map((change) => (
                      <span
                        key={`${divergence.id}-${change.field}`}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                      >
                        {fieldLabels[change.field] ?? change.field}: {change.submittedValue}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  {new Date(divergence.createdAt).toLocaleDateString("pt-BR")}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
