import { CompanyModuleNav } from "../company-module-nav";
import { DepartmentManagementPanel } from "../department-management-panel";
import { loadStructuralData } from "../../pronus-data";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  const { departments } = await loadStructuralData();

  return (
    <>
      <header className="mb-6 border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
          Empresas
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-normal">Setores</h2>
      </header>

      <CompanyModuleNav />

      <DepartmentManagementPanel initialDepartments={departments} />
    </>
  );
}
