import { ModuleIcon } from "../module-icons";

type ProfessionalPayment = {
  appointmentValue: number;
  finalizedConsultations: number;
  pendingFinalization: number;
  professionalName: string;
  specialty: string;
};

const professionalPayments: ProfessionalPayment[] = [
  {
    appointmentValue: 72,
    finalizedConsultations: 18,
    pendingFinalization: 3,
    professionalName: "Carlos Henrique Nunes",
    specialty: "Clinico Geral",
  },
  {
    appointmentValue: 90,
    finalizedConsultations: 14,
    pendingFinalization: 2,
    professionalName: "Larissa Moreira",
    specialty: "Acolhimento Psicologico",
  },
  {
    appointmentValue: 84,
    finalizedConsultations: 9,
    pendingFinalization: 1,
    professionalName: "Marina Duarte",
    specialty: "Atendimento Nutricional",
  },
];

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  style: "currency",
});

function amountToPay(payment: ProfessionalPayment) {
  return payment.finalizedConsultations * payment.appointmentValue;
}

export default function FinanceiroPage() {
  return (
    <section className="space-y-5">
      <header className="rounded-lg border border-white/70 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-pronus-primary text-white">
              <ModuleIcon className="h-5 w-5" name="finance" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-pronus-primary">
                Financeiro
              </p>
              <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
                Pagamento dos profissionais
              </h1>
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
            Competencia Maio/2026
          </div>
        </div>
      </header>

      <article className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 pt-4">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Financeiro">
            <button
              className="rounded-t-md border border-b-white border-pronus-primary bg-white px-4 py-2 text-sm font-semibold text-pronus-primary"
              type="button"
            >
              Pagamento dos profissionais
            </button>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Consultas finalizadas no mes</h2>
              <p className="mt-1 text-sm text-slate-500">
                A consulta entra no pagamento apenas quando o profissional finaliza a anamnese.
              </p>
            </div>
            <label className="text-xs font-semibold uppercase text-slate-500">
              Profissional
              <input
                className="mt-2 w-full min-w-72 rounded-md border border-slate-300 px-3 py-2 text-sm font-normal normal-case text-slate-900 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
                placeholder="Pesquisar por nome"
                type="search"
              />
            </label>
          </div>

          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Profissional</th>
                  <th className="px-4 py-3">Especialidade</th>
                  <th className="px-4 py-3 text-center">Finalizadas</th>
                  <th className="px-4 py-3 text-center">Aguardando finalizacao</th>
                  <th className="px-4 py-3 text-right">Valor tabela</th>
                  <th className="px-4 py-3 text-right">Valor a pagar</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {professionalPayments.map((payment) => (
                  <tr key={payment.professionalName} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-950">
                      {payment.professionalName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{payment.specialty}</td>
                    <td className="px-4 py-3 text-center font-semibold text-emerald-700">
                      {payment.finalizedConsultations}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-red-700">
                      {payment.pendingFinalization}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {currencyFormatter.format(payment.appointmentValue)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-950">
                      {currencyFormatter.format(amountToPay(payment))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                          payment.pendingFinalization > 0
                            ? "bg-amber-50 text-amber-800"
                            : "bg-emerald-50 text-emerald-800"
                        }`}
                      >
                        {payment.pendingFinalization > 0 ? "Pendencia clinica" : "Pronto para pagar"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </article>
    </section>
  );
}
