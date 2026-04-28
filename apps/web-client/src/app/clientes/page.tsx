import { loadClientPortalData } from "../client-data";
import { ClientEmployeeSearchPanel } from "./client-employee-search-panel";

export const dynamic = "force-dynamic";

export default async function ClientEmployeesPage() {
  const data = await loadClientPortalData();
  const activeEmployees = data.employees.filter(
    (employee) => employee.registrationStatus === "active",
  );
  const pendingEmployees = data.employees.filter(
    (employee) => employee.registrationStatus === "pending_validation",
  );
  const departments = new Set(data.employees.map((employee) => employee.department));

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
            Clientes
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">Colaboradores vinculados</h2>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
          {data.activeCompany.tradeName}
        </div>
      </header>

      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        <Info label="Ativos" value={String(activeEmployees.length)} />
        <Info label="Pendentes" value={String(pendingEmployees.length)} />
        <Info label="Setores" value={String(departments.size)} />
      </section>

      <ClientEmployeeSearchPanel company={data.activeCompany} employees={data.employees} />
    </>
  );
}

function Info({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <strong className="mt-2 block text-3xl font-semibold tracking-normal">{value}</strong>
    </article>
  );
}
