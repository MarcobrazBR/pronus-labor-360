import { CompanyManagementPanel } from "../company-management-panel";
import { CompanyModuleNav } from "../company-module-nav";
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
        <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
          Empresas
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-normal">Busca Empresa</h2>
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
