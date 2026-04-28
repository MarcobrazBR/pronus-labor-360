import { loadNr01Data } from "../pronus-data";
import { OccupationalRiskPanel } from "./occupational-risk-panel";

export const dynamic = "force-dynamic";

export default async function Nr01PgrPage() {
  const { risks, actions, evidences, documents } = await loadNr01Data();

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
            SST e conformidade
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">Risco Ocupacional</h2>
        </div>
      </header>

      <OccupationalRiskPanel
        initialActions={actions}
        initialDocuments={documents}
        initialEvidences={evidences}
        initialRisks={risks}
      />
    </>
  );
}
