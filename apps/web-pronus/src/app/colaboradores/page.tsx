import { EmployeeImportPanel } from "../employee-import-panel";
import { loadStructuralData, statusClasses, structuralStatusLabels } from "../pronus-data";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const { companies, employees } = await loadStructuralData();

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
            Cadastro estrutural
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">Colaboradores</h2>
        </div>

        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
          {employees.length} registros carregados
        </div>
      </header>

      <EmployeeImportPanel
        companies={companies.map((company) => ({
          id: company.id,
          tradeName: company.tradeName,
          cnpj: company.cnpj,
        }))}
      />

      <section className="mt-4 rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold">Base de colaboradores</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {employees.map((employee) => (
            <article key={employee.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto]">
              <div>
                <h4 className="text-sm font-semibold">{employee.fullName}</h4>
                <p className="mt-1 text-sm text-slate-600">
                  {employee.companyTradeName} / {employee.department} / {employee.jobPosition}
                </p>
              </div>
              <span
                className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                  employee.registrationStatus,
                )}`}
              >
                {structuralStatusLabels[employee.registrationStatus]}
              </span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
