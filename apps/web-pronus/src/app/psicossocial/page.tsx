import { riskLevelColorClasses, riskLevelLabels } from "@pronus/ui";
import {
  campaignStatusClasses,
  loadPsychosocialData,
  psychosocialCampaignStatusLabels,
} from "../pronus-data";

export const dynamic = "force-dynamic";

export default async function PsychosocialPage() {
  const { summary, campaigns, signals } = await loadPsychosocialData();
  const summaryCards = [
    { label: "Campanhas", value: summary.campaigns, detail: `${summary.activeCampaigns} ativas` },
    {
      label: "Adesao media",
      value: `${summary.averageResponseRate}%`,
      detail: `${summary.thresholdReached} com amostra minima`,
    },
    {
      label: "Setores altos/criticos",
      value: summary.highOrCriticalSectors,
      detail: "prioridade para escuta tecnica",
    },
    {
      label: "Entrevistas",
      value: summary.pendingInterviews,
      detail: "fila tecnica inicial",
    },
  ];

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
            Saude mental e organizacao do trabalho
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">Risco psicossocial</h2>
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

      <section className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-base font-semibold">Campanhas</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {campaigns.map((campaign) => (
              <article key={campaign.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_auto]">
                <div>
                  <h4 className="text-sm font-semibold">{campaign.name}</h4>
                  <p className="mt-1 text-sm text-slate-600">
                    {campaign.companyTradeName} / {campaign.responseCount} de{" "}
                    {campaign.targetParticipants} respostas
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Janela {new Date(`${campaign.startDate}T00:00:00`).toLocaleDateString("pt-BR")}{" "}
                    a {new Date(`${campaign.endDate}T00:00:00`).toLocaleDateString("pt-BR")} /
                    adesao {campaign.responseRate}%
                  </p>
                </div>
                <span
                  className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${campaignStatusClasses(
                    campaign.status,
                  )}`}
                >
                  {psychosocialCampaignStatusLabels[campaign.status]}
                </span>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-base font-semibold">Sinais por setor</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {signals.map((signal) => (
              <article key={signal.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold">{signal.sectorName}</h4>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      {signal.privacyStatus === "aggregated" ? "Agregado" : "Visivel"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {signal.companyTradeName} / {signal.responses} de {signal.participants}{" "}
                    respostas ({signal.responseRate}%)
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{signal.recommendation}</p>
                </div>
                <span
                  className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${riskLevelColorClasses[signal.riskLevel]}`}
                >
                  {riskLevelLabels[signal.riskLevel]}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
