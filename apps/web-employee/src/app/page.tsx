export default function EmployeeHomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-pronus-background px-6 text-pronus-text">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
          Pronus Labor 360
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Portal Colaborador</h1>
        <p className="mt-3 text-sm text-slate-600">
          Acesso por CPF para primeiro cadastro, termos e questionarios.
        </p>
        <button className="mt-6 w-full rounded-md bg-pronus-primary px-4 py-3 text-sm font-semibold text-white">
          Iniciar acesso
        </button>
      </section>
    </main>
  );
}
