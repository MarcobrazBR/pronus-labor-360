import {
  campaignStatusLabels,
  dateLabel,
  loadClientPortalData,
  riskLevelLabels,
  statusClasses,
} from "../client-data";

export const dynamic = "force-dynamic";

export default async function ClientPsychosocialPage() {
  const data = await loadClientPortalData();
  const activeCampaigns = data.psychosocialCampaigns.filter(
    (campaign) => campaign.status === "active" || campaign.status === "threshold_reached",
  );
  const highSignals = data.psychosocialSignals.filter(
    (signal) => signal.riskLevel === "high" || signal.riskLevel === "critical",
  );

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
            Psicossocial
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">
            Campanhas e sinais agregados
          </h2>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
          {highSignals.length} setor(es) em atenção
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-slate-200 bg-white">
          <PanelTitle title="Campanhas" />
          <div className="divide-y divide-slate-100">
            {data.psychosocialCampaigns.map((campaign) => (
              <article key={campaign.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">{campaign.name}</h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                      campaign.status,
                    )}`}
                  >
                    {campaignStatusLabels[campaign.status]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {dateLabel(campaign.startDate)} até {dateLabel(campaign.endDate)}
                </p>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-pronus-primary"
                    style={{ width: `${Math.min(campaign.responseRate, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {campaign.responseCount}/{campaign.targetParticipants} respostas /{" "}
                  {campaign.responseRate}%
                </p>
              </article>
            ))}
            {activeCampaigns.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-slate-500">
                Nenhuma campanha ativa.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white">
          <PanelTitle title="Sinais por setor" />
          <div className="divide-y divide-slate-100">
            {data.psychosocialSignals.map((signal) => (
              <article key={signal.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">{signal.sectorName}</h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                      signal.riskLevel,
                    )}`}
                  >
                    {riskLevelLabels[signal.riskLevel]}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {signal.privacyStatus === "aggregated" ? "Agregado" : "Visível"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {signal.responses}/{signal.participants} respostas / {signal.responseRate}%
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">{signal.recommendation}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function PanelTitle({ title }: Readonly<{ title: string }>) {
  return (
    <div className="border-b border-slate-200 px-5 py-4">
      <h3 className="text-base font-semibold">{title}</h3>
    </div>
  );
}
