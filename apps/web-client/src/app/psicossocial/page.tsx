import type { CopsoqAxisId, CopsoqCompanyAnalysis, RiskLevel } from "../client-data";
import {
  campaignStatusLabels,
  dateLabel,
  loadClientPortalData,
  riskLevelLabels,
  statusClasses,
} from "../client-data";

export const dynamic = "force-dynamic";

const axisColors: Record<CopsoqAxisId, string> = {
  work_demands: "#0f5f82",
  work_organization: "#37a8b8",
  relationships_leadership: "#8ac9d0",
  company_worker_relation: "#f2b84b",
  health_wellbeing: "#ef7d57",
};

const riskBadgeClasses: Record<RiskLevel, string> = {
  low: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  moderate: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  high: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  critical: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

export default async function ClientPsychosocialPage() {
  const data = await loadClientPortalData();
  const activeCampaigns = data.psychosocialCampaigns.filter(
    (campaign) => campaign.status === "active" || campaign.status === "threshold_reached",
  );
  const highSignals = data.psychosocialSignals.filter(
    (signal) => signal.riskLevel === "high" || signal.riskLevel === "critical",
  );
  const copsoqAnalysis = data.copsoqAnalysis[0];

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
          {highSignals.length} setor(es) em atencao
        </div>
      </header>

      {copsoqAnalysis ? <CopsoqAnalysisCard analysis={copsoqAnalysis} /> : null}

      <section className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
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
                  {dateLabel(campaign.startDate)} ate {dateLabel(campaign.endDate)}
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
                    {signal.privacyStatus === "aggregated" ? "Agregado" : "Visivel"}
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

function CopsoqAnalysisCard({ analysis }: Readonly<{ analysis: CopsoqCompanyAnalysis }>) {
  const discGradient = buildDiscGradient(analysis);
  const sortedSectors = [...analysis.sectors].sort(
    (left, right) => right.accumulatedRiskPercent - left.accumulatedRiskPercent,
  );

  return (
    <section className="grid gap-4">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
              COPSOQ agregado
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">
              Comportamento geral da empresa
            </h3>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              riskBadgeClasses[analysis.overallRiskLevel]
            }`}
          >
            {riskLevelLabels[analysis.overallRiskLevel]}
          </span>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-[172px_1fr] md:items-center">
          <div
            className="grid aspect-square place-items-center rounded-full"
            style={{ background: discGradient }}
            aria-label={`Risco psicossocial agregado de ${formatPercent(
              analysis.overallRiskPercent,
            )}%`}
          >
            <div className="grid size-[118px] place-items-center rounded-full bg-white text-center shadow-inner">
              <div>
                <p className="text-3xl font-semibold text-slate-950">
                  {formatPercent(analysis.overallRiskPercent)}%
                </p>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  risco
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {analysis.axes.map((axis) => (
              <div key={axis.axisId}>
                <div className="mb-1 flex items-center justify-between gap-3 text-xs font-semibold text-slate-600">
                  <span>{axis.axisLabel}</span>
                  <span>{formatPercent(axis.riskPercent)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.min(axis.riskPercent, 100)}%`,
                      backgroundColor: axisColors[axis.axisId],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-md bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">
            Prioridade: {analysis.priorityAxisLabel}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {analysis.companyWideRecommendation}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <PanelTitle title="Matriz setor x eixo COPSOQ" />
        <div className="overflow-x-auto">
          <table className="min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Setor</th>
                {analysis.axes.map((axis) => (
                  <th key={axis.axisId} className="px-4 py-3">
                    {axis.axisLabel}
                  </th>
                ))}
                <th className="px-4 py-3">Acumulado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedSectors.map((sector) => (
                <tr key={sector.sectorName} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-950">{sector.sectorName}</p>
                    <p className="mt-1 text-xs text-slate-500">{sector.responses} respostas</p>
                  </td>
                  {analysis.axes.map((axis) => {
                    const sectorAxis = sector.axes.find((item) => item.axisId === axis.axisId);
                    return (
                      <td key={axis.axisId} className="px-4 py-3">
                        {sectorAxis ? (
                          <span
                            className={`inline-flex min-w-[88px] items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                              riskBadgeClasses[sectorAxis.riskLevel]
                            }`}
                          >
                            {formatPercent(sectorAxis.riskPercent)}% /{" "}
                            {riskLevelLabels[sectorAxis.riskLevel]}
                          </span>
                        ) : (
                          <span className="text-slate-400">Sem dados</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex min-w-[96px] items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        riskBadgeClasses[sector.accumulatedRiskLevel]
                      }`}
                    >
                      {formatPercent(sector.accumulatedRiskPercent)}%
                    </span>
                    <p className="mt-2 max-w-[220px] text-xs leading-5 text-slate-500">
                      Atacar primeiro: {sector.priorityAxisLabel}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function buildDiscGradient(analysis: CopsoqCompanyAnalysis) {
  const total = analysis.axes.reduce((sum, axis) => sum + axis.riskPercent, 0) || 1;
  let cursor = 0;
  const stops = analysis.axes.map((axis) => {
    const start = cursor;
    cursor += (axis.riskPercent / total) * 100;
    return `${axisColors[axis.axisId]} ${start.toFixed(2)}% ${cursor.toFixed(2)}%`;
  });

  return `conic-gradient(${stops.join(", ")})`;
}

function formatPercent(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function PanelTitle({ title }: Readonly<{ title: string }>) {
  return (
    <div className="border-b border-slate-200 px-5 py-4">
      <h3 className="text-base font-semibold">{title}</h3>
    </div>
  );
}
