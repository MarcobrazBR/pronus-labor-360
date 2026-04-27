const documentQueues = [
  {
    title: "PGR",
    status: "Planejado",
    owner: "SST",
    detail: "Geracao e versionamento a partir do inventario de riscos.",
  },
  {
    title: "Relatorio psicossocial",
    status: "Planejado",
    owner: "Psicologia",
    detail: "Consolidacao tecnica com dados agregados e recomendacoes.",
  },
  {
    title: "Termos e consentimentos",
    status: "Fila",
    owner: "Operacao",
    detail: "Publicacao para colaborador com aceite digital futuro.",
  },
  {
    title: "Evidencias",
    status: "Fila",
    owner: "SST",
    detail: "Anexos vinculados a plano de acao e auditoria.",
  },
];

export default function DocumentsPage() {
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

      <section className="grid gap-4 lg:grid-cols-2">
        {documentQueues.map((item) => (
          <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {item.status}
              </span>
            </div>
            <p className="mt-4 text-xs font-semibold uppercase text-slate-500">{item.owner}</p>
          </article>
        ))}
      </section>
    </>
  );
}
