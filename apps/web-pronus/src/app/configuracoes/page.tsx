import { loadRegulatoryIntelligenceData, loadStructuralData } from "../pronus-data";
import { ConfigurationPanel } from "./configuration-panel";

export const dynamic = "force-dynamic";

export default async function ConfigurationPage() {
  const [structural, regulatory] = await Promise.all([
    loadStructuralData(),
    loadRegulatoryIntelligenceData(),
  ]);

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
            Configurações
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">
            Base regulatória e operacional
          </h2>
        </div>

        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
          Motor SST parametrizável
        </div>
      </header>

      <ConfigurationPanel
        initialCnaes={regulatory.cnaes}
        initialObligations={regulatory.obligations}
        initialRiskDegrees={regulatory.riskDegrees}
        structural={structural}
      />
    </>
  );
}
