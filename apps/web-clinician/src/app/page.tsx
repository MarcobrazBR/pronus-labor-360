"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

type ClinicianSession = {
  cpf: string;
  email: string;
  fullName: string;
  id: string;
  license: string;
  mustChangePassword: boolean;
  specialty: string;
};

type Appointment = {
  clientName: string;
  company: string;
  id: string;
  scheduledAt: string;
  specialty: string;
  status: "waiting" | "ready" | "done";
};

const sessionStorageKey = "pronus:clinician-session";
const passwordStorageKey = "pronus:clinician-passwords";
const notesStorageKey = "pronus:clinical-notes";

const appointments: Appointment[] = [
  {
    clientName: "Rafael Moreira Lima",
    company: "Industria Horizonte",
    id: "appointment-001",
    scheduledAt: "2026-05-09T09:00:00",
    specialty: "Acolhimento Psicologico",
    status: "ready",
  },
  {
    clientName: "Carla Souza Andrade",
    company: "Industria Horizonte",
    id: "appointment-002",
    scheduledAt: "2026-05-09T10:20:00",
    specialty: "Clinico Geral",
    status: "waiting",
  },
  {
    clientName: "Marcos Vinicius Teixeira",
    company: "Rede Norte",
    id: "appointment-003",
    scheduledAt: "2026-05-09T11:00:00",
    specialty: "Atendimento Nutricional",
    status: "waiting",
  },
  {
    clientName: "Juliana Alves",
    company: "Industria Horizonte",
    id: "appointment-004",
    scheduledAt: "2026-05-09T13:30:00",
    specialty: "Clinico Geral",
    status: "waiting",
  },
  {
    clientName: "Bruno Ribeiro",
    company: "Rede Norte",
    id: "appointment-005",
    scheduledAt: "2026-05-09T14:10:00",
    specialty: "Acolhimento Psicologico",
    status: "waiting",
  },
  {
    clientName: "Tatiane Lima",
    company: "Industria Horizonte",
    id: "appointment-006",
    scheduledAt: "2026-05-09T15:00:00",
    specialty: "Clinico Geral",
    status: "waiting",
  },
];

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function standardPassword(cpf: string) {
  return onlyDigits(cpf).slice(0, 6);
}

function isStrongPassword(value: string) {
  return (
    value.length === 6 && /[A-Za-z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value)
  );
}

function timeLabel(value: string) {
  return new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function readNotes(): Record<string, string> {
  const raw = window.localStorage.getItem(notesStorageKey);

  if (raw === null) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export default function ClinicianPortalPage() {
  const [session, setSession] = useState<ClinicianSession | null>(null);
  const [selectedId, setSelectedId] = useState(appointments[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [noteMessage, setNoteMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraClosed, setIsCameraClosed] = useState(false);
  const [isBackgroundProtected, setIsBackgroundProtected] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const selectedAppointment = useMemo(
    () => appointments.find((appointment) => appointment.id === selectedId) ?? appointments[0],
    [selectedId],
  );

  const nextAppointments = appointments.slice(0, 5);

  useEffect(() => {
    const rawSession = window.localStorage.getItem(sessionStorageKey);

    if (rawSession === null) {
      setSession(null);
      return;
    }

    try {
      setSession(JSON.parse(rawSession) as ClinicianSession);
    } catch {
      setSession(null);
    }
  }, []);

  useEffect(() => {
    if (selectedAppointment === undefined) {
      return;
    }

    setNote(readNotes()[selectedAppointment.id] ?? "");
    setNoteMessage(null);
  }, [selectedAppointment]);

  function logout() {
    window.localStorage.removeItem(sessionStorageKey);
    window.location.href = "/login";
  }

  function saveNote() {
    if (selectedAppointment === undefined) {
      return;
    }

    const notes = readNotes();
    notes[selectedAppointment.id] = note;
    window.localStorage.setItem(notesStorageKey, JSON.stringify(notes));
    setNoteMessage("Anamnese salva no prontuario demonstrativo.");
  }

  function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (session === null) {
      return;
    }

    if (!isStrongPassword(newPassword)) {
      setPasswordMessage("Use exatamente 6 caracteres com letras, numeros e caractere especial.");
      return;
    }

    if (newPassword === standardPassword(session.cpf)) {
      setPasswordMessage("Escolha uma senha diferente da senha padrao.");
      return;
    }

    const rawPasswords = window.localStorage.getItem(passwordStorageKey);
    const passwords =
      rawPasswords === null ? {} : (JSON.parse(rawPasswords) as Record<string, string>);
    passwords[onlyDigits(session.cpf)] = newPassword;
    window.localStorage.setItem(passwordStorageKey, JSON.stringify(passwords));

    const updatedSession = { ...session, mustChangePassword: false };
    window.localStorage.setItem(sessionStorageKey, JSON.stringify(updatedSession));
    setSession(updatedSession);
    setNewPassword("");
    setPasswordMessage(null);
  }

  if (session === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-pronus-background px-5 text-center text-pronus-text">
        <section className="w-full max-w-md rounded-lg border border-white/70 bg-white p-6 shadow-sm">
          <img alt="Pronus Labor" className="mx-auto h-20 w-auto" src="/brand/pronus-logo.png" />
          <h1 className="mt-5 text-xl font-semibold">Portal Profissional de Saude</h1>
          <a
            className="mt-5 inline-flex rounded-md bg-pronus-primary px-4 py-2.5 text-sm font-semibold text-white"
            href="/login"
          >
            Ir para login
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-pronus-background text-pronus-text">
      <div className="flex min-h-screen w-full flex-col gap-5 px-4 py-4 lg:px-5 2xl:px-7">
        <header className="flex flex-col gap-3 rounded-lg border border-white/70 bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img alt="Pronus Labor" className="h-16 w-auto" src="/brand/pronus-logo.png" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-pronus-primary">
                Portal Profissional de Saude
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-normal">{session.fullName}</h1>
              <p className="mt-0.5 text-sm text-slate-500">
                {session.specialty} / {session.license}
              </p>
            </div>
          </div>
          <button
            className="self-start rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-pronus-primary hover:text-pronus-primary md:self-auto"
            type="button"
            onClick={logout}
          >
            Sair
          </button>
        </header>

        <section className="grid min-h-[calc(100vh-8.5rem)] gap-5 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="rounded-lg border border-slate-200 bg-white">
            <PanelHeader title="Atendimentos de hoje" detail={`${appointments.length} agendas`} />
            <div className="divide-y divide-slate-100">
              {appointments.map((appointment) => (
                <button
                  key={appointment.id}
                  className={`w-full px-4 py-3 text-left transition ${
                    appointment.id === selectedId
                      ? "bg-pronus-primary text-white"
                      : "bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                  type="button"
                  onClick={() => setSelectedId(appointment.id)}
                >
                  <span className="block text-sm font-semibold">
                    {timeLabel(appointment.scheduledAt)} / {appointment.clientName}
                  </span>
                  <span
                    className={`mt-1 block text-xs ${
                      appointment.id === selectedId ? "text-white/85" : "text-slate-500"
                    }`}
                  >
                    {appointment.specialty}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section className="grid min-h-[42rem] gap-5 lg:grid-rows-[minmax(24rem,1fr)_minmax(14rem,0.55fr)]">
            <article className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white">
              <PanelHeader
                detail={selectedAppointment?.company ?? "Empresa"}
                title={selectedAppointment?.clientName ?? "Consulta"}
              />
              <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-slate-950">
                <div
                  className={`absolute inset-0 bg-[radial-gradient(circle_at_top_left,#457b9d_0,#1d3557_48%,#0f172a_100%)] transition ${
                    isBackgroundProtected ? "blur-sm" : ""
                  }`}
                />
                <div className="relative z-10 flex h-40 w-40 items-center justify-center rounded-full border border-white/25 bg-white/10 text-4xl font-semibold text-white shadow-2xl">
                  {isCameraClosed ? "CAM" : selectedAppointment?.clientName.slice(0, 1)}
                </div>
                <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-wrap justify-center gap-2 rounded-lg bg-slate-950/70 p-2 backdrop-blur">
                  <ControlButton
                    active={isMuted}
                    label={isMuted ? "Mic off" : "Mic"}
                    title="Ativar ou desativar microfone"
                    onClick={() => setIsMuted((current) => !current)}
                  />
                  <ControlButton
                    active={isCameraClosed}
                    label={isCameraClosed ? "Cam off" : "Cam"}
                    title="Ativar ou desativar camera"
                    onClick={() => setIsCameraClosed((current) => !current)}
                  />
                  <ControlButton
                    active={isBackgroundProtected}
                    label="Fundo"
                    title="Proteger fundo do video"
                    onClick={() => setIsBackgroundProtected((current) => !current)}
                  />
                  <ControlButton
                    active={handRaised}
                    label="Mao"
                    title="Levantar mao"
                    onClick={() => setHandRaised((current) => !current)}
                  />
                </div>
              </div>
            </article>

            <article className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white">
              <PanelHeader detail="Registro clinico" title="Anamnese" />
              <div className="flex min-h-0 flex-1 flex-col p-4">
                <textarea
                  className="min-h-40 flex-1 resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
                  placeholder="Digite os pontos relevantes da consulta"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-slate-500">
                    {noteMessage ?? "Os pontos salvos ficam vinculados ao prontuario do cliente."}
                  </span>
                  <button
                    className="rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white hover:bg-pronus-primary/90"
                    type="button"
                    onClick={saveNote}
                  >
                    Salvar no prontuario
                  </button>
                </div>
              </div>
            </article>
          </section>

          <aside className="rounded-lg border border-slate-200 bg-white">
            <PanelHeader title="Proximos atendimentos" detail="5 agendas" />
            <div className="divide-y divide-slate-100">
              {nextAppointments.map((appointment) => (
                <article key={appointment.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold">{appointment.clientName}</h3>
                      <p className="mt-1 text-xs text-slate-500">{appointment.company}</p>
                    </div>
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {timeLabel(appointment.scheduledAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{appointment.specialty}</p>
                </article>
              ))}
            </div>
          </aside>
        </section>
      </div>

      {session.mustChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
          <form
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
            onSubmit={changePassword}
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-pronus-primary">
              Primeiro acesso
            </p>
            <h2 className="mt-2 text-xl font-semibold">Atualize sua senha</h2>
            <label className="mt-5 block text-xs font-semibold uppercase text-slate-500">
              Nova senha
              <input
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal normal-case text-slate-900 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </label>
            <p className="mt-2 text-xs text-slate-500">
              Use letras, numeros e caractere especial, com exatamente 6 caracteres.
            </p>
            {passwordMessage !== null && (
              <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                {passwordMessage}
              </div>
            )}
            <button
              className="mt-5 w-full rounded-md bg-pronus-primary px-4 py-2.5 text-sm font-semibold text-white"
              type="submit"
            >
              Salvar nova senha
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

function PanelHeader({ detail, title }: Readonly<{ detail: string; title: string }>) {
  return (
    <div className="border-b border-slate-200 px-4 py-3">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 text-xs font-medium text-slate-500">{detail}</p>
    </div>
  );
}

function ControlButton({
  active,
  label,
  onClick,
  title,
}: Readonly<{ active: boolean; label: string; onClick: () => void; title: string }>) {
  return (
    <button
      className={`rounded-md px-3 py-2 text-xs font-semibold transition ${
        active ? "bg-pronus-action text-pronus-text" : "bg-white text-slate-700"
      }`}
      title={title}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
