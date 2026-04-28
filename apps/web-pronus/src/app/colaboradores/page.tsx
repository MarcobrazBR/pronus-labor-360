import { CollaboratorsWorkforcePanel } from "./collaborators-workforce-panel";
import { loadStructuralData } from "../pronus-data";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const { jobPositions } = await loadStructuralData();

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
            Pessoas e acesso
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">Colaboradores</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Area para RH das empresas, colaboradores internos PRONUS, permissoes do sistema e agenda
            do corpo clinico.
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
          Governanca de acesso
        </div>
      </header>

      <CollaboratorsWorkforcePanel jobPositions={jobPositions} />
    </>
  );
}
