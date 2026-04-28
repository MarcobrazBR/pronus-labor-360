import { riskLevelColorClasses, riskLevelLabels } from "@pronus/ui";
import {
  actionStatusClasses,
  loadNr01Data,
  loadPsychosocialData,
  loadStructuralData,
  modules,
  nr01ActionStatusLabels,
} from "./pronus-data";

export const dynamic = "force-dynamic";

export default async function PronusDashboardPage() {
  const [structural, nr01, psychosocial] = await Promise.all([
    loadStructuralData(),
    loadNr01Data(),
    loadPsychosocialData(),
  ]);
  const pendingEmployees = structural.employees.filter(
    (employee) => employee.registrationStatus === "pending_validation",
  );
  const highPsychosocialSignals = psychosocial.signals.filter(
    (signal) => signal.riskLevel === "high" || signal.riskLevel === "critical",
  );
  const summaryCards = [
    {
      label: "Empresas ativas",
      value: String(structural.summary.companies),
      detail: `${structural.summary.units} unidades mapeadas`,
    },
    {
      label: "Clientes",
      value: String(structural.summary.employees),
      detail: `${structural.summary.pendingValidations} pendencia cadastral`,
    },
    {
      label: "Acoes NR-01",
      value: String(nr01.summary.openActions + nr01.summary.overdueActions),
      detail: `${nr01.summary.overdueActions} vencida`,
    },
    {
      label: "Campanhas psicossociais",
      value: String(psychosocial.summary.activeCampaigns),
      detail: `${psychosocial.summary.thresholdReached} com amostra minima`,
    },
  ];

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
            Operacao PRONUS
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">Painel executivo</h2>
        </div>

        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
          MVP operacional em evolucao
        </div>
      </header>

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

      <section className="mt-6 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-base font-semibold">Avanco por modulo</h3>
          </div>
          <div className="space-y-4 p-5">
            {modules.map((module) => (
              <article key={module.name}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold">{module.name}</h4>
                    <p className="text-xs text-slate-500">{module.owner}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {module.status}
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-pronus-primary"
                    style={{ width: `${module.progress}%` }}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-base font-semibold">Pendencias criticas</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {nr01.actions
              .filter((action) => action.status === "overdue")
              .slice(0, 3)
              .map((action) => (
                <article key={action.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto]">
                  <div>
                    <h4 className="text-sm font-semibold">{action.title}</h4>
                    <p className="mt-1 text-sm text-slate-600">
                      {action.companyTradeName} / {action.responsible}
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

            {highPsychosocialSignals.slice(0, 2).map((signal) => (
              <article key={signal.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto]">
                <div>
                  <h4 className="text-sm font-semibold">{signal.sectorName}</h4>
                  <p className="mt-1 text-sm text-slate-600">
                    {signal.companyTradeName} / {signal.recommendation}
                  </p>
                </div>
                <span
                  className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${riskLevelColorClasses[signal.riskLevel]}`}
                >
                  {riskLevelLabels[signal.riskLevel]}
                </span>
              </article>
            ))}

            {pendingEmployees.slice(0, 2).map((employee) => (
              <article key={employee.id} className="px-5 py-4">
                <h4 className="text-sm font-semibold">{employee.fullName}</h4>
                <p className="mt-1 text-sm text-slate-600">
                  Cadastro pendente / {employee.companyTradeName} / {employee.department}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
