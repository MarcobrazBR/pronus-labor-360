import { loadStructuralData, statusClasses, structuralStatusLabels } from "../pronus-data";

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

        <button className="w-fit rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white shadow-sm">
          Nova empresa
        </button>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold">Empresas e CNPJs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Empresa</th>
                <th className="px-5 py-3 font-semibold">Estrutura</th>
                <th className="px-5 py-3 font-semibold">Colaboradores</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((company) => (
                <tr key={company.id}>
                  <td className="px-5 py-4">
                    <strong className="block font-semibold">{company.tradeName}</strong>
                    <span className="text-slate-500">{company.cnpj}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {company.units} unidades / {company.departments} setores
                  </td>
                  <td className="px-5 py-4 font-semibold">{company.employees}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                        company.status,
                      )}`}
                    >
                      {structuralStatusLabels[company.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

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
