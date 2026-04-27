import { CompanyManagementPanel } from "./company-management-panel";
import { loadStructuralData } from "../pronus-data";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const { companies, units, departments, jobPositions } = await loadStructuralData();

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
            Cadastro estrutural
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">Empresas</h2>
        </div>

        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
          Cadastro base para eSocial S-1000
        </div>
      </header>

      <CompanyManagementPanel initialCompanies={companies} />

      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        <StructureList
          items={units.slice(0, 5).map((unit) => ({
            id: unit.id,
            title: unit.name,
            subtitle: unit.companyTradeName,
            detail: unit.code ?? "Sem codigo",
          }))}
          title="Unidades"
        />
        <StructureList
          items={departments.slice(0, 5).map((department) => ({
            id: department.id,
            title: department.name,
            subtitle: `${department.companyTradeName} / ${department.unitName ?? "Sem unidade"}`,
            detail: department.code ?? "Sem codigo",
          }))}
          title="Setores"
        />
        <StructureList
          items={jobPositions.slice(0, 5).map((jobPosition) => ({
            id: jobPosition.id,
            title: jobPosition.title,
            subtitle: `${jobPosition.companyTradeName} / ${jobPosition.departmentName ?? "Sem setor"}`,
            detail: jobPosition.cboCode ?? "Sem CBO",
          }))}
          title="Cargos"
        />
      </section>
    </>
  );
}

function StructureList({
  items,
  title,
}: Readonly<{
  title: string;
  items: Array<{ id: string; title: string; subtitle: string; detail: string }>;
}>) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <article key={item.id} className="px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold">{item.title}</h4>
                <p className="mt-1 text-sm text-slate-600">{item.subtitle}</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">{item.detail}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
