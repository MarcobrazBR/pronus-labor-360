const indicators = [
  { label: "Colaboradores ativos", value: "0" },
  { label: "Risco geral", value: "Baixo" },
  { label: "Documentos", value: "0" },
];

export default function ClientHomePage() {
  return (
    <main className="min-h-screen bg-pronus-background px-6 py-6 text-pronus-text">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
          Pronus Labor 360
        </p>
        <h1 className="text-2xl font-semibold">Portal RH Cliente</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {indicators.map((indicator) => (
          <article key={indicator.label} className="rounded-lg bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">{indicator.label}</p>
            <strong className="mt-2 block text-2xl">{indicator.value}</strong>
          </article>
        ))}
      </section>
    </main>
  );
}
