"use client";

import type { RiskLevel } from "@pronus/types";
import { riskLevelColorClasses, riskLevelLabels } from "@pronus/ui";
import { useEffect, useMemo, useState } from "react";

type CampaignStatus =
  | "draft"
  | "active"
  | "threshold_reached"
  | "expired"
  | "extended"
  | "closed"
  | "analysis_in_progress"
  | "completed";

interface EmployeeAccessProfile {
  employeeId: string;
  companyTradeName: string;
  department: string;
}

interface PsychosocialQuestion {
  id: string;
  order: number;
  factor: string;
  prompt: string;
  reverseScored: boolean;
}

interface PsychosocialCampaign {
  id: string;
  companyTradeName: string;
  name: string;
  endDate: string;
  targetParticipants: number;
  responseCount: number;
  responseRate: number;
  status: CampaignStatus;
}

interface PsychosocialAnswerReceipt {
  id: string;
  averageScore: number;
  riskLevel: RiskLevel;
  createdAt: string;
}

const campaignStatusLabels: Record<CampaignStatus, string> = {
  draft: "Rascunho",
  active: "Ativa",
  threshold_reached: "Amostra atingida",
  expired: "Expirada",
  extended: "Prorrogada",
  closed: "Encerrada",
  analysis_in_progress: "Em analise",
  completed: "Concluida",
};

const answerOptions = [
  { value: 1, label: "1", description: "Discordo totalmente" },
  { value: 2, label: "2", description: "Discordo" },
  { value: 3, label: "3", description: "Neutro" },
  { value: 4, label: "4", description: "Concordo" },
  { value: 5, label: "5", description: "Concordo totalmente" },
];

const openCampaignStatuses = new Set<CampaignStatus>(["active", "threshold_reached", "extended"]);

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
}

function responseMessage(payload: unknown, fallback: string) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return fallback;
}

function campaignClasses(status: CampaignStatus) {
  if (status === "threshold_reached" || status === "completed") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (status === "active" || status === "analysis_in_progress") {
    return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
  }

  if (status === "expired") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
}

export function PsychosocialQuestionnairePanel({
  profile,
}: Readonly<{ profile: EmployeeAccessProfile }>) {
  const [questions, setQuestions] = useState<PsychosocialQuestion[]>([]);
  const [campaigns, setCampaigns] = useState<PsychosocialCampaign[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [receipt, setReceipt] = useState<PsychosocialAnswerReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let shouldIgnore = false;

    async function loadQuestionnaire() {
      setIsLoading(true);
      setError(null);
      setReceipt(null);
      setScores({});

      try {
        const apiUrl = getApiUrl();
        const [questionsResponse, campaignsResponse] = await Promise.all([
          fetch(`${apiUrl}/psychosocial/questions`),
          fetch(`${apiUrl}/psychosocial/campaigns`),
        ]);
        const questionsPayload = (await questionsResponse.json()) as unknown;
        const campaignsPayload = (await campaignsResponse.json()) as unknown;

        if (!questionsResponse.ok) {
          throw new Error(responseMessage(questionsPayload, "Questionario indisponivel"));
        }

        if (!campaignsResponse.ok) {
          throw new Error(responseMessage(campaignsPayload, "Campanhas indisponiveis"));
        }

        if (!shouldIgnore) {
          setQuestions(
            (questionsPayload as PsychosocialQuestion[]).sort((a, b) => a.order - b.order),
          );
          setCampaigns(campaignsPayload as PsychosocialCampaign[]);
        }
      } catch (loadError) {
        if (!shouldIgnore) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Nao foi possivel carregar o questionario psicossocial.",
          );
        }
      } finally {
        if (!shouldIgnore) {
          setIsLoading(false);
        }
      }
    }

    void loadQuestionnaire();

    return () => {
      shouldIgnore = true;
    };
  }, [profile.employeeId]);

  const selectedCampaign = useMemo(
    () =>
      campaigns.find(
        (campaign) =>
          campaign.companyTradeName === profile.companyTradeName &&
          openCampaignStatuses.has(campaign.status),
      ),
    [campaigns, profile.companyTradeName],
  );
  const answeredQuestions = questions.filter(
    (question) => scores[question.id] !== undefined,
  ).length;
  const progress =
    questions.length === 0 ? 0 : Math.round((answeredQuestions / questions.length) * 100);
  const canSubmit =
    selectedCampaign !== undefined && answeredQuestions === questions.length && !isSubmitting;

  async function submitQuestionnaire() {
    if (selectedCampaign === undefined) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setReceipt(null);

    try {
      const response = await fetch(`${getApiUrl()}/psychosocial/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId: selectedCampaign.id,
          employeeId: profile.employeeId,
          sectorName: profile.department,
          scores: questions.map((question) => ({
            questionId: question.id,
            score: scores[question.id],
          })),
        }),
      });
      const payload = (await response.json()) as PsychosocialAnswerReceipt | { message?: string };

      if (!response.ok) {
        setError(responseMessage(payload, "Nao foi possivel enviar o questionario."));
        return;
      }

      setReceipt(payload as PsychosocialAnswerReceipt);
    } catch {
      setError("Nao foi possivel conectar a API local.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="border-t border-slate-200 bg-white px-5 py-5 lg:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Questionario psicossocial</h2>
          <p className="mt-1 text-sm text-slate-600">
            {profile.companyTradeName} / {profile.department}
          </p>
        </div>

        {selectedCampaign !== undefined && (
          <span
            className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${campaignClasses(
              selectedCampaign.status,
            )}`}
          >
            {campaignStatusLabels[selectedCampaign.status]}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
          Carregando campanha psicossocial...
        </div>
      ) : selectedCampaign === undefined ? (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
          Nenhuma campanha psicossocial ativa foi localizada para esta empresa.
        </div>
      ) : (
        <div className="mt-4">
          <div className="grid gap-3 border-b border-slate-100 pb-4 sm:grid-cols-3">
            <article className="rounded-md bg-slate-100 px-3 py-2">
              <p className="text-xs font-medium text-slate-500">Adesao</p>
              <strong className="mt-1 block text-xl">{selectedCampaign.responseRate}%</strong>
            </article>
            <article className="rounded-md bg-slate-100 px-3 py-2">
              <p className="text-xs font-medium text-slate-500">Respostas</p>
              <strong className="mt-1 block text-xl">
                {selectedCampaign.responseCount}/{selectedCampaign.targetParticipants}
              </strong>
            </article>
            <article className="rounded-md bg-slate-100 px-3 py-2">
              <p className="text-xs font-medium text-slate-500">Prazo</p>
              <strong className="mt-1 block text-xl">
                {new Date(`${selectedCampaign.endDate}T00:00:00`).toLocaleDateString("pt-BR")}
              </strong>
            </article>
          </div>

          <div className="mt-4 h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-pronus-primary" style={{ width: `${progress}%` }} />
          </div>

          <div className="mt-4 space-y-3">
            {questions.map((question) => (
              <article
                key={question.id}
                className="rounded-md border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-pronus-primary">
                      {question.factor}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-slate-900">{question.prompt}</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {scores[question.id] === undefined ? "Pendente" : "Respondida"}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-5 gap-2">
                  {answerOptions.map((option) => {
                    const isSelected = scores[question.id] === option.value;

                    return (
                      <button
                        key={option.value}
                        aria-label={`${option.label} - ${option.description}`}
                        aria-pressed={isSelected}
                        className={`rounded-md border px-2 py-2 text-sm font-semibold transition ${
                          isSelected
                            ? "border-pronus-primary bg-pronus-primary text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:border-pronus-primary"
                        }`}
                        type="button"
                        onClick={() =>
                          setScores((current) => ({ ...current, [question.id]: option.value }))
                        }
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>

          <button
            className="mt-4 rounded-md bg-pronus-primary px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canSubmit}
            type="button"
            onClick={() => void submitQuestionnaire()}
          >
            Enviar questionario
          </button>
        </div>
      )}

      {error !== null && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {receipt !== null && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
          Questionario enviado. Protocolo {receipt.id.slice(0, 8)} / indice agregado{" "}
          {receipt.averageScore} /{" "}
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${riskLevelColorClasses[receipt.riskLevel]}`}
          >
            {riskLevelLabels[receipt.riskLevel]}
          </span>
        </div>
      )}
    </div>
  );
}
