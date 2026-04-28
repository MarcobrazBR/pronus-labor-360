import { riskLevelColorClasses, riskLevelLabels } from "@pronus/ui";
import { actionStatusClasses, loadNr01Data, nr01ActionStatusLabels } from "../pronus-data";

export const dynamic = "force-dynamic";

export default async function Nr01PgrPage() {
  const { summary, risks, actions } = await loadNr01Data();
  const riskTabs = ["Inventario", "Plano de acao", "Evidencias", "Documentos"];
  const summaryCards = [
    { label: "Riscos", value: summary.risks, detail: "inventario inicial" },
    {
      label: "Altos/Criticos",
      value: summary.highRisks + summary.criticalRisks,
      detail: "prioridade tecnica",
    },
    { label: "Acoes abertas", value: summary.openActions, detail: "plano PGR" },
    { label: "Evidencias", value: summary.evidences, detail: "anexos vinculados" },
  ];

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
            SST e conformidade
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">Risco Ocupacional</h2>
        </div>
      </header>

      <nav
        className="mb-5 flex flex-wrap gap-2 text-sm font-semibold"
        aria-label="Risco ocupacional"
      >
        {riskTabs.map((tab, index) => (
          <button
            key={tab}
            className={`rounded-md px-3 py-2 ${
              index === 0
                ? "bg-pronus-primary text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
            type="button"
          >
            {tab}
          </button>
        ))}
      </nav>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article key={card.label} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <strong className="mt-2 block text-3xl font-semibold tracking-normal">
              {card.value}
            </strong>
            <span className="mt-2 block text-sm text-slate-600">{card.detail}</span>
          </article>
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-base font-semibold">Inventario de riscos</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {risks.map((risk) => (
              <article key={risk.id} className="px-5 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">{risk.danger}</h4>
                    <p className="mt-1 text-sm text-slate-600">
                      {risk.companyTradeName} / {risk.departmentName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {risk.risk} / P{risk.probability} x S{risk.severity}
                    </p>
                  </div>
                  <span
                    className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${riskLevelColorClasses[risk.level]}`}
                  >
                    {riskLevelLabels[risk.level]}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-base font-semibold">Plano de acao PGR</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {actions.map((action) => (
              <article key={action.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_auto]">
                <div>
                  <h4 className="text-sm font-semibold">{action.title}</h4>
                  <p className="mt-1 text-sm text-slate-600">
                    {action.companyTradeName} / {action.responsible}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Prazo {new Date(`${action.dueDate}T00:00:00`).toLocaleDateString("pt-BR")} /
                    evidencias {action.evidenceCount}
                  </p>
                </div>
                <span
                  className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${actionStatusClasses(
                    action.status,
                  )}`}
                >
                  {nr01ActionStatusLabels[action.status]}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
