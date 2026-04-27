import { CompanyModuleNav } from "../company-module-nav";
import { JobPositionManagementPanel } from "../job-position-management-panel";
import { loadStructuralData } from "../../pronus-data";

export const dynamic = "force-dynamic";

export default async function JobPositionsPage() {
  const { companies, departments, jobPositions } = await loadStructuralData();

  return (
    <>
      <header className="mb-6 border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
          Empresas
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-normal">Cargos</h2>
      </header>

      <CompanyModuleNav />

      <JobPositionManagementPanel
        initialCompanies={companies}
        initialDepartments={departments}
        initialJobPositions={jobPositions}
      />
    </>
  );
}
