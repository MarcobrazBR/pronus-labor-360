import {
  dateLabel,
  documentStatusLabels,
  loadClientPortalData,
  statusClasses,
} from "../client-data";

export const dynamic = "force-dynamic";

export default async function ClientDocumentsPage() {
  const data = await loadClientPortalData();

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
            Documentos
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">Publicações e assinaturas</h2>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
          {data.documents.length} documento(s)
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white">
          <PanelTitle title="Documentos da empresa" />
          <div className="divide-y divide-slate-100">
            {data.documents.map((document) => (
              <article key={document.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">{document.title}</h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                      document.status,
                    )}`}
                  >
                    {documentStatusLabels[document.status]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {document.owner} / versão {document.version}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Vencimento/publicação: {dateLabel(document.dueDate ?? document.publishedAt)}
                </p>
              </article>
            ))}
            {data.documents.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-slate-500">
                Nenhum documento publicado.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white">
          <PanelTitle title="Assinaturas solicitadas" />
          <div className="divide-y divide-slate-100">
            {data.signatures.map((signature) => (
              <article key={signature.id} className="px-5 py-4">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                    signature.status,
                  )}`}
                >
                  {signature.status === "pending" ? "Pendente" : "Concluída"}
                </span>
                <h3 className="mt-2 text-sm font-semibold">{signature.title}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {signature.signerName} / {signature.signerRole}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Prazo {dateLabel(signature.expiresAt)}
                </p>
              </article>
            ))}
            {data.signatures.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-slate-500">
                Nenhuma assinatura pendente.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function PanelTitle({ title }: Readonly<{ title: string }>) {
  return (
    <div className="border-b border-slate-200 px-5 py-4">
      <h3 className="text-base font-semibold">{title}</h3>
    </div>
  );
}
