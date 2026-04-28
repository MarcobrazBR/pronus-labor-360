import {
  actionStatusLabels,
  dateLabel,
  loadClientPortalData,
  riskLevelLabels,
  statusClasses,
} from "../client-data";

export const dynamic = "force-dynamic";

export default async function ClientRisksPage() {
  const data = await loadClientPortalData();
  const highRisks = data.risks.filter((risk) => risk.level === "high" || risk.level === "critical");
  const overdueActions = data.riskActions.filter((action) => action.status === "overdue");

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
            Risco ocupacional
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">
            Inventário e plano de ação
          </h2>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
          {highRisks.length} risco(s) alto/crítico
        </div>
      </header>

      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        <Info label="Riscos mapeados" value={String(data.risks.length)} />
        <Info label="Ações abertas" value={String(data.riskActions.length)} />
        <Info label="Ações vencidas" value={String(overdueActions.length)} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white">
          <PanelTitle title="Riscos por setor" />
          <div className="divide-y divide-slate-100">
            {data.risks.map((risk) => (
              <article key={risk.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">{risk.departmentName}</h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                      risk.level,
                    )}`}
                  >
                    {riskLevelLabels[risk.level]}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-900">{risk.danger}</p>
                <p className="mt-1 text-sm text-slate-600">{risk.risk}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white">
          <PanelTitle title="Plano de ação" />
          <div className="divide-y divide-slate-100">
            {data.riskActions.map((action) => (
              <article key={action.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">{action.title}</h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                      action.status,
                    )}`}
                  >
                    {actionStatusLabels[action.status]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {action.responsible} / prazo {dateLabel(action.dueDate)}
                </p>
                <p className="mt-1 text-sm text-slate-500">{action.evidenceCount} evidência(s)</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Info({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <strong className="mt-2 block text-3xl font-semibold tracking-normal">{value}</strong>
    </article>
  );
}

function PanelTitle({ title }: Readonly<{ title: string }>) {
  return (
    <div className="border-b border-slate-200 px-5 py-4">
      <h3 className="text-base font-semibold">{title}</h3>
    </div>
  );
}
