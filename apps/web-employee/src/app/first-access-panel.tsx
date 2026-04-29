"use client";

import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { PsychosocialQuestionnairePanel } from "./psychosocial-questionnaire-panel";

type StructuralStatus = "active" | "pending_validation" | "blocked" | "inactive";
type AppointmentStatus = "scheduled" | "completed";

interface EmployeeAccessProfile {
  employeeId: string;
  companyTradeName: string;
  fullName: string;
  cpf: string;
  department: string;
  jobPosition: string;
  email?: string;
  phone?: string;
  registrationStatus: StructuralStatus;
}

interface DivergenceResult {
  id: string;
  status: "pending" | "approved" | "rejected";
  changes: Array<{
    field: string;
    currentValue: string;
    submittedValue: string;
  }>;
}

interface SpecialtyCoverage {
  companyTradeName: string;
  specialty: string;
  entitled: number;
  used: number;
}

interface Appointment {
  id: string;
  employeeId: string;
  specialty: string;
  dateTime: string;
  status: AppointmentStatus;
}

const statusLabels: Record<StructuralStatus, string> = {
  active: "Ativo",
  pending_validation: "Validacao pendente",
  blocked: "Bloqueado para conferencia",
  inactive: "Inativo",
};

const coverageSeed: SpecialtyCoverage[] = [
  {
    companyTradeName: "Industria Horizonte",
    entitled: 120,
    specialty: "Medicina ocupacional",
    used: 68,
  },
  { companyTradeName: "Industria Horizonte", entitled: 40, specialty: "Psicologia", used: 19 },
  { companyTradeName: "Industria Horizonte", entitled: 25, specialty: "Fonoaudiologia", used: 7 },
  { companyTradeName: "Rede Norte", entitled: 160, specialty: "Medicina ocupacional", used: 82 },
  { companyTradeName: "Rede Norte", entitled: 60, specialty: "Psicologia", used: 24 },
];

const appointmentSeed: Appointment[] = [
  {
    dateTime: "2026-04-12T10:00:00-03:00",
    employeeId: "employee-002",
    id: "appointment-psicologia-abril",
    specialty: "Psicologia",
    status: "completed",
  },
  {
    dateTime: "2026-05-02T09:00:00-03:00",
    employeeId: "employee-002",
    id: "appointment-medicina-maio",
    specialty: "Medicina ocupacional",
    status: "scheduled",
  },
];

const slotSeed = [
  {
    dateTime: "2026-04-30T09:30:00-03:00",
    id: "slot-ocupacional-01",
    specialty: "Medicina ocupacional",
  },
  {
    dateTime: "2026-04-30T14:00:00-03:00",
    id: "slot-ocupacional-02",
    specialty: "Medicina ocupacional",
  },
  { dateTime: "2026-05-03T08:30:00-03:00", id: "slot-psicologia-01", specialty: "Psicologia" },
  { dateTime: "2026-05-03T10:00:00-03:00", id: "slot-fono-01", specialty: "Fonoaudiologia" },
  { dateTime: "2026-05-04T15:30:00-03:00", id: "slot-fono-02", specialty: "Fonoaudiologia" },
];

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
}

function monthKey(value: string) {
  const date = new Date(value);

  return `${date.getFullYear()}-${date.getMonth()}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function hasCompletedSpecialtyInCurrentMonth(
  appointments: Appointment[],
  employeeId: string,
  specialty: string,
) {
  const currentMonth = monthKey(new Date().toISOString());

  return appointments.some(
    (appointment) =>
      appointment.employeeId === employeeId &&
      appointment.specialty === specialty &&
      appointment.status === "completed" &&
      monthKey(appointment.dateTime) === currentMonth,
  );
}

function nextScheduledAppointment(appointments: Appointment[], employeeId: string) {
  const now = Date.now();

  return appointments
    .filter(
      (appointment) =>
        appointment.employeeId === employeeId &&
        appointment.status === "scheduled" &&
        new Date(appointment.dateTime).getTime() >= now - 90 * 60 * 1000,
    )
    .sort(
      (first, second) => new Date(first.dateTime).getTime() - new Date(second.dateTime).getTime(),
    )[0];
}

function canEnterConsultation(appointment: Appointment | undefined) {
  if (appointment === undefined) {
    return false;
  }

  const now = Date.now();
  const startAt = new Date(appointment.dateTime).getTime();

  return now >= startAt - 60 * 60 * 1000 && now <= startAt + 90 * 60 * 1000;
}

export function FirstAccessPanel() {
  const [cpf, setCpf] = useState("98765432100");
  const [profile, setProfile] = useState<EmployeeAccessProfile | null>(null);
  const [form, setForm] = useState({
    department: "",
    email: "",
    jobPosition: "",
    phone: "",
  });
  const [appointments, setAppointments] = useState<Appointment[]>(appointmentSeed);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [scheduleNotice, setScheduleNotice] = useState<string | null>(null);
  const [result, setResult] = useState<DivergenceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const companyCoverages = useMemo(
    () =>
      profile === null
        ? []
        : coverageSeed.filter((coverage) => coverage.companyTradeName === profile.companyTradeName),
    [profile],
  );
  const nextAppointment = useMemo(
    () =>
      profile === null ? undefined : nextScheduledAppointment(appointments, profile.employeeId),
    [appointments, profile],
  );
  const canEnterNextAppointment = canEnterConsultation(nextAppointment);

  async function lookupCpf() {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSelectedSpecialty(null);
    setScheduleNotice(null);

    try {
      const response = await fetch(`${getApiUrl()}/employee-access/lookup`, {
        body: JSON.stringify({ cpf }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as EmployeeAccessProfile | { message?: string };

      if (!response.ok) {
        setProfile(null);
        setError("message" in payload && payload.message ? payload.message : "CPF nao localizado");
        return;
      }

      const employeeProfile = payload as EmployeeAccessProfile;
      setProfile(employeeProfile);
      setForm({
        department: employeeProfile.department,
        email: employeeProfile.email ?? "",
        jobPosition: employeeProfile.jobPosition,
        phone: employeeProfile.phone ?? "",
      });
    } catch {
      setError("Nao foi possivel conectar a API local.");
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function submitDivergence() {
    if (profile === null) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${getApiUrl()}/employee-access/divergences`, {
        body: JSON.stringify({
          employeeId: profile.employeeId,
          submittedData: form,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as DivergenceResult | { message?: string };

      if (!response.ok) {
        setError(
          "message" in payload && payload.message
            ? payload.message
            : "Nao foi possivel enviar divergencia",
        );
        return;
      }

      setResult(payload as DivergenceResult);
    } catch {
      setError("Nao foi possivel conectar a API local.");
    } finally {
      setIsLoading(false);
    }
  }

  function openSpecialtyAgenda(coverage: SpecialtyCoverage) {
    if (profile === null) {
      return;
    }

    if (hasCompletedSpecialtyInCurrentMonth(appointments, profile.employeeId, coverage.specialty)) {
      setSelectedSpecialty(null);
      setScheduleNotice(
        `No momento nao ha vagas disponiveis para ${coverage.specialty}. Ja existe consulta desta especialidade no mes atual.`,
      );
      return;
    }

    setSelectedSpecialty(coverage.specialty);
    setScheduleNotice(null);
  }

  function scheduleSlot(slotId: string) {
    if (profile === null || selectedSpecialty === null) {
      return;
    }

    const slot = slotSeed.find((item) => item.id === slotId);

    if (slot === undefined) {
      return;
    }

    setAppointments((current) => [
      ...current,
      {
        dateTime: slot.dateTime,
        employeeId: profile.employeeId,
        id: `appointment-${profile.employeeId}-${slot.id}`,
        specialty: selectedSpecialty,
        status: "scheduled",
      },
    ]);
    setSelectedSpecialty(null);
    setScheduleNotice(
      "Consulta agendada. A PRONUS fara a distribuicao automatica do profissional.",
    );
  }

  function enterConsultation() {
    if (!canEnterNextAppointment) {
      setScheduleNotice(
        "A sala de video abre somente a partir de uma hora antes do horario agendado.",
      );
      return;
    }

    setIsVideoOpen(true);
  }

  const consultationTooltip =
    nextAppointment === undefined
      ? "O botao fica ativo quando existir consulta agendada e somente uma hora antes do horario."
      : canEnterNextAppointment
        ? "Consulta liberada. Clique para entrar na sala de video."
        : "A sala de video abre uma hora antes do horario agendado.";

  return (
    <section className="w-full max-w-7xl rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5 lg:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <img alt="Pronus Labor" className="h-16 w-auto" src="/brand/pronus-logo.png" />
            <p className="mt-4 text-xs font-semibold uppercase text-pronus-primary">
              Portal Colaborador
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">
              Jornada digital de saude ocupacional
            </h1>
          </div>

          <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 lg:max-w-md">
            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">CPF</span>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
                inputMode="numeric"
                placeholder="Digite somente numeros"
                value={cpf}
                onChange={(event) => setCpf(event.target.value)}
              />
            </label>
            <button
              className="mt-3 w-full rounded-md bg-pronus-primary px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              type="button"
              onClick={() => void lookupCpf()}
            >
              Consultar cadastro
            </button>
          </div>
        </div>

        {error !== null && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
      </div>

      {profile === null ? (
        <div className="px-5 py-12 text-center text-sm text-slate-500">
          Informe o CPF para carregar seu cadastro, consultar coberturas e acompanhar proximas
          consultas.
        </div>
      ) : (
        <div className="grid gap-5 p-5 xl:grid-cols-[0.85fr_1.15fr] lg:p-6">
          <div className="space-y-5">
            <PsychosocialQuestionnairePanel profile={profile} />
            <ProfileCard profile={profile} />
            <RegistrationCheck
              form={form}
              isLoading={isLoading}
              result={result}
              setForm={setForm}
              submitDivergence={() => void submitDivergence()}
            />
          </div>

          <div className="space-y-5">
            <section className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-4 py-4">
                <h2 className="text-base font-semibold text-slate-950">Consultas</h2>
              </div>

              <div className="grid gap-4 p-4 lg:grid-cols-[1fr_0.95fr]">
                <div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {companyCoverages.map((coverage) => {
                      const blockedByMonth = hasCompletedSpecialtyInCurrentMonth(
                        appointments,
                        profile.employeeId,
                        coverage.specialty,
                      );
                      const remaining = Math.max(coverage.entitled - coverage.used, 0);

                      return (
                        <button
                          key={coverage.specialty}
                          className={`rounded-md border p-3 text-left transition ${
                            selectedSpecialty === coverage.specialty
                              ? "border-pronus-primary bg-sky-50"
                              : "border-slate-200 bg-slate-50 hover:border-pronus-primary"
                          }`}
                          type="button"
                          onClick={() => openSpecialtyAgenda(coverage)}
                        >
                          <span className="block text-sm font-semibold text-slate-950">
                            {coverage.specialty}
                          </span>
                          <span className="mt-1 block text-xs text-slate-500">
                            {remaining} vagas contratuais restantes
                          </span>
                          <span
                            className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                              blockedByMonth
                                ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                                : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            }`}
                          >
                            {blockedByMonth ? "Limite mensal usado" : "Liberada para agenda"}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {companyCoverages.length === 0 && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                      Nenhuma especialidade foi localizada na cobertura da empresa.
                    </div>
                  )}
                </div>

                <NextConsultationCard
                  canEnter={canEnterNextAppointment}
                  nextAppointment={nextAppointment}
                  tooltip={consultationTooltip}
                  onEnter={enterConsultation}
                />
              </div>

              <div className="border-t border-slate-200 px-4 py-4">
                {scheduleNotice !== null && (
                  <div className="mb-4 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-800">
                    {scheduleNotice}
                  </div>
                )}

                {selectedSpecialty === null ? (
                  <div className="rounded-md border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                    Escolha uma especialidade liberada para visualizar horarios disponiveis.
                  </div>
                ) : (
                  <AgendaSlots specialty={selectedSpecialty} onSchedule={scheduleSlot} />
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {isVideoOpen && nextAppointment !== undefined && (
        <VideoConsultationModal
          appointment={nextAppointment}
          onClose={() => setIsVideoOpen(false)}
        />
      )}
    </section>
  );
}

function ProfileCard({ profile }: Readonly<{ profile: EmployeeAccessProfile }>) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{profile.fullName}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {profile.companyTradeName} / {profile.cpf}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {profile.department} / {profile.jobPosition}
          </p>
        </div>
        <span className="h-fit rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
          {statusLabels[profile.registrationStatus]}
        </span>
      </div>
    </section>
  );
}

function RegistrationCheck({
  form,
  isLoading,
  result,
  setForm,
  submitDivergence,
}: Readonly<{
  form: { department: string; email: string; jobPosition: string; phone: string };
  isLoading: boolean;
  result: DivergenceResult | null;
  setForm: Dispatch<
    SetStateAction<{ department: string; email: string; jobPosition: string; phone: string }>
  >;
  submitDivergence: () => void;
}>) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-base font-semibold text-slate-950">Conferencia cadastral</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field
          label="E-mail"
          value={form.email}
          onChange={(value) => setForm((current) => ({ ...current, email: value }))}
        />
        <Field
          label="Telefone/WhatsApp"
          value={form.phone}
          onChange={(value) => setForm((current) => ({ ...current, phone: value }))}
        />
        <Field
          label="Setor"
          value={form.department}
          onChange={(value) => setForm((current) => ({ ...current, department: value }))}
        />
        <Field
          label="Cargo"
          value={form.jobPosition}
          onChange={(value) => setForm((current) => ({ ...current, jobPosition: value }))}
        />
      </div>

      <button
        className="mt-4 rounded-md bg-pronus-primary px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isLoading}
        type="button"
        onClick={submitDivergence}
      >
        Enviar conferencia
      </button>

      {result !== null && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Divergencia enviada para analise do RH. Campos sinalizados: {result.changes.length}.
        </div>
      )}
    </section>
  );
}

function NextConsultationCard({
  canEnter,
  nextAppointment,
  onEnter,
  tooltip,
}: Readonly<{
  canEnter: boolean;
  nextAppointment: Appointment | undefined;
  onEnter: () => void;
  tooltip: string;
}>) {
  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-950">Proxima consulta</p>
      <p className="mt-2 min-h-10 text-sm text-slate-600">
        {nextAppointment === undefined
          ? "Nenhuma consulta agendada."
          : `${formatDateTime(nextAppointment.dateTime)} / ${nextAppointment.specialty}`}
      </p>

      <button
        aria-disabled={!canEnter}
        className={`mt-4 w-full rounded-md px-4 py-3 text-sm font-semibold transition ${
          canEnter
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "cursor-not-allowed border border-slate-300 bg-white text-slate-500 opacity-45"
        }`}
        title={tooltip}
        type="button"
        onClick={onEnter}
      >
        Iniciar consulta
      </button>
    </article>
  );
}

function AgendaSlots({
  onSchedule,
  specialty,
}: Readonly<{ onSchedule: (slotId: string) => void; specialty: string }>) {
  const slots = slotSeed.filter((slot) => slot.specialty === specialty);

  return (
    <div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-slate-950">Agenda disponivel</h3>
        <span className="text-xs font-semibold uppercase text-slate-500">
          Profissional definido automaticamente
        </span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((slot) => (
          <button
            key={slot.id}
            className="rounded-md border border-slate-200 bg-white px-3 py-3 text-left text-sm font-semibold text-slate-800 hover:border-pronus-primary hover:text-pronus-primary"
            type="button"
            onClick={() => onSchedule(slot.id)}
          >
            {formatDateTime(slot.dateTime)}
          </button>
        ))}
      </div>
    </div>
  );
}

function VideoConsultationModal({
  appointment,
  onClose,
}: Readonly<{ appointment: Appointment; onClose: () => void }>) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
      <section className="w-full max-w-4xl rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Consulta por video</h2>
            <p className="mt-1 text-sm text-slate-600">
              {appointment.specialty} / {formatDateTime(appointment.dateTime)}
            </p>
          </div>
          <button
            aria-label="Fechar consulta"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700"
            type="button"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
        <div className="grid gap-4 p-5 lg:grid-cols-[1fr_260px]">
          <div className="flex aspect-video items-center justify-center rounded-md bg-slate-900 text-sm font-semibold text-white">
            Sala de video PRONUS
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-950">Status da sala</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Aguardando entrada do profissional. O historico da consulta ficara vinculado ao
              prontuario conforme permissao clinica.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  onChange,
  value,
}: Readonly<{
  label: string;
  onChange: (value: string) => void;
  value: string;
}>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
