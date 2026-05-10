"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  getApiUrl,
  isStrongPassword,
  responseMessage,
  sessionStorageKey,
  standardPassword,
  toClinicianSession,
  type ClinicianSession,
  type PronusAccessProfile,
} from "./clinician-access";

type ConsultationState = "waiting" | "in_call" | "disconnected" | "finalized";

type Appointment = {
  clientName: string;
  company: string;
  id: string;
  scheduledAt: string;
  specialty: string;
};

type RecordSummary = {
  generatedAt: string;
  highlights: string[];
  text: string;
};

type PaymentEvent = {
  appointmentId: string;
  clientName: string;
  finalizedAt: string;
  professionalId: string;
  professionalName: string;
  specialty: string;
};

const consultationStatusStorageKey = "pronus:consultation-status";
const finalizedPaymentStorageKey = "pronus:professional-payment-events";
const notesStorageKey = "pronus:clinical-notes";
const transcriptStorageKey = "pronus:clinical-transcripts";

const appointments: Appointment[] = [
  {
    clientName: "Rafael Moreira Lima",
    company: "Industria Horizonte",
    id: "appointment-001",
    scheduledAt: "2026-05-09T09:00:00",
    specialty: "Acolhimento Psicologico",
  },
  {
    clientName: "Carla Souza Andrade",
    company: "Industria Horizonte",
    id: "appointment-002",
    scheduledAt: "2026-05-09T10:20:00",
    specialty: "Clinico Geral",
  },
  {
    clientName: "Marcos Vinicius Teixeira",
    company: "Rede Norte",
    id: "appointment-003",
    scheduledAt: "2026-05-09T11:00:00",
    specialty: "Atendimento Nutricional",
  },
  {
    clientName: "Juliana Alves",
    company: "Industria Horizonte",
    id: "appointment-004",
    scheduledAt: "2026-05-09T13:30:00",
    specialty: "Clinico Geral",
  },
  {
    clientName: "Bruno Ribeiro",
    company: "Rede Norte",
    id: "appointment-005",
    scheduledAt: "2026-05-09T14:10:00",
    specialty: "Acolhimento Psicologico",
  },
  {
    clientName: "Tatiane Lima",
    company: "Industria Horizonte",
    id: "appointment-006",
    scheduledAt: "2026-05-09T15:00:00",
    specialty: "Clinico Geral",
  },
];

const recordSummaries: Record<string, RecordSummary> = {
  "appointment-001": {
    generatedAt: "2026-05-09T04:00:00",
    highlights: [
      "Pesquisa comportamental concluida com sinal de risco alto.",
      "Sem consulta psicologica registrada no mes atual.",
      "Cadastro validado pelo RH em 2026-05-08.",
    ],
    text:
      "Resumo GPT: Rafael Moreira Lima possui historico ocupacional recente na Industria Horizonte, setor Producao, cargo Operador de Linha. A pesquisa comportamental sinalizou carga emocional elevada, fadiga e baixa previsibilidade de rotina. Recomenda-se abordagem acolhedora, investigacao de sono, rede de apoio e orientacao sobre continuidade do cuidado.",
  },
  "appointment-002": {
    generatedAt: "2026-05-09T05:20:00",
    highlights: [
      "Queixa anterior de dor cervical associada ao posto de trabalho.",
      "ASO periodico previsto para junho de 2026.",
      "Sem restricoes ocupacionais registradas.",
    ],
    text:
      "Resumo GPT: Carla Souza Andrade atua no administrativo da Industria Horizonte. O prontuario indica relato de desconforto cervical em atendimento anterior, com orientacao ergonomica e pausa ativa. Priorizar escuta sobre intensidade da dor, frequencia, rotina de trabalho e adesao as orientacoes.",
  },
  "appointment-003": {
    generatedAt: "2026-05-09T06:00:00",
    highlights: [
      "Acompanhamento nutricional inicial.",
      "Empresa com cobertura ativa para atendimento nutricional.",
      "Sem alergias registradas no cadastro demonstrativo.",
    ],
    text:
      "Resumo GPT: Marcos Vinicius Teixeira esta em primeiro atendimento nutricional pela Rede Norte. Nao ha registros de alergias ou restricoes alimentares no cadastro demonstrativo. Recomenda-se levantar rotina alimentar, turnos, qualidade do sono e objetivos de acompanhamento.",
  },
};

const statusLabels: Record<ConsultationState, string> = {
  disconnected: "Chamada encerrada",
  finalized: "Consulta finalizada",
  in_call: "Em atendimento",
  waiting: "Aguardando",
};

const statusStyles: Record<ConsultationState, string> = {
  disconnected: "border-red-200 bg-red-50 text-red-800",
  finalized: "border-blue-200 bg-blue-50 text-blue-800",
  in_call: "border-emerald-200 bg-emerald-50 text-emerald-800",
  waiting: "border-slate-200 bg-white text-slate-700",
};

function defaultConsultationStatus(): Record<string, ConsultationState> {
  return appointments.reduce<Record<string, ConsultationState>>((accumulator, appointment, index) => {
    accumulator[appointment.id] = index === 0 ? "in_call" : "waiting";
    return accumulator;
  }, {});
}

function timeLabel(value: string) {
  return new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function readJsonStorage<T>(key: string, fallback: T): T {
  const raw = window.localStorage.getItem(key);

  if (raw === null) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readConsultationStatus(): Record<string, ConsultationState> {
  const defaults = defaultConsultationStatus();
  const stored = readJsonStorage<Record<string, ConsultationState>>(consultationStatusStorageKey, {});

  return appointments.reduce<Record<string, ConsultationState>>((accumulator, appointment) => {
    accumulator[appointment.id] = stored[appointment.id] ?? defaults[appointment.id] ?? "waiting";
    return accumulator;
  }, {});
}

function buildRecordSummary(appointment: Appointment): RecordSummary {
  return (
    recordSummaries[appointment.id] ?? {
      generatedAt: new Date(new Date(appointment.scheduledAt).getTime() - 5 * 60 * 60 * 1000).toISOString(),
      highlights: [
        "Resumo gerado 5 horas antes do atendimento.",
        "Sem alerta clinico critico no prontuario demonstrativo.",
        "Confirmar queixa principal no inicio da consulta.",
      ],
      text: `Resumo GPT: ${appointment.clientName} possui consulta de ${appointment.specialty} pela empresa ${appointment.company}. O prontuario demonstrativo nao indica evento critico recente. Sugere-se confirmar dados clinicos, motivo da consulta e orientacoes anteriores antes da conduta.`,
    }
  );
}

function buildTranscription(appointment: Appointment) {
  const specialtyTranscript: Record<string, string> = {
    "Acolhimento Psicologico":
      "Paciente relata oscilacao de humor, cansaco no fim do expediente e dificuldade para organizar pausas. Foi orientado a observar sinais de sobrecarga, manter rede de apoio e retornar se houver piora.",
    "Atendimento Nutricional":
      "Paciente descreve rotina alimentar irregular em dias de turno, baixa ingestao de agua e consumo elevado de alimentos ultraprocessados. Foram combinadas metas simples para a proxima semana.",
    "Clinico Geral":
      "Paciente relata queixa inespecifica de fadiga e desconforto leve, sem sinais de alarme no atendimento demonstrativo. Orientado acompanhamento, hidratacao e retorno se houver persistencia dos sintomas.",
  };

  return `[Transcricao automatica - ${timeLabel(appointment.scheduledAt)}] ${
    specialtyTranscript[appointment.specialty] ??
    "Consulta gravada e transcrita automaticamente para revisao do profissional."
  }`;
}

export default function ClinicianPortalPage() {
  const [session, setSession] = useState<ClinicianSession | null>(null);
  const [selectedId, setSelectedId] = useState(appointments[0]!.id);
  const [consultationStatus, setConsultationStatus] = useState(defaultConsultationStatus);
  const [note, setNote] = useState("");
  const [noteMessage, setNoteMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraClosed, setIsCameraClosed] = useState(false);
  const [isBackgroundProtected, setIsBackgroundProtected] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const selectedAppointment = useMemo<Appointment>(
    () => appointments.find((appointment) => appointment.id === selectedId) ?? appointments[0]!,
    [selectedId],
  );
  const selectedStatus = consultationStatus[selectedAppointment.id] ?? "waiting";
  const selectedIndex = appointments.findIndex((appointment) => appointment.id === selectedAppointment.id);
  const currentInCallId = appointments.find((appointment) => consultationStatus[appointment.id] === "in_call")?.id;
  const recordSummary = buildRecordSummary(selectedAppointment);

  useEffect(() => {
    const rawSession = window.localStorage.getItem(sessionStorageKey);
    setConsultationStatus(readConsultationStatus());

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
    setNote(readJsonStorage<Record<string, string>>(notesStorageKey, {})[selectedAppointment.id] ?? "");
    setNoteMessage(null);
  }, [selectedAppointment]);

  function logout() {
    window.localStorage.removeItem(sessionStorageKey);
    window.location.href = "/login";
  }

  function updateConsultationStatus(
    updater: (current: Record<string, ConsultationState>) => Record<string, ConsultationState>,
  ) {
    setConsultationStatus((current) => {
      const next = updater(current);
      window.localStorage.setItem(consultationStatusStorageKey, JSON.stringify(next));
      return next;
    });
  }

  function canSelectAppointment(appointment: Appointment, index: number) {
    const status = consultationStatus[appointment.id] ?? "waiting";

    if (appointment.id === selectedId || status === "disconnected" || status === "finalized") {
      return true;
    }

    if (currentInCallId !== undefined && currentInCallId !== appointment.id) {
      return false;
    }

    return appointments.slice(0, index).every((previousAppointment) => {
      const previousStatus = consultationStatus[previousAppointment.id] ?? "waiting";
      return previousStatus === "disconnected" || previousStatus === "finalized";
    });
  }

  function selectAppointment(appointment: Appointment, index: number) {
    if (!canSelectAppointment(appointment, index)) {
      setNoteMessage("Encerre a consulta anterior antes de abrir este atendimento.");
      return;
    }

    const status = consultationStatus[appointment.id] ?? "waiting";
    setSelectedId(appointment.id);

    if (status === "waiting") {
      updateConsultationStatus((current) => ({ ...current, [appointment.id]: "in_call" }));
    }
  }

  function persistNote(nextNote: string) {
    const notes = readJsonStorage<Record<string, string>>(notesStorageKey, {});
    notes[selectedAppointment.id] = nextNote;
    window.localStorage.setItem(notesStorageKey, JSON.stringify(notes));
  }

  function endCall() {
    if (selectedStatus !== "in_call") {
      setNoteMessage("A chamada deste atendimento ja foi encerrada ou ainda nao foi iniciada.");
      return;
    }

    const transcription = buildTranscription(selectedAppointment);
    const transcripts = readJsonStorage<Record<string, string>>(transcriptStorageKey, {});
    transcripts[selectedAppointment.id] = transcription;
    window.localStorage.setItem(transcriptStorageKey, JSON.stringify(transcripts));

    const nextNote = [note.trim(), transcription].filter(Boolean).join("\n\n");
    setNote(nextNote);
    persistNote(nextNote);
    updateConsultationStatus((current) => ({ ...current, [selectedAppointment.id]: "disconnected" }));
    setNoteMessage("Chamada encerrada. Audio transcrito para a anamnese e liberado para revisao.");
  }

  function finalizeConsultation() {
    if (selectedStatus !== "disconnected") {
      setNoteMessage("Encerre a chamada antes de finalizar a consulta.");
      return;
    }

    if (note.trim().length === 0) {
      setNoteMessage("Revise a transcricao ou registre a anamnese antes de finalizar.");
      return;
    }

    persistNote(note);
    updateConsultationStatus((current) => ({ ...current, [selectedAppointment.id]: "finalized" }));

    if (session !== null) {
      const events = readJsonStorage<PaymentEvent[]>(finalizedPaymentStorageKey, []);
      const alreadyRegistered = events.some((event) => event.appointmentId === selectedAppointment.id);

      if (!alreadyRegistered) {
        events.push({
          appointmentId: selectedAppointment.id,
          clientName: selectedAppointment.clientName,
          finalizedAt: new Date().toISOString(),
          professionalId: session.id,
          professionalName: session.fullName,
          specialty: selectedAppointment.specialty,
        });
        window.localStorage.setItem(finalizedPaymentStorageKey, JSON.stringify(events));
      }
    }

    setNoteMessage("Consulta finalizada. Este atendimento entrou no calculo de pagamento profissional.");
  }

  function speakSummary() {
    if (!("speechSynthesis" in window)) {
      setNoteMessage("Leitura em audio indisponivel neste navegador.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `${recordSummary.text}. Pontos de atencao: ${recordSummary.highlights.join(". ")}`,
    );
    utterance.lang = "pt-BR";
    window.speechSynthesis.speak(utterance);
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
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

    try {
      const response = await fetch(`${getApiUrl()}/pronus-access/password`, {
        body: JSON.stringify({ userId: session.id, newPassword }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const payload = (await response.json()) as PronusAccessProfile | { message?: string };

      if (!response.ok) {
        setPasswordMessage(responseMessage(payload, "Nao foi possivel atualizar a senha."));
        return;
      }

      const updatedSession = toClinicianSession(payload as PronusAccessProfile);
      window.localStorage.setItem(sessionStorageKey, JSON.stringify(updatedSession));
      setSession(updatedSession);
      setNewPassword("");
      setPasswordMessage(null);
    } catch {
      setPasswordMessage("Nao foi possivel conectar a API local.");
    }
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

        <section className="grid min-h-[calc(100vh-8.5rem)] gap-5 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
          <aside className="rounded-lg border border-slate-200 bg-white">
            <PanelHeader title="Atendimentos de hoje" detail={`${appointments.length} agendas`} />
            <div className="divide-y divide-slate-100">
              {appointments.map((appointment, index) => {
                const status = consultationStatus[appointment.id] ?? "waiting";
                const isSelected = appointment.id === selectedId;
                const isLocked = !canSelectAppointment(appointment, index);

                return (
                  <button
                    key={appointment.id}
                    className={`w-full border-l-4 px-4 py-3 text-left transition ${
                      isSelected ? "border-pronus-primary bg-slate-50" : "border-transparent"
                    } ${statusStyles[status]} ${isLocked ? "cursor-not-allowed opacity-55" : "hover:bg-slate-50"}`}
                    disabled={isLocked}
                    title={isLocked ? "Encerre o atendimento anterior para liberar esta agenda" : undefined}
                    type="button"
                    onClick={() => selectAppointment(appointment, index)}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">
                          {timeLabel(appointment.scheduledAt)} / {appointment.clientName}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">{appointment.specialty}</span>
                      </span>
                      <span className="shrink-0 rounded-md border border-current/20 bg-white/60 px-2 py-1 text-[0.68rem] font-semibold uppercase">
                        {statusLabels[status]}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="grid min-h-[42rem] gap-5 lg:grid-rows-[minmax(24rem,1fr)_minmax(14rem,0.6fr)]">
            <article className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white">
              <PanelHeader
                detail={`${selectedAppointment.company} / ${statusLabels[selectedStatus]}`}
                title={selectedAppointment.clientName}
              />
              <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-slate-950">
                <div
                  className={`absolute inset-0 bg-[radial-gradient(circle_at_top_left,#457b9d_0,#1d3557_48%,#0f172a_100%)] transition ${
                    isBackgroundProtected ? "blur-sm" : ""
                  }`}
                />
                <div className="relative z-10 flex h-40 w-40 items-center justify-center rounded-full border border-white/25 bg-white/10 text-4xl font-semibold text-white shadow-2xl">
                  {isCameraClosed || selectedStatus !== "in_call" ? "OFF" : selectedAppointment.clientName.slice(0, 1)}
                </div>
                <div className="absolute left-4 top-4 z-20 rounded-md bg-slate-950/70 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white">
                  {selectedStatus === "in_call" ? "Gravacao ativa" : "Audio processado"}
                </div>
              </div>
              <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <IconControlButton
                    active={isMuted}
                    disabled={selectedStatus !== "in_call"}
                    icon={<MicIcon muted={isMuted} />}
                    label={isMuted ? "Microfone desativado" : "Microfone"}
                    title="Ativar ou desativar microfone"
                    onClick={() => setIsMuted((current) => !current)}
                  />
                  <IconControlButton
                    active={isCameraClosed}
                    disabled={selectedStatus !== "in_call"}
                    icon={<CameraIcon closed={isCameraClosed} />}
                    label={isCameraClosed ? "Camera desativada" : "Camera"}
                    title="Ativar ou desativar camera"
                    onClick={() => setIsCameraClosed((current) => !current)}
                  />
                  <IconControlButton
                    active={isBackgroundProtected}
                    disabled={selectedStatus !== "in_call"}
                    icon={<BackgroundIcon />}
                    label="Fundo protegido"
                    title="Proteger fundo do video"
                    onClick={() => setIsBackgroundProtected((current) => !current)}
                  />
                  <IconControlButton
                    active={handRaised}
                    disabled={selectedStatus !== "in_call"}
                    icon={<HandIcon />}
                    label="Levantar mao"
                    title="Levantar mao"
                    onClick={() => setHandRaised((current) => !current)}
                  />
                </div>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                  disabled={selectedStatus !== "in_call"}
                  title="Encerra a chamada de video e envia o audio para transcricao"
                  type="button"
                  onClick={endCall}
                >
                  <PhoneOffIcon />
                  Encerrar consulta
                </button>
              </div>
            </article>

            <article className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white">
              <PanelHeader
                detail={selectedStatus === "finalized" ? "Registro bloqueado apos finalizacao" : "Edite antes de finalizar"}
                title="Anamnese"
              />
              <div className="flex min-h-0 flex-1 flex-col p-4">
                <textarea
                  className="min-h-40 flex-1 resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="A transcricao automatica sera preenchida aqui apos encerrar a chamada"
                  readOnly={selectedStatus === "finalized"}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-slate-500">
                    {noteMessage ?? "A anamnese pode ser revisada ate a finalizacao da consulta."}
                  </span>
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white hover:bg-pronus-primary/90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                    disabled={selectedStatus !== "disconnected"}
                    title={
                      selectedStatus === "disconnected"
                        ? "Computa a consulta para pagamento e bloqueia a edicao"
                        : "Encerre a chamada antes de finalizar"
                    }
                    type="button"
                    onClick={finalizeConsultation}
                  >
                    <CheckIcon />
                    Finalizar consulta
                  </button>
                </div>
              </div>
            </article>
          </section>

          <aside className="rounded-lg border border-slate-200 bg-white">
            <PanelHeader title="Resumo do prontuario" detail="Resumo GPT demonstrativo 5h antes" />
            <div className="space-y-4 p-4">
              <div className="rounded-md border border-pronus-primary/20 bg-pronus-primary/5 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-pronus-primary">
                  Paciente em atendimento
                </p>
                <h3 className="mt-1 text-base font-semibold text-slate-950">
                  {selectedAppointment.clientName}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{selectedAppointment.specialty}</p>
              </div>
              <p className="text-sm leading-6 text-slate-700">{recordSummary.text}</p>
              <div>
                <h4 className="text-sm font-semibold text-slate-950">Pontos de atencao</h4>
                <ul className="mt-2 space-y-2 text-sm text-slate-600">
                  {recordSummary.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pronus-primary" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                Gerado em {new Date(recordSummary.generatedAt).toLocaleString("pt-BR", {
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  month: "2-digit",
                })}
              </div>
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-pronus-primary bg-white px-4 py-2.5 text-sm font-semibold text-pronus-primary hover:bg-pronus-primary hover:text-white"
                type="button"
                onClick={speakSummary}
              >
                <VolumeIcon />
                Ouvir resumo
              </button>
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

function IconControlButton({
  active,
  disabled,
  icon,
  label,
  onClick,
  title,
}: Readonly<{
  active: boolean;
  disabled: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  title: string;
}>) {
  return (
    <button
      aria-label={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-md border text-sm transition ${
        active
          ? "border-pronus-action bg-pronus-action text-pronus-text"
          : "border-slate-200 bg-white text-slate-700"
      } hover:border-pronus-primary hover:text-pronus-primary disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400`}
      disabled={disabled}
      title={title}
      type="button"
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

function SvgShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}

function MicIcon({ muted }: Readonly<{ muted: boolean }>) {
  return (
    <SvgShell>
      <path d="M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" />
      <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
      <path d="M12 18v3" />
      <path d="M8 21h8" />
      {muted && <path d="M4 4l16 16" />}
    </SvgShell>
  );
}

function CameraIcon({ closed }: Readonly<{ closed: boolean }>) {
  return (
    <SvgShell>
      <path d="M4 7h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
      <path d="m16 11 6-3v8l-6-3" />
      {closed && <path d="M3 3l18 18" />}
    </SvgShell>
  );
}

function BackgroundIcon() {
  return (
    <SvgShell>
      <path d="M4 5h16v14H4z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
      <path d="M16 13h.01" />
    </SvgShell>
  );
}

function HandIcon() {
  return (
    <SvgShell>
      <path d="M7 11V5a2 2 0 0 1 4 0v5" />
      <path d="M11 10V4a2 2 0 0 1 4 0v8" />
      <path d="M15 12V7a2 2 0 0 1 4 0v6a7 7 0 0 1-7 7H9a5 5 0 0 1-5-5v-3a2 2 0 0 1 3.4-1.4L9 12" />
    </SvgShell>
  );
}

function PhoneOffIcon() {
  return (
    <SvgShell>
      <path d="M10.7 14.3a14 14 0 0 0 3 3l2-2a1.4 1.4 0 0 1 1.4-.34 11 11 0 0 0 3.4.54 1.5 1.5 0 0 1 1.5 1.5V20a1.5 1.5 0 0 1-1.5 1.5A18.5 18.5 0 0 1 2 3.5 1.5 1.5 0 0 1 3.5 2H7a1.5 1.5 0 0 1 1.5 1.5 11 11 0 0 0 .54 3.4 1.4 1.4 0 0 1-.34 1.4l-2 2a14 14 0 0 0 2.3 2.3" />
      <path d="M3 3l18 18" />
    </SvgShell>
  );
}

function CheckIcon() {
  return (
    <SvgShell>
      <path d="M20 6 9 17l-5-5" />
    </SvgShell>
  );
}

function VolumeIcon() {
  return (
    <SvgShell>
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="M15 9a5 5 0 0 1 0 6" />
      <path d="M18 6a9 9 0 0 1 0 12" />
    </SvgShell>
  );
}
