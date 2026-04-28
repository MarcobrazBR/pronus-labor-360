import { loadClientPortalData } from "../client-data";
import { ClientDivergencePanel } from "./client-divergence-panel";

export const dynamic = "force-dynamic";

export default async function ClientDivergencesPage() {
  const data = await loadClientPortalData();
  const pending = data.divergences.filter((item) => item.status === "pending").length;

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
            Divergências
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">Validação cadastral</h2>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
          {pending} pendente(s)
        </div>
      </header>

      <ClientDivergencePanel divergences={data.divergences} />
    </>
  );
}
