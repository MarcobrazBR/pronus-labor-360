import { CompanyManagementPanel } from "../company-management-panel";
import { CompanyModuleNav } from "../company-module-nav";
import { ModuleIcon } from "../../module-icons";
import { loadRegulatoryIntelligenceData, loadStructuralData } from "../../pronus-data";

export const dynamic = "force-dynamic";

export default async function CompanySearchPage() {
  const [{ companies, employees }, { cnaes }] = await Promise.all([
    loadStructuralData(),
    loadRegulatoryIntelligenceData(),
  ]);

  return (
    <>
      <header className="mb-6 border-b border-slate-200 pb-5">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-md bg-pronus-primary text-white">
            <ModuleIcon name="companies" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
              Empresas
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal">Busca Empresa</h2>
          </div>
        </div>
      </header>

      <CompanyModuleNav />

      <CompanyManagementPanel
        initialCompanies={companies}
        initialEmployees={employees}
        regulatoryCnaes={cnaes}
      />
    </>
  );
}
