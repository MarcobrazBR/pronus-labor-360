import {
  actionStatusLabels,
  campaignStatusLabels,
  contractStatusLabels,
  dateLabel,
  documentStatusLabels,
  loadClientPortalData,
  riskLevelLabels,
  statusClasses,
} from "./client-data";
import { EmployeePasswordResetCard } from "./employee-password-reset-card";

export const dynamic = "force-dynamic";

type SummaryCard = {
  detail: string;
  label: string;
  secondaryDetail?: string;
  secondaryDetailClassName?: string;
  value: string;
};

export default async function ClientHomePage() {
  const data = await loadClientPortalData();
  const pendingDivergences = data.divergences.filter((item) => item.status === "pending");
  const openActions = data.riskActions.filter(
    (item) => item.status === "open" || item.status === "in_progress" || item.status === "overdue",
  );
  const pendingDocuments = data.documents.filter(
    (item) => item.status === "draft" || item.status === "in_review" || item.status === "expired",
  );
  const activeCampaign = data.psychosocialCampaigns[0];
  const psychosocialBase = Math.max(data.activeCompany.employees, data.employees.length);
  const psychosocialRate =
    activeCampaign === undefined || psychosocialBase === 0
      ? 0
      : Math.round((activeCampaign.responseCount / psychosocialBase) * 100);
  const psychosocialDeadline = activeCampaign?.endDate;
  const isPsychosocialDeadlineOverdue =
    psychosocialDeadline !== undefined && isDateOverdue(psychosocialDeadline);
  const summaryCards: SummaryCard[] = [
    {
      detail: `${data.activeCompany.units} unidades / ${data.activeCompany.departments} setores`,
      label: "Clientes ativos",
      value: String(
        data.employees.filter((employee) => employee.registrationStatus === "active").length,
      ),
    },
    {
      detail: "Ajustes enviados pelo colaborador",
      label: "Divergências",
      value: String(pendingDivergences.length),
    },
    {
      detail: "Planos de ação e documentos",
      label: "Pendências SST",
      value: String(openActions.length + pendingDocuments.length),
    },
    {
      detail: activeCampaign === undefined ? "Sem campanha ativa" : `${psychosocialRate}% adesao`,
      label: "Psicossocial",
      secondaryDetail:
        psychosocialDeadline === undefined ? undefined : dateLabel(psychosocialDeadline),
      secondaryDetailClassName: isPsychosocialDeadlineOverdue
        ? "font-bold italic text-red-700"
        : "font-medium text-sky-700",
      value: activeCampaign === undefined ? "0" : String(activeCampaign.responseCount),
    },
  ];

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
            Portal RH Cliente
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">
            {data.activeCompany.tradeName}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {data.activeCompany.cnpj} / CNAE {data.activeCompany.primaryCnae ?? "pendente"}
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
          {contractStatusLabels[data.activeCompany.contractStatus ?? "onboarding"]}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => (
          <article key={card.label} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <strong className="mt-2 block text-3xl font-semibold tracking-normal">
              {card.value}
            </strong>
            {card.secondaryDetail === undefined ? (
              <span className="mt-2 block text-sm text-slate-600">{card.detail}</span>
            ) : (
              <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-600">{card.detail}</span>
                <span className={card.secondaryDetailClassName}>{card.secondaryDetail}</span>
              </div>
            )}
          </article>
        ))}
        <EmployeePasswordResetCard companyTradeName={data.activeCompany.tradeName} />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-slate-200 bg-white">
          <PanelTitle title="Pendências prioritárias" />
          <div className="divide-y divide-slate-100">
            {pendingDivergences.slice(0, 2).map((divergence) => (
              <article key={divergence.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">{divergence.fullName}</h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                      divergence.status,
                    )}`}
                  >
                    Divergência cadastral
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {divergence.cpf} / {dateLabel(divergence.createdAt)}
                </p>
              </article>
            ))}

            {openActions.slice(0, 3).map((action) => (
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
              </article>
            ))}

            {pendingDivergences.length === 0 && openActions.length === 0 && (
              <div className="px-5 py-8 text-sm text-slate-500">Nenhuma pendência crítica.</div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white">
          <PanelTitle title="Conformidade em acompanhamento" />
          <div className="grid gap-3 p-5 md:grid-cols-2">
            {data.risks.slice(0, 4).map((risk) => (
              <article key={risk.id} className="rounded-md bg-slate-100 px-3 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                      risk.level,
                    )}`}
                  >
                    {riskLevelLabels[risk.level]}
                  </span>
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    {risk.departmentName}
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-semibold">{risk.danger}</h3>
                <p className="mt-1 text-sm text-slate-600">{risk.risk}</p>
              </article>
            ))}
            {pendingDocuments.slice(0, 2).map((document) => (
              <article key={document.id} className="rounded-md bg-slate-100 px-3 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                    document.status,
                  )}`}
                >
                  {documentStatusLabels[document.status]}
                </span>
                <h3 className="mt-2 text-sm font-semibold">{document.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{document.owner}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white">
        <PanelTitle title="Campanhas e comunicação" />
        <div className="grid gap-4 p-5 xl:grid-cols-3">
          {data.psychosocialCampaigns.map((campaign) => (
            <article key={campaign.id} className="rounded-md bg-slate-100 px-3 py-3">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                  campaign.status,
                )}`}
              >
                {campaignStatusLabels[campaign.status]}
              </span>
              <h3 className="mt-2 text-sm font-semibold">{campaign.name}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {campaign.responseCount}/{campaign.targetParticipants} respostas
              </p>
            </article>
          ))}
          {data.signatures.map((signature) => (
            <article key={signature.id} className="rounded-md bg-slate-100 px-3 py-3">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                  signature.status,
                )}`}
              >
                {signature.status === "pending" ? "Assinatura pendente" : "Assinatura registrada"}
              </span>
              <h3 className="mt-2 text-sm font-semibold">{signature.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{signature.signerName}</p>
            </article>
          ))}
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

function isDateOverdue(value: string) {
  const dueDate = new Date(`${value}T00:00:00`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return !Number.isNaN(dueDate.getTime()) && dueDate.getTime() < today.getTime();
}
