import Link from "next/link";
import {
  actionStatusLabels,
  campaignStatusLabels,
  contractStatusLabels,
  dateLabel,
  documentStatusLabels,
  loadClientPortalData,
  riskLevelLabels,
  statusClasses,
  type PsychosocialSectorSignal,
  type StructuralEmployee,
} from "./client-data";
import { EmployeePasswordResetCard } from "./employee-password-reset-card";

export const dynamic = "force-dynamic";

type SummaryCard = {
  accent: "primary" | "warning" | "danger" | "success";
  detail: string;
  href?: string;
  label: string;
  progress?: number;
  value: string;
};

type NextAction = {
  detail: string;
  href: string;
  label: string;
  tone: "danger" | "primary" | "warning";
};

export default async function ClientHomePage() {
  const data = await loadClientPortalData();
  const activeCampaign = data.psychosocialCampaigns[0];
  const activeEmployees = data.employees.filter(
    (employee) => employee.registrationStatus === "active",
  );
  const pendingEmployees = data.employees.filter(
    (employee) => employee.registrationStatus === "pending_validation",
  );
  const pendingDivergences = data.divergences.filter((item) => item.status === "pending");
  const openActions = data.riskActions.filter(
    (item) => item.status === "open" || item.status === "in_progress" || item.status === "overdue",
  );
  const overdueActions = data.riskActions.filter((item) => item.status === "overdue");
  const pendingDocuments = data.documents.filter(
    (item) => item.status === "draft" || item.status === "in_review" || item.status === "expired",
  );
  const pendingSignatures = data.signatures.filter(
    (signature) => signature.status === "pending" || signature.status === "expired",
  );
  const contractedPeopleBase = Math.max(
    data.activeCompany.employees,
    activeCampaign?.targetParticipants ?? 0,
    data.employees.length,
  );
  const visiblePeopleBase = Math.max(
    data.employees.length,
    activeEmployees.length + pendingEmployees.length,
  );
  const registrationRate = percent(activeEmployees.length, visiblePeopleBase);
  const psychosocialRate =
    activeCampaign === undefined
      ? 0
      : activeCampaign.responseRate ||
        percent(activeCampaign.responseCount, activeCampaign.targetParticipants);
  const documentReadinessRate = percent(
    data.documents.filter(
      (document) =>
        document.status === "approved" ||
        document.status === "published" ||
        document.status === "signed",
    ).length,
    data.documents.length,
  );
  const actionReadinessRate = percent(
    data.riskActions.filter((action) => action.status === "done").length,
    data.riskActions.length,
  );
  const readinessScore = clamp(
    100 -
      pendingDivergences.length * 8 -
      pendingEmployees.length * 4 -
      pendingDocuments.length * 6 -
      overdueActions.length * 12 -
      pendingSignatures.length * 5,
    0,
    100,
  );
  const readinessTone =
    readinessScore >= 85 ? "success" : readinessScore >= 70 ? "warning" : "danger";
  const readinessLabel =
    readinessScore >= 85
      ? "Operacao controlada"
      : readinessScore >= 70
        ? "Atencao operacional"
        : "Intervencao necessaria";
  const nextActions = buildNextActions({
    activeCampaign,
    overdueActions,
    pendingDivergences,
    pendingDocuments,
    pendingEmployees,
    pendingSignatures,
  });
  const sectorSummaries = buildSectorSummaries(data.employees, data.psychosocialSignals);
  const summaryCards: SummaryCard[] = [
    {
      accent: "success",
      detail: `${data.activeCompany.units} unidades / ${data.activeCompany.departments} setores`,
      href: "/clientes",
      label: "Base de clientes",
      value: String(contractedPeopleBase),
    },
    {
      accent: pendingDivergences.length > 0 || pendingEmployees.length > 0 ? "warning" : "success",
      detail: `${pendingEmployees.length} cadastro(s) aguardando validacao`,
      href: "/divergencias",
      label: "Pendencias do RH",
      progress: percent(
        Math.max(visiblePeopleBase - pendingEmployees.length - pendingDivergences.length, 0),
        visiblePeopleBase,
      ),
      value: String(pendingDivergences.length + pendingEmployees.length),
    },
    {
      accent:
        activeCampaign !== undefined && isDateOverdue(activeCampaign.endDate)
          ? "danger"
          : "primary",
      detail:
        activeCampaign === undefined
          ? "Sem campanha ativa"
          : `${activeCampaign.responseCount}/${activeCampaign.targetParticipants} respostas`,
      href: "/psicossocial",
      label: "Psicossocial",
      progress: psychosocialRate,
      value: `${psychosocialRate}%`,
    },
    {
      accent: readinessTone,
      detail: readinessLabel,
      label: "Score operacional",
      progress: readinessScore,
      value: `${readinessScore}%`,
    },
  ];

  return (
    <>
      <header className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
            Portal RH Cliente
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">
            {data.activeCompany.tradeName}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {data.activeCompany.cnpj} / CNAE {data.activeCompany.primaryCnae ?? "pendente"} /{" "}
            {data.activeCompany.selectedPackage ?? "pacote pendente"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-md border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700">
            {contractStatusLabels[data.activeCompany.contractStatus ?? "onboarding"]}
          </span>
          <span className="rounded-md border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700">
            Vencimento {dateLabel(data.activeCompany.contractDueDate)}
          </span>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-2 2xl:grid-cols-[repeat(4,minmax(0,1fr))]">
        {summaryCards.map((card) => (
          <SummaryMetric key={card.label} card={card} />
        ))}
      </section>

      <section className="mt-5 grid gap-4 2xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-lg border border-slate-200 bg-white">
          <SectionHeader eyebrow={`${nextActions.length} item(ns)`} title="Proximas acoes do RH" />
          <div className="divide-y divide-slate-100">
            {nextActions.map((action) => (
              <Link
                key={`${action.href}-${action.label}`}
                className="block px-5 py-4 transition hover:bg-slate-50"
                href={action.href}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${actionDotClass(action.tone)}`} />
                  <h3 className="text-sm font-semibold text-slate-950">{action.label}</h3>
                </div>
                <p className="mt-1 text-sm text-slate-600">{action.detail}</p>
              </Link>
            ))}
            {nextActions.length === 0 && (
              <div className="px-5 py-8 text-sm text-slate-500">
                Rotina sob controle. Nenhuma acao critica para o RH neste momento.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white">
          <SectionHeader
            eyebrow={`${sectorSummaries.length} setor(es)`}
            title="Leitura por setor"
          />
          <div className="grid gap-3 p-5 lg:grid-cols-2">
            {sectorSummaries.map((sector) => (
              <article
                key={sector.name}
                className="rounded-md border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-slate-950">{sector.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {sector.activePeople}/{sector.totalPeople} cliente(s) ativo(s)
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                      sector.riskLevel,
                    )}`}
                  >
                    {riskLevelLabels[sector.riskLevel]}
                  </span>
                </div>
                <ProgressBar value={sector.responseRate} />
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{sector.recommendation}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-lg border border-slate-200 bg-white">
          <SectionHeader
            eyebrow={`${pendingDocuments.length} pendencia(s)`}
            title="Documentos essenciais"
          />
          <div className="divide-y divide-slate-100">
            {data.documents.slice(0, 5).map((document) => (
              <Link
                key={document.id}
                className="grid gap-3 px-5 py-4 transition hover:bg-slate-50 md:grid-cols-[minmax(0,1fr)_auto]"
                href="/documentos"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-950">{document.title}</h3>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                        document.status,
                      )}`}
                    >
                      {documentStatusLabels[document.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {document.owner} / versao {document.version}
                  </p>
                </div>
                <span className="text-sm font-medium text-slate-600">
                  {dateLabel(document.dueDate ?? document.publishedAt)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white">
          <SectionHeader eyebrow="Indicadores" title="Conformidade acompanhada" />
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            <Indicator label="Documentos publicados" value={documentReadinessRate} />
            <Indicator label="Planos de acao concluidos" value={actionReadinessRate} />
            <Indicator label="Adesao psicossocial" value={psychosocialRate} />
            <Indicator label="Cadastros ativos" value={registrationRate} />
          </div>
          <div className="border-t border-slate-200 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                  activeCampaign?.status ?? "draft",
                )}`}
              >
                {activeCampaign === undefined
                  ? "Sem campanha ativa"
                  : campaignStatusLabels[activeCampaign.status]}
              </span>
              <span className="text-sm text-slate-600">
                Prazo psicossocial: {dateLabel(activeCampaign?.endDate)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-lg border border-slate-200 bg-white">
          <SectionHeader eyebrow={`${openActions.length} aberta(s)`} title="Pendencias SST" />
          <div className="divide-y divide-slate-100">
            {openActions.slice(0, 4).map((action) => (
              <Link
                key={action.id}
                className="grid gap-3 px-5 py-4 transition hover:bg-slate-50 md:grid-cols-[minmax(0,1fr)_auto]"
                href="/riscos"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-950">{action.title}</h3>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                        action.status,
                      )}`}
                    >
                      {actionStatusLabels[action.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{action.responsible}</p>
                </div>
                <span className="text-sm font-medium text-slate-600">
                  Prazo {dateLabel(action.dueDate)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <EmployeePasswordResetCard companyTradeName={data.activeCompany.tradeName} />
      </section>
    </>
  );
}

function SummaryMetric({ card }: Readonly<{ card: SummaryCard }>) {
  const content = (
    <article className="h-full rounded-lg border border-slate-200 bg-white p-4 transition hover:border-pronus-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{card.label}</p>
          <strong className="mt-2 block text-3xl font-semibold tracking-normal text-slate-950">
            {card.value}
          </strong>
        </div>
        <span className={`mt-1 h-3 w-3 rounded-full ${metricDotClass(card.accent)}`} />
      </div>
      <p className="mt-2 text-sm text-slate-600">{card.detail}</p>
      {card.progress !== undefined && <ProgressBar value={card.progress} />}
    </article>
  );

  if (card.href === undefined) {
    return content;
  }

  return <Link href={card.href}>{content}</Link>;
}

function SectionHeader({ eyebrow, title }: Readonly<{ eyebrow: string; title: string }>) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
        {eyebrow}
      </span>
    </div>
  );
}

function Indicator({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <article className="rounded-md bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <strong className="text-sm font-semibold text-slate-950">{value}%</strong>
      </div>
      <ProgressBar value={value} />
    </article>
  );
}

function ProgressBar({ value }: Readonly<{ value: number }>) {
  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-pronus-primary"
        style={{ width: `${clamp(value, 0, 100)}%` }}
      />
    </div>
  );
}

function buildNextActions({
  activeCampaign,
  overdueActions,
  pendingDivergences,
  pendingDocuments,
  pendingEmployees,
  pendingSignatures,
}: {
  activeCampaign:
    | Awaited<ReturnType<typeof loadClientPortalData>>["psychosocialCampaigns"][number]
    | undefined;
  overdueActions: Awaited<ReturnType<typeof loadClientPortalData>>["riskActions"];
  pendingDivergences: Awaited<ReturnType<typeof loadClientPortalData>>["divergences"];
  pendingDocuments: Awaited<ReturnType<typeof loadClientPortalData>>["documents"];
  pendingEmployees: Awaited<ReturnType<typeof loadClientPortalData>>["employees"];
  pendingSignatures: Awaited<ReturnType<typeof loadClientPortalData>>["signatures"];
}): NextAction[] {
  const actions: NextAction[] = [];

  if (pendingDivergences.length > 0) {
    actions.push({
      detail: `${pendingDivergences.length} alteracao(oes) enviada(s) por colaborador aguardam decisao do RH.`,
      href: "/divergencias",
      label: "Aprovar ou recusar divergencias cadastrais",
      tone: "warning",
    });
  }

  if (pendingEmployees.length > 0) {
    actions.push({
      detail: `${pendingEmployees.length} cadastro(s) ainda nao estao liberados para uso completo do portal.`,
      href: "/clientes",
      label: "Validar cadastros pendentes",
      tone: "warning",
    });
  }

  if (activeCampaign !== undefined && isDateOverdue(activeCampaign.endDate)) {
    actions.push({
      detail: `Campanha venceu em ${dateLabel(activeCampaign.endDate)} com ${activeCampaign.responseRate}% de adesao.`,
      href: "/psicossocial",
      label: "Tratar campanha psicossocial vencida",
      tone: "danger",
    });
  }

  if (overdueActions.length > 0) {
    actions.push({
      detail: `${overdueActions.length} acao(oes) do plano SST passaram do prazo.`,
      href: "/riscos",
      label: "Revisar plano de acao vencido",
      tone: "danger",
    });
  }

  if (pendingDocuments.length > 0) {
    actions.push({
      detail: `${pendingDocuments.length} documento(s) exigem revisao, ciencia ou acompanhamento.`,
      href: "/documentos",
      label: "Acompanhar documentos da empresa",
      tone: "primary",
    });
  }

  if (pendingSignatures.length > 0) {
    actions.push({
      detail: `${pendingSignatures.length} assinatura(s) pendente(s) podem atrasar a conformidade documental.`,
      href: "/documentos",
      label: "Resolver assinaturas pendentes",
      tone: "primary",
    });
  }

  return actions.slice(0, 6);
}

function buildSectorSummaries(
  employees: StructuralEmployee[],
  signals: PsychosocialSectorSignal[],
) {
  const sectorNames = Array.from(new Set(employees.map((employee) => employee.department))).sort();

  return sectorNames.map((name) => {
    const sectorEmployees = employees.filter((employee) => employee.department === name);
    const signal = signals.find((item) => item.sectorName === name);

    return {
      activePeople: sectorEmployees.filter((employee) => employee.registrationStatus === "active")
        .length,
      name,
      recommendation:
        signal?.recommendation ??
        "Sem alerta psicossocial agregado para este setor no momento. Manter rotina de acompanhamento.",
      responseRate: signal?.responseRate ?? 0,
      riskLevel: signal?.riskLevel ?? "low",
      totalPeople: sectorEmployees.length,
    };
  });
}

function isDateOverdue(value: string) {
  const dueDate = new Date(`${value}T00:00:00`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return !Number.isNaN(dueDate.getTime()) && dueDate.getTime() < today.getTime();
}

function percent(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function metricDotClass(accent: SummaryCard["accent"]) {
  if (accent === "success") {
    return "bg-emerald-500";
  }

  if (accent === "warning") {
    return "bg-amber-500";
  }

  if (accent === "danger") {
    return "bg-red-500";
  }

  return "bg-pronus-primary";
}

function actionDotClass(tone: NextAction["tone"]) {
  if (tone === "danger") {
    return "bg-red-500";
  }

  if (tone === "warning") {
    return "bg-amber-500";
  }

  return "bg-pronus-primary";
}
