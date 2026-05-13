"use client";

import { riskLevelColorClasses, riskLevelLabels } from "@pronus/ui";
import { useMemo, useState } from "react";
import {
  campaignStatusClasses,
  psychosocialCampaignStatusLabels,
  type CopsoqAxisId,
  type CopsoqCompanyAnalysis,
  type PsychosocialCampaign,
  type PsychosocialSectorSignal,
  type PsychosocialSummary,
  type PsychosocialTechnicalReport,
} from "../pronus-data";

const axisColors: Record<CopsoqAxisId, string> = {
  company_worker_relation: "#7c3aed",
  health_wellbeing: "#dc2626",
  relationships_leadership: "#0f766e",
  work_demands: "#f97316",
  work_organization: "#2563eb",
};

export function PsychosocialRiskPanel({
  campaigns,
  copsoqAnalysis,
  technicalReports,
  signals,
  summary,
}: Readonly<{
  campaigns: PsychosocialCampaign[];
  copsoqAnalysis: CopsoqCompanyAnalysis[];
  technicalReports: PsychosocialTechnicalReport[];
  signals: PsychosocialSectorSignal[];
  summary: PsychosocialSummary;
}>) {
  const [selectedCompany, setSelectedCompany] = useState(
    copsoqAnalysis[0]?.companyTradeName ?? campaigns[0]?.companyTradeName ?? "",
  );
  const activeAnalysis =
    copsoqAnalysis.find((analysis) => analysis.companyTradeName === selectedCompany) ??
    copsoqAnalysis[0];
  const activeTechnicalReport =
    activeAnalysis === undefined
      ? undefined
      : technicalReports.find((report) => report.campaignId === activeAnalysis.campaignId);
  const discGradient = useMemo(() => {
    if (activeAnalysis === undefined || activeAnalysis.axes.length === 0) {
      return "#e2e8f0";
    }

    const total = activeAnalysis.axes.reduce((sum, axis) => sum + axis.riskPercent, 0);
    let cursor = 0;
    const segments = activeAnalysis.axes.map((axis) => {
      const start = cursor;
      const size = total === 0 ? 0 : (axis.riskPercent / total) * 100;
      cursor += size;
      return `${axisColors[axis.axisId]} ${start}% ${cursor}%`;
    });

    return `conic-gradient(${segments.join(", ")})`;
  }, [activeAnalysis]);
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

      {activeAnalysis !== undefined && (
        <section className="mt-4 grid gap-4">
          <article className="rounded-lg border border-slate-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-base font-semibold">Comportamento COPSOQ agregado</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Massa respondente por eixo tematico, sem exposicao individual.
                </p>
              </div>
              <select
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                value={activeAnalysis.companyTradeName}
                onChange={(event) => setSelectedCompany(event.target.value)}
              >
                {copsoqAnalysis.map((analysis) => (
                  <option key={analysis.companyTradeName} value={analysis.companyTradeName}>
                    {analysis.companyTradeName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="flex items-center justify-center">
                <div
                  className="relative flex h-48 w-48 items-center justify-center rounded-full"
                  style={{ background: discGradient }}
                  aria-label="Grafico de disco COPSOQ por eixo"
                >
                  <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
                    <span className="text-xs font-semibold uppercase text-slate-500">Risco geral</span>
                    <strong className="mt-1 text-3xl font-semibold text-slate-950">
                      {activeAnalysis.overallRiskPercent}%
                    </strong>
                    <span
                      className={`mt-2 rounded-full px-2 py-0.5 text-xs font-semibold ${riskLevelColorClasses[activeAnalysis.overallRiskLevel]}`}
                    >
                      {riskLevelLabels[activeAnalysis.overallRiskLevel]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-950">
                    Prioridade: {activeAnalysis.priorityAxisLabel}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {activeAnalysis.companyWideRecommendation}
                  </p>
                </div>
                {activeAnalysis.axes.map((axis) => (
                  <div key={axis.axisId} className="grid gap-2 sm:grid-cols-[1fr_74px]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-sm"
                          style={{ backgroundColor: axisColors[axis.axisId] }}
                        />
                        <span className="text-sm font-semibold text-slate-800">
                          {axis.axisLabel}
                        </span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            backgroundColor: axisColors[axis.axisId],
                            width: `${Math.min(axis.riskPercent, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span
                      className={`self-center rounded-full px-2 py-1 text-center text-xs font-semibold ${riskLevelColorClasses[axis.riskLevel]}`}
                    >
                      {axis.riskPercent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {activeTechnicalReport !== undefined && (
            <article className="rounded-lg border border-slate-200 bg-white">
              <div className="grid gap-4 border-b border-slate-200 px-5 py-4 lg:grid-cols-[1fr_auto]">
                <div>
                  <h3 className="text-base font-semibold">Relatorio tecnico e plano de intervencao</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Leitura tecnica agregada, com regra minima de anonimato e acoes sugeridas.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-right text-xs text-slate-500">
                  <span>
                    Minimo anonimo
                    <strong className="block text-base text-slate-950">
                      {activeTechnicalReport.minimumAnonymousGroupSize}
                    </strong>
                  </span>
                  <span>
                    Grupos agregados
                    <strong className="block text-base text-slate-950">
                      {activeTechnicalReport.aggregatedGroups}
                    </strong>
                  </span>
                </div>
              </div>
              <div className="grid gap-4 p-5 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">
                    Prioridade tecnica: {activeTechnicalReport.priorityAxisLabel}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {activeTechnicalReport.executiveSummary}
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-500">
                    <span>
                      Respostas
                      <strong className="block text-lg text-slate-950">
                        {activeTechnicalReport.totalResponses}
                      </strong>
                    </span>
                    <span>
                      Risco
                      <strong className="block text-lg text-slate-950">
                        {activeTechnicalReport.overallRiskPercent}%
                      </strong>
                    </span>
                    <span>
                      Visiveis
                      <strong className="block text-lg text-slate-950">
                        {activeTechnicalReport.visibleGroups}
                      </strong>
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {activeTechnicalReport.interventionPlan.map((item) => (
                    <div key={item.id} className="rounded-md border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-950">{item.target}</p>
                        <span className="rounded-full bg-pronus-primary/10 px-2 py-1 text-xs font-semibold text-pronus-primary">
                          {item.priority}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{item.action}</p>
                      <p className="mt-2 text-xs font-medium text-slate-500">
                        Responsavel sugerido: {item.ownerSuggestion}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Evidencia: {item.evidenceExpected}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          )}

          <article className="rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="text-base font-semibold">Matriz setor x eixo COPSOQ</h3>
              <p className="mt-1 text-sm text-slate-500">
                O acumulado indica onde atacar primeiro por percentual de risco agregado.
              </p>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="min-w-[980px] divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Setor</th>
                    {activeAnalysis.axes.map((axis) => (
                      <th key={axis.axisId} className="px-3 py-3">
                        {axis.axisLabel}
                      </th>
                    ))}
                    <th className="px-3 py-3">Acumulado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {[...activeAnalysis.sectors]
                    .sort((first, second) => second.accumulatedRiskPercent - first.accumulatedRiskPercent)
                    .map((sector) => (
                      <tr key={sector.sectorName} className="hover:bg-slate-50">
                        <td className="px-3 py-3">
                          <p className="font-semibold text-slate-950">{sector.sectorName}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {sector.responses} respostas / foco {sector.priorityAxisLabel}
                          </p>
                        </td>
                        {activeAnalysis.axes.map((axis) => {
                          const sectorAxis = sector.axes.find((item) => item.axisId === axis.axisId);

                          return (
                            <td key={axis.axisId} className="px-3 py-3">
                              {sectorAxis !== undefined && (
                                <span
                                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${riskLevelColorClasses[sectorAxis.riskLevel]}`}
                                >
                                  {sectorAxis.riskPercent}% / {riskLevelLabels[sectorAxis.riskLevel]}
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${riskLevelColorClasses[sector.accumulatedRiskLevel]}`}
                          >
                            {sector.accumulatedRiskPercent}% / {riskLevelLabels[sector.accumulatedRiskLevel]}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      )}

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
