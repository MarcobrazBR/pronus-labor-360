import { EmployeeImportPanel } from "../../employee-import-panel";
import { CompanyModuleNav } from "../company-module-nav";
import { ModuleIcon } from "../../module-icons";
import { loadStructuralData } from "../../pronus-data";
import { CompanyClientsPanel } from "./company-clients-panel";

export const dynamic = "force-dynamic";

export default async function CompanyClientsPage() {
  const {
    companies,
    departments,
    employees,
    employeeMovements,
    jobPositions,
    structuralAuditEvents,
    structuralNotifications,
  } =
    await loadStructuralData();

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
            <h2 className="mt-1 text-2xl font-semibold tracking-normal">Clientes</h2>
          </div>
        </div>
      </header>

      <CompanyModuleNav />

      <EmployeeImportPanel
        title="Importacao de clientes"
        companies={companies.map((company) => ({
          id: company.id,
          tradeName: company.tradeName,
          cnpj: company.cnpj,
        }))}
      />

      <CompanyClientsPanel
        companies={companies}
        departments={departments}
        employees={employees}
        jobPositions={jobPositions}
        movements={employeeMovements}
        auditEvents={structuralAuditEvents}
        notifications={structuralNotifications}
      />
    </>
  );
}
