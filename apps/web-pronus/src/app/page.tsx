import Link from "next/link";
import { ModuleIcon } from "./module-icons";
import {
  actionStatusClasses,
  loadClientPasswordResetRequests,
  loadNr01Data,
  loadPsychosocialData,
  loadStructuralData,
  nr01ActionStatusLabels,
} from "./pronus-data";

export const dynamic = "force-dynamic";

const consultationSeries = [
  { day: "01", total: 6 },
  { day: "02", total: 8 },
  { day: "03", total: 5 },
  { day: "04", total: 10 },
  { day: "05", total: 12 },
  { day: "06", total: 7 },
  { day: "07", total: 13 },
  { day: "08", total: 9 },
  { day: "09", total: 11 },
];

const financialSnapshot = {
  open: 38500,
  received: 184200,
};

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { currency: "BRL", style: "currency" }).format(value);
}

export default async function PronusDashboardPage() {
  const [structural, nr01, psychosocial, clientResetRequests] = await Promise.all([
    loadStructuralData(),
    loadNr01Data(),
    loadPsychosocialData(),
    loadClientPasswordResetRequests(),
  ]);
  const activeCompanies = structural.companies.filter(
    (company) => company.status === "active" && company.contractStatus !== "closed",
  );
  const activeClients = structural.employees.filter(
    (employee) => employee.registrationStatus === "active",
  );
  const pendingEmployees = structural.employees.filter(
    (employee) => employee.registrationStatus === "pending_validation",
  );
  const pendingClientResetRequests = clientResetRequests.filter(
    (request) => request.status === "pending",
  );
  const openActions = nr01.actions.filter(
    (action) => action.status === "open" || action.status === "in_progress",
  );
  const overdueActions = nr01.actions.filter((action) => action.status === "overdue");
  const maxConsultations = Math.max(...consultationSeries.map((item) => item.total), 1);
  const scheduledThisMonth = consultationSeries.reduce((sum, item) => sum + item.total, 0);
  const openConsultations = 18;
  const activeHealthProfessionals = 5;
  const financialTotal = financialSnapshot.received + financialSnapshot.open;
  const delinquency = financialTotal === 0 ? 0 : (financialSnapshot.open / financialTotal) * 100;
  const receivedPercent =
    financialTotal === 0 ? 0 : (financialSnapshot.received / financialTotal) * 100;

  const kpis = [
    { label: "Empresas ativas", value: String(activeCompanies.length) },
    { label: "Clientes ativos", value: String(activeClients.length) },
    { label: "Profissionais ativos", value: String(activeHealthProfessionals) },
    { label: "Consultas no mes", value: String(scheduledThisMonth) },
    { label: "Consultas em aberto", value: String(openConsultations) },
  ];

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-md bg-pronus-primary text-white">
            <ModuleIcon name="dashboard" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
              Operacao PRONUS
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal">Painel executivo</h2>
          </div>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((card) => (
          <article key={card.label} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <strong className="mt-2 block text-3xl font-semibold tracking-normal">
              {card.value}
            </strong>
          </article>
        ))}
      </section>

      <section className="mt-5 grid gap-5 2xl:grid-cols-[1.35fr_0.75fr_0.9fr]">
        <article className="rounded-lg border border-slate-200 bg-white">
          <PanelTitle title="Consultas realizadas por dia" detail="Mes atual" />
          <div className="flex h-72 items-end gap-3 p-5">
            {consultationSeries.map((item) => (
              <div key={item.day} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex h-56 w-full items-end rounded-md bg-slate-100">
                  <div
                    className="w-full rounded-md bg-pronus-primary"
                    style={{ height: `${(item.total / maxConsultations) * 100}%` }}
                    title={`${item.total} consultas`}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-500">{item.day}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white">
          <PanelTitle title="Financeiro" detail="Recebido x em aberto" />
          <div className="flex flex-col items-center gap-5 p-5">
            <div
              className="relative flex h-52 w-52 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#1d3557 0 ${receivedPercent}%, #e11d48 ${receivedPercent}% 100%)`,
              }}
            >
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Inadimplencia
                </span>
                <strong className="mt-1 text-2xl font-semibold text-slate-950">
                  {delinquency.toFixed(1)}%
                </strong>
              </div>
            </div>
            <div className="grid w-full gap-2">
              <MiniLegend label="Recebido" value={money(financialSnapshot.received)} tone="navy" />
              <MiniLegend label="Em aberto" value={money(financialSnapshot.open)} tone="red" />
            </div>
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white">
          <PanelTitle title="Pendencias" detail="Acoes que exigem decisao" />
          <div className="divide-y divide-slate-100">
            {overdueActions.slice(0, 3).map((action) => (
              <PendingRow
                key={action.id}
                href="/nr01-pgr?tab=actions"
                label={action.title}
                meta={`${action.companyTradeName} / ${action.responsible}`}
                status={nr01ActionStatusLabels[action.status]}
                statusClass={actionStatusClasses(action.status)}
              />
            ))}
            {openActions.slice(0, 2).map((action) => (
              <PendingRow
                key={action.id}
                href="/nr01-pgr?tab=actions"
                label={action.title}
                meta={`${action.companyTradeName} / ${action.responsible}`}
                status={nr01ActionStatusLabels[action.status]}
                statusClass={actionStatusClasses(action.status)}
              />
            ))}
            {pendingEmployees.slice(0, 2).map((employee) => (
              <PendingRow
                key={employee.id}
                href="/empresas/clientes"
                label={employee.fullName}
                meta={`${employee.companyTradeName} / cadastro pendente`}
                status="Cadastro"
                statusClass="bg-amber-50 text-amber-700 ring-1 ring-amber-200"
              />
            ))}
            {pendingClientResetRequests.slice(0, 2).map((request) => (
              <PendingRow
                key={request.id}
                href={`/empresas/busca?company=${encodeURIComponent(
                  request.companyTradeName,
                )}&reset=client-access`}
                label={request.companyTradeName}
                meta="Reset de acesso RH solicitado"
                status="Senha"
                statusClass="bg-red-50 text-red-700 ring-1 ring-red-200"
              />
            ))}
            {psychosocial.summary.pendingInterviews > 0 && (
              <PendingRow
                href="/nr01-pgr?tab=psychosocial"
                label="Entrevistas psicossociais pendentes"
                meta={`${psychosocial.summary.pendingInterviews} encaminhamentos aguardando acolhimento`}
                status="Psicossocial"
                statusClass="bg-sky-50 text-sky-700 ring-1 ring-sky-200"
              />
            )}
          </div>
        </article>
      </section>
    </>
  );
}

function PanelTitle({ detail, title }: Readonly<{ detail: string; title: string }>) {
  return (
    <div className="border-b border-slate-200 px-5 py-4">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 text-xs font-medium uppercase text-slate-500">{detail}</p>
    </div>
  );
}

function MiniLegend({
  label,
  tone,
  value,
}: Readonly<{ label: string; tone: "navy" | "red"; value: string }>) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <span
          className={`h-2.5 w-2.5 rounded-full ${tone === "navy" ? "bg-pronus-primary" : "bg-rose-600"}`}
        />
        {label}
      </span>
      <strong className="text-sm font-semibold text-slate-950">{value}</strong>
    </div>
  );
}

function PendingRow({
  href,
  label,
  meta,
  status,
  statusClass,
}: Readonly<{
  href: string;
  label: string;
  meta: string;
  status: string;
  statusClass: string;
}>) {
  return (
    <Link className="grid gap-3 px-5 py-4 transition hover:bg-slate-50" href={href}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-950">{label}</h4>
          <p className="mt-1 text-sm text-slate-600">{meta}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
          {status}
        </span>
      </div>
    </Link>
  );
}
