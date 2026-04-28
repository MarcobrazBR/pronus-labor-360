import { loadDocumentsData } from "../pronus-data";
import { DocumentManagementPanel } from "./document-management-panel";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const { summary, documents, templates, publications, signatures } = await loadDocumentsData();

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
            Gestao documental
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">Documentos</h2>
        </div>
      </header>

      <DocumentManagementPanel
        initialDocuments={documents}
        initialPublications={publications}
        initialSignatures={signatures}
        initialTemplates={templates}
        summary={summary}
      />
    </>
  );
}
