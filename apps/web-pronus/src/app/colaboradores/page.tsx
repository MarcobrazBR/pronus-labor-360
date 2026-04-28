import { CollaboratorsWorkforcePanel } from "./collaborators-workforce-panel";
import { loadStructuralData } from "../pronus-data";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const { jobPositions } = await loadStructuralData();

  return (
    <>
      <header className="mb-6 border-b border-slate-200 pb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
            Pessoas e acesso
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">Colaboradores</h2>
        </div>
      </header>

      <CollaboratorsWorkforcePanel jobPositions={jobPositions} />
    </>
  );
}
