import Link from "next/link";
import { CompanyModuleNav } from "./company-module-nav";
import {
  companyContractStatusLabels,
  contractStatusClasses,
  loadStructuralData,
} from "../pronus-data";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const { companies, employees } = await loadStructuralData();
  const companiesToAdjust = companies.filter(
    (company) =>
      company.status === "pending_validation" ||
      company.status === "blocked" ||
      company.contractStatus === "onboarding",
  );
  const employeePendingAdjustments = employees.filter(
    (employee) =>
      employee.registrationStatus === "pending_validation" ||
      employee.registrationStatus === "blocked",
  ).length;

  return (
    <>
      <header className="mb-6 border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
          Cadastro estrutural
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-normal">Empresas</h2>
      </header>

      <CompanyModuleNav />

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <article className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Empresas com ajustes pendentes</p>
          <strong className="mt-3 block text-5xl font-semibold tracking-normal">
            {companiesToAdjust.length}
          </strong>
          <p className="mt-3 text-sm text-slate-600">
            Pendencias geradas por implantacao, alteracoes de RH ou validacoes cadastrais.
          </p>
          <Link
            className="mt-5 inline-flex rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white"
            href="/empresas/busca"
          >
            Buscar empresas
          </Link>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-base font-semibold">Fila de atencao</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {companiesToAdjust.length === 0 ? (
              <div className="px-5 py-8 text-sm text-slate-500">
                Nao ha empresas aguardando ajuste neste momento.
              </div>
            ) : (
              companiesToAdjust.slice(0, 5).map((company) => {
                const contractStatus = company.contractStatus ?? "onboarding";

                return (
                  <article
                    key={company.id}
                    className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <h4 className="text-sm font-semibold">{company.tradeName}</h4>
                      <p className="mt-1 text-sm text-slate-600">
                        {company.legalName ?? company.cnpj}
                      </p>
                    </div>
                    <span
                      className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${contractStatusClasses(
                        contractStatus,
                      )}`}
                    >
                      {companyContractStatusLabels[contractStatus]}
                    </span>
                  </article>
                );
              })
            )}
          </div>
        </article>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-3">
        <Metric label="Alteracoes de colaboradores" value={employeePendingAdjustments} />
        <Metric label="Empresas cadastradas" value={companies.length} />
        <Metric
          label="Contratos ativos"
          value={companies.filter((company) => company.contractStatus === "active").length}
        />
      </section>
    </>
  );
}

function Metric({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <strong className="mt-2 block text-3xl font-semibold tracking-normal">{value}</strong>
    </article>
  );
}
