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

type ActiveModule = "care" | "finance" | "records";

type TimelineArea = "ocupacional" | "medica" | "psicologica" | "nutricional";

type TimelineEvent = {
  area: TimelineArea;
  attachments: string[];
  conduct: string;
  critical: boolean;
  eventType: string;
  id: string;
  nextStep: string;
  professional: string;
  secrecy: "Administrativo" | "Clinico" | "Sigiloso";
  status: "Aberto" | "Assinado" | "Pendente" | "Concluido";
  summary: string;
  timestamp: string;
};

type WorkerHealthRecord = {
  alerts: string[];
  asoDueDate: string;
  birthDate: string;
  cbo: string;
  company: string;
  cpf: string;
  ghe: string;
  id: string;
  jobPosition: string;
  managementIndicators: {
    adherence: string;
    absenteeism: string;
    clinicalEvolution: string;
    restrictions: string;
  };
  name: string;
  occupationalRisks: string[];
  psychosocialRisk: "Baixo" | "Medio" | "Alto" | "Critico";
  restrictions: string;
  sector: string;
  status: "Ativo" | "Afastado" | "Restricao";
  timeline: TimelineEvent[];
};

type FinanceRow = {
  amount: number;
  appointment: Appointment;
  status: ConsultationState;
  value: number;
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

const appointmentValues: Record<string, number> = {
  "Acolhimento Psicologico": 90,
  "Atendimento Nutricional": 84,
  "Clinico Geral": 72,
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  style: "currency",
});

const workerHealthRecords: WorkerHealthRecord[] = [
  {
    alerts: ["Risco psicossocial alto", "ASO vence em 30 dias", "Sem acolhimento psicologico no mes"],
    asoDueDate: "2026-06-08",
    birthDate: "1987-03-14",
    cbo: "8621-50",
    company: "Industria Horizonte",
    cpf: "987.654.321-00",
    ghe: "GHE-02 Producao",
    id: "record-rafael",
    jobPosition: "Operador de Linha",
    managementIndicators: {
      adherence: "Pesquisa comportamental concluida e plano de acolhimento pendente.",
      absenteeism: "2 faltas justificadas nos ultimos 90 dias.",
      clinicalEvolution: "Necessita acompanhamento psicologico inicial.",
      restrictions: "Sem restricao laboral ativa.",
    },
    name: "Rafael Moreira Lima",
    occupationalRisks: ["Ruido intermitente", "Movimentos repetitivos", "Risco psicossocial elevado"],
    psychosocialRisk: "Alto",
    restrictions: "Sem restricoes vigentes",
    sector: "Producao",
    status: "Ativo",
    timeline: [
      {
        area: "psicologica",
        attachments: ["pesquisa-clima-rafael.pdf"],
        conduct: "Sugerido acolhimento psicologico e orientacao sobre sinais de sobrecarga.",
        critical: true,
        eventType: "Pesquisa de Clima Organizacional",
        id: "event-rafael-001",
        nextStep: "Agendar acolhimento psicologico",
        professional: "Sistema PRONUS",
        secrecy: "Sigiloso",
        status: "Aberto",
        summary: "Questionario concluido com score alto para demandas emocionais e fadiga.",
        timestamp: "2026-05-08T16:45:00",
      },
      {
        area: "ocupacional",
        attachments: ["aso-periodico-2025.pdf"],
        conduct: "Manter acompanhamento do PGR e revisar exposicao a ruido no setor.",
        critical: false,
        eventType: "ASO periodico",
        id: "event-rafael-002",
        nextStep: "Renovar ASO ate 08/06/2026",
        professional: "Dra. Renata Campos / CRM-SP 998877",
        secrecy: "Administrativo",
        status: "Pendente",
        summary: "ASO periodico vigente, com vencimento proximo.",
        timestamp: "2025-06-08T09:10:00",
      },
      {
        area: "ocupacional",
        attachments: ["pgr-ghe-02.pdf"],
        conduct: "Usar protetor auricular e registrar treinamento de NR-06.",
        critical: false,
        eventType: "Vinculo PGR/PCMSO",
        id: "event-rafael-003",
        nextStep: "Conferir aderencia ao EPI no proximo levantamento",
        professional: "Tecnico SST PRONUS",
        secrecy: "Administrativo",
        status: "Assinado",
        summary: "Trabalhador vinculado ao GHE-02, com exposicao a ruido intermitente.",
        timestamp: "2025-03-22T11:30:00",
      },
    ],
  },
  {
    alerts: ["Queixa ergonomica recorrente", "AET recomendada para posto administrativo"],
    asoDueDate: "2026-09-12",
    birthDate: "1991-10-22",
    cbo: "4110-10",
    company: "Industria Horizonte",
    cpf: "024.196.844-51",
    ghe: "GHE-05 Administrativo",
    id: "record-carla",
    jobPosition: "Assistente Administrativo",
    managementIndicators: {
      adherence: "Cadastro validado e sem pendencia documental.",
      absenteeism: "Sem afastamento registrado.",
      clinicalEvolution: "Monitorar resposta a orientacao ergonomica.",
      restrictions: "Sem restricao laboral ativa.",
    },
    name: "Carla Souza Andrade",
    occupationalRisks: ["Postura sentada prolongada", "Carga cognitiva", "Movimentos repetitivos"],
    psychosocialRisk: "Medio",
    restrictions: "Sem restricoes vigentes",
    sector: "Administrativo",
    status: "Ativo",
    timeline: [
      {
        area: "medica",
        attachments: ["orientacao-ergonomica.pdf"],
        conduct: "Orientadas pausas, ajuste de monitor e alternancia postural.",
        critical: false,
        eventType: "Consulta Clinico Geral",
        id: "event-carla-001",
        nextStep: "Reavaliar dor cervical se persistir por 15 dias",
        professional: "Carlos Henrique Nunes / CRM-SP 123456",
        secrecy: "Clinico",
        status: "Assinado",
        summary: "Relato de desconforto cervical ao fim da jornada.",
        timestamp: "2026-04-28T10:00:00",
      },
      {
        area: "ocupacional",
        attachments: ["inventario-riscos-ghe-05.pdf"],
        conduct: "Avaliar necessidade de AET e reforcar pausas.",
        critical: false,
        eventType: "Inventario de riscos",
        id: "event-carla-002",
        nextStep: "Consolidar AET se novas queixas forem registradas",
        professional: "Tecnico SST PRONUS",
        secrecy: "Administrativo",
        status: "Concluido",
        summary: "GHE administrativo com risco ergonomico mapeado.",
        timestamp: "2026-03-18T14:20:00",
      },
    ],
  },
  {
    alerts: ["Primeiro atendimento nutricional", "Rotina de turnos"],
    asoDueDate: "2027-01-20",
    birthDate: "1984-05-02",
    cbo: "7842-05",
    company: "Rede Norte",
    cpf: "321.654.987-10",
    ghe: "GHE-01 Logistica",
    id: "record-marcos",
    jobPosition: "Auxiliar de Logistica",
    managementIndicators: {
      adherence: "Acompanhamento nutricional iniciado.",
      absenteeism: "1 falta justificada nos ultimos 90 dias.",
      clinicalEvolution: "Aguardando primeira evolucao nutricional.",
      restrictions: "Sem restricao laboral ativa.",
    },
    name: "Marcos Vinicius Teixeira",
    occupationalRisks: ["Esforco fisico", "Levantamento manual de carga", "Trabalho em turnos"],
    psychosocialRisk: "Baixo",
    restrictions: "Sem restricoes vigentes",
    sector: "Logistica",
    status: "Ativo",
    timeline: [
      {
        area: "nutricional",
        attachments: [],
        conduct: "Mapear rotina alimentar, hidratacao e metas simples.",
        critical: false,
        eventType: "Consulta Nutricional",
        id: "event-marcos-001",
        nextStep: "Registrar plano alimentar inicial",
        professional: "Marina Duarte / CRN-3 77889",
        secrecy: "Clinico",
        status: "Aberto",
        summary: "Primeiro atendimento nutricional agendado para levantamento de rotina.",
        timestamp: "2026-05-09T11:00:00",
      },
    ],
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
  const [activeModule, setActiveModule] = useState<ActiveModule>("care");
  const [recordQuery, setRecordQuery] = useState("");
  const [hasSearchedRecords, setHasSearchedRecords] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WorkerHealthRecord | null>(null);

  const selectedAppointment = useMemo<Appointment>(
    () => appointments.find((appointment) => appointment.id === selectedId) ?? appointments[0]!,
    [selectedId],
  );
  const selectedStatus = consultationStatus[selectedAppointment.id] ?? "waiting";
  const selectedIndex = appointments.findIndex((appointment) => appointment.id === selectedAppointment.id);
  const currentInCallId = appointments.find((appointment) => consultationStatus[appointment.id] === "in_call")?.id;
  const recordSummary = buildRecordSummary(selectedAppointment);
  const recordResults = useMemo(() => {
    if (!hasSearchedRecords) {
      return [];
    }

    const normalizedQuery = recordQuery.trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      return workerHealthRecords;
    }

    return workerHealthRecords.filter((record) =>
      [record.name, record.cpf, record.company, record.sector, record.jobPosition, record.psychosocialRisk]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [hasSearchedRecords, recordQuery]);

  const financeRows = useMemo(
    () =>
      appointments.map((appointment) => {
        const status = consultationStatus[appointment.id] ?? "waiting";
        const value = appointmentValues[appointment.specialty] ?? 72;

        return {
          appointment,
          amount: status === "finalized" ? value : 0,
          status,
          value,
        };
      }),
    [consultationStatus],
  );
  const finalizedCount = financeRows.filter((row) => row.status === "finalized").length;
  const pendingFinalizationCount = financeRows.filter((row) => row.status === "disconnected").length;
  const totalToPay = financeRows.reduce((total, row) => total + row.amount, 0);

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

  function openAppointmentFromFinance(appointmentId: string) {
    setSelectedId(appointmentId);
    setActiveModule("care");
    setNoteMessage("Atendimento aberto para revisar anamnese antes da finalizacao.");
  }

  function searchRecords(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSearchedRecords(true);
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

        <ModuleBar activeModule={activeModule} onChange={setActiveModule} />

        {activeModule === "care" && (
        <section className="grid min-h-[calc(100vh-12rem)] gap-5 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
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
        )}

        {activeModule === "finance" && (
          <ProfessionalFinancePanel
            finalizedCount={finalizedCount}
            onOpenAppointment={openAppointmentFromFinance}
            pendingFinalizationCount={pendingFinalizationCount}
            rows={financeRows}
            totalToPay={totalToPay}
          />
        )}

        {activeModule === "records" && (
          <IntegratedRecordsPanel
            hasSearched={hasSearchedRecords}
            query={recordQuery}
            results={recordResults}
            onOpenRecord={setSelectedRecord}
            onQueryChange={setRecordQuery}
            onSearch={searchRecords}
          />
        )}
      </div>

      {selectedRecord !== null && (
        <HealthRecordModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}

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

function ModuleBar({
  activeModule,
  onChange,
}: Readonly<{ activeModule: ActiveModule; onChange: (module: ActiveModule) => void }>) {
  const modules: Array<{ detail: string; icon: ReactNode; id: ActiveModule; label: string }> = [
    {
      detail: "Agenda, video e anamnese",
      icon: <VideoIcon />,
      id: "care",
      label: "Atendimento",
    },
    {
      detail: "Finalizadas e pendentes",
      icon: <MoneyIcon />,
      id: "finance",
      label: "Meu financeiro",
    },
    {
      detail: "Busca e timeline clinica",
      icon: <RecordIcon />,
      id: "records",
      label: "Prontuario",
    },
  ];

  return (
    <nav className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm" aria-label="Modulos do profissional">
      <div className="grid gap-2 md:grid-cols-3">
        {modules.map((module) => {
          const active = activeModule === module.id;

          return (
            <button
              key={module.id}
              className={`flex items-center gap-3 rounded-md border px-4 py-3 text-left transition ${
                active
                  ? "border-pronus-primary bg-pronus-primary text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-pronus-primary/40 hover:bg-slate-50"
              }`}
              type="button"
              onClick={() => onChange(module.id)}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                  active ? "bg-white/15 text-white" : "bg-pronus-primary/10 text-pronus-primary"
                }`}
              >
                {module.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{module.label}</span>
                <span className={`mt-0.5 block text-xs ${active ? "text-white/80" : "text-slate-500"}`}>
                  {module.detail}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function ProfessionalFinancePanel({
  finalizedCount,
  onOpenAppointment,
  pendingFinalizationCount,
  rows,
  totalToPay,
}: Readonly<{
  finalizedCount: number;
  onOpenAppointment: (appointmentId: string) => void;
  pendingFinalizationCount: number;
  rows: FinanceRow[];
  totalToPay: number;
}>) {
  return (
    <section className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <MetricTile label="Consultas finalizadas" value={String(finalizedCount)} />
        <MetricTile label="Pendentes de finalizacao" tone="warning" value={String(pendingFinalizationCount)} />
        <MetricTile label="Valor previsto para pagamento" value={currencyFormatter.format(totalToPay)} />
      </div>

      <article className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <PanelHeader
          detail="Somente consultas finalizadas entram no pagamento do profissional"
          title="Meu financeiro"
        />
        <div className="overflow-x-auto p-4">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Horario</th>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3">Especialidade</th>
                <th className="px-4 py-3">Status clinico</th>
                <th className="px-4 py-3 text-right">Valor tabela</th>
                <th className="px-4 py-3 text-right">Valor a pagar</th>
                <th className="px-4 py-3 text-right">Acao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row) => {
                const canAdjust = row.status === "disconnected";

                return (
                  <tr key={row.appointment.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-950">
                      {timeLabel(row.appointment.scheduledAt)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-950">{row.appointment.clientName}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{row.appointment.company}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.appointment.specialty}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                          row.status === "finalized"
                            ? "bg-blue-50 text-blue-800"
                            : row.status === "disconnected"
                              ? "bg-red-50 text-red-800"
                              : row.status === "in_call"
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {statusLabels[row.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {currencyFormatter.format(row.value)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-950">
                      {currencyFormatter.format(row.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="rounded-md border border-pronus-primary px-3 py-2 text-xs font-semibold text-pronus-primary transition hover:bg-pronus-primary hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                        disabled={!canAdjust}
                        title={
                          canAdjust
                            ? "Abrir atendimento para ajustar anamnese"
                            : "A acao fica disponivel quando a chamada foi encerrada e a consulta ainda nao foi finalizada"
                        }
                        type="button"
                        onClick={() => onOpenAppointment(row.appointment.id)}
                      >
                        Ajustar anamnese
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

function IntegratedRecordsPanel({
  hasSearched,
  onOpenRecord,
  onQueryChange,
  onSearch,
  query,
  results,
}: Readonly<{
  hasSearched: boolean;
  onOpenRecord: (record: WorkerHealthRecord) => void;
  onQueryChange: (value: string) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
  query: string;
  results: WorkerHealthRecord[];
}>) {
  return (
    <section className="space-y-5">
      <article className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <PanelHeader
          detail="A busca nao carrega dados por padrao para proteger o sigilo"
          title="Prontuario Integrado de Saude do Trabalhador"
        />
        <form className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_auto]" onSubmit={onSearch}>
          <label className="text-xs font-semibold uppercase text-slate-500">
            Buscar trabalhador
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm font-normal normal-case text-slate-900 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
              placeholder="Digite nome, CPF, empresa, setor, cargo ou risco"
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </label>
          <button
            className="self-end rounded-md bg-pronus-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-pronus-primary/90"
            type="submit"
          >
            Buscar
          </button>
        </form>
      </article>

      {!hasSearched && (
        <EmptyState
          title="Nenhum prontuario carregado"
          text="Use a busca para localizar um trabalhador e abrir a timeline integrada."
        />
      )}

      {hasSearched && results.length === 0 && (
        <EmptyState
          title="Nenhum resultado encontrado"
          text="Revise o termo pesquisado ou busque por parte do nome, CPF, empresa, setor ou cargo."
        />
      )}

      {results.length > 0 && (
        <article className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto p-4">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Trabalhador</th>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Setor</th>
                  <th className="px-4 py-3">Cargo/CBO</th>
                  <th className="px-4 py-3">Risco psicossocial</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Acao</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {results.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-950">{record.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{record.cpf}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{record.company}</td>
                    <td className="px-4 py-3 text-slate-600">{record.sector}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {record.jobPosition}
                      <span className="mt-0.5 block text-xs text-slate-500">CBO {record.cbo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge risk={record.psychosocialRisk} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{record.status}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="rounded-md bg-pronus-primary px-3 py-2 text-xs font-semibold text-white hover:bg-pronus-primary/90"
                        type="button"
                        onClick={() => onOpenRecord(record)}
                      >
                        Prontuario
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}
    </section>
  );
}

function HealthRecordModal({
  onClose,
  record,
}: Readonly<{ onClose: () => void; record: WorkerHealthRecord }>) {
  const [areaFilter, setAreaFilter] = useState("Todos");
  const [criticalFilter, setCriticalFilter] = useState("Todos");
  const [professionalFilter, setProfessionalFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const professionals = Array.from(new Set(record.timeline.map((event) => event.professional)));
  const filteredTimeline = record.timeline.filter((event) => {
    const matchesArea = areaFilter === "Todos" || event.area === areaFilter;
    const matchesCritical = criticalFilter === "Todos" || (criticalFilter === "Criticos" ? event.critical : !event.critical);
    const matchesProfessional = professionalFilter === "Todos" || event.professional === professionalFilter;
    const matchesStatus = statusFilter === "Todos" || event.status === statusFilter;

    return matchesArea && matchesCritical && matchesProfessional && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-6">
      <section className="w-full max-w-6xl rounded-lg border border-slate-200 bg-white shadow-xl">
        <header className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-pronus-primary">
              Prontuario Integrado de Saude do Trabalhador
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">{record.name}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {record.company} / {record.sector} / {record.jobPosition}
            </p>
          </div>
          <button
            className="self-start rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-pronus-primary hover:text-pronus-primary"
            type="button"
            onClick={onClose}
          >
            Fechar
          </button>
        </header>

        <div className="grid gap-4 p-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <InfoBlock title="Camada Ocupacional">
              <InfoLine label="CPF" value={record.cpf} />
              <InfoLine label="Nascimento" value={new Date(record.birthDate).toLocaleDateString("pt-BR")} />
              <InfoLine label="GHE" value={record.ghe} />
              <InfoLine label="ASO" value={`Vence em ${new Date(record.asoDueDate).toLocaleDateString("pt-BR")}`} />
              <InfoLine label="Restricao" value={record.restrictions} />
              <div className="mt-3 flex flex-wrap gap-2">
                {record.occupationalRisks.map((risk) => (
                  <span key={risk} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {risk}
                  </span>
                ))}
              </div>
            </InfoBlock>

            <InfoBlock title="Camada de Inteligencia e Gestao">
              <InfoLine label="Absenteismo" value={record.managementIndicators.absenteeism} />
              <InfoLine label="Adesao" value={record.managementIndicators.adherence} />
              <InfoLine label="Evolucao clinica" value={record.managementIndicators.clinicalEvolution} />
              <InfoLine label="Restricoes" value={record.managementIndicators.restrictions} />
              <div className="mt-3">
                <RiskBadge risk={record.psychosocialRisk} />
              </div>
            </InfoBlock>

            <InfoBlock title="Alertas">
              <ul className="space-y-2 text-sm text-slate-600">
                {record.alerts.map((alert) => (
                  <li key={alert} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    <span>{alert}</span>
                  </li>
                ))}
              </ul>
            </InfoBlock>
          </aside>

          <section className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-base font-semibold text-slate-950">Filtros da timeline</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-4">
                <FilterSelect
                  label="Area"
                  value={areaFilter}
                  options={["Todos", "ocupacional", "medica", "psicologica", "nutricional"]}
                  onChange={setAreaFilter}
                />
                <FilterSelect
                  label="Profissional"
                  value={professionalFilter}
                  options={["Todos", ...professionals]}
                  onChange={setProfessionalFilter}
                />
                <FilterSelect
                  label="Status"
                  value={statusFilter}
                  options={["Todos", "Aberto", "Assinado", "Pendente", "Concluido"]}
                  onChange={setStatusFilter}
                />
                <FilterSelect
                  label="Eventos"
                  value={criticalFilter}
                  options={["Todos", "Criticos", "Nao criticos"]}
                  onChange={setCriticalFilter}
                />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-4 py-3">
                <h3 className="text-base font-semibold text-slate-950">Timeline unica do trabalhador</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Eventos ocupacionais, medicos, psicologicos e nutricionais em ordem cronologica.
                </p>
              </div>
              <div className="space-y-3 p-4">
                {filteredTimeline.map((event) => (
                  <article key={event.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {new Date(event.timestamp).toLocaleString("pt-BR", {
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                        <h4 className="mt-1 text-base font-semibold text-slate-950">{event.eventType}</h4>
                        <p className="mt-1 text-sm text-slate-600">{event.summary}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-md bg-pronus-primary/10 px-2.5 py-1 text-xs font-semibold text-pronus-primary">
                          {event.area}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {event.secrecy}
                        </span>
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                            event.critical ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"
                          }`}
                        >
                          {event.critical ? "Critico" : "Nao critico"}
                        </span>
                      </div>
                    </div>
                    <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                      <InfoLine label="Profissional" value={event.professional} />
                      <InfoLine label="Status" value={event.status} />
                      <InfoLine label="Conduta" value={event.conduct} />
                      <InfoLine label="Proximo passo" value={event.nextStep} />
                    </dl>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {event.attachments.length > 0 ? (
                        event.attachments.map((attachment) => (
                          <span
                            key={attachment}
                            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600"
                          >
                            {attachment}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-medium text-slate-500">Sem anexos</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function MetricTile({
  label,
  tone = "default",
  value,
}: Readonly<{ label: string; tone?: "default" | "warning"; value: string }>) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${tone === "warning" ? "text-red-700" : "text-slate-950"}`}>
        {value}
      </p>
    </article>
  );
}

function EmptyState({ text, title }: Readonly<{ text: string; title: string }>) {
  return (
    <section className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-8 text-center">
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">{text}</p>
    </section>
  );
}

function RiskBadge({ risk }: Readonly<{ risk: WorkerHealthRecord["psychosocialRisk"] }>) {
  const className =
    risk === "Critico"
      ? "bg-red-100 text-red-900"
      : risk === "Alto"
        ? "bg-red-50 text-red-800"
        : risk === "Medio"
          ? "bg-amber-50 text-amber-800"
          : "bg-emerald-50 text-emerald-800";

  return <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${className}`}>{risk}</span>;
}

function InfoBlock({ children, title }: Readonly<{ children: ReactNode; title: string }>) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

function InfoLine({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="mt-0.5 block text-sm font-medium text-slate-700">{value}</span>
    </div>
  );
}

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: Readonly<{ label: string; onChange: (value: string) => void; options: string[]; value: string }>) {
  return (
    <label className="text-xs font-semibold uppercase text-slate-500">
      {label}
      <select
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case text-slate-900 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
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

function VideoIcon() {
  return (
    <SvgShell>
      <path d="M4 7h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
      <path d="m16 11 6-3v8l-6-3" />
    </SvgShell>
  );
}

function MoneyIcon() {
  return (
    <SvgShell>
      <path d="M4 19V5" />
      <path d="M20 19H4" />
      <path d="M8 16v-5" />
      <path d="M12 16V8" />
      <path d="M16 16v-3" />
    </SvgShell>
  );
}

function RecordIcon() {
  return (
    <SvgShell>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 11h6" />
      <path d="M9 15h6" />
      <path d="M9 19h3" />
    </SvgShell>
  );
}
