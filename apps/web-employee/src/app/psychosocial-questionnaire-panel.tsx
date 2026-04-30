"use client";

import type { RiskLevel } from "@pronus/types";
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
  fullName: string;
}

interface PsychosocialQuestion {
  id: string;
  order: number;
  factor: string;
  prompt: string;
  reverseScored: boolean;
  options?: Array<{ value: number; label: string }>;
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

interface SavedQuestionnaireState {
  isFinalized: boolean;
  receipt: PsychosocialAnswerReceipt | null;
  scores: Record<string, number>;
}

interface QuestionBlock {
  id: string;
  title: string;
  questions: PsychosocialQuestion[];
}

const defaultAnswerOptions = [
  { label: "Discordo totalmente", value: 1 },
  { label: "Discordo", value: 2 },
  { label: "Neutro", value: 3 },
  { label: "Concordo", value: 4 },
  { label: "Concordo totalmente", value: 5 },
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

function readSavedState(storageKey: string): SavedQuestionnaireState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(storageKey);

  if (raw === null) {
    return null;
  }

  try {
    return JSON.parse(raw) as SavedQuestionnaireState;
  } catch {
    return null;
  }
}

function writeSavedState(storageKey: string, state: SavedQuestionnaireState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

function classifyScore(score: number): RiskLevel {
  if (score >= 4.5) {
    return "critical";
  }

  if (score >= 3.5) {
    return "high";
  }

  if (score >= 2.5) {
    return "moderate";
  }

  return "low";
}

function localReceipt(scores: Record<string, number>): PsychosocialAnswerReceipt {
  const values = Object.values(scores);
  const averageScore =
    values.length === 0
      ? 0
      : Math.round((values.reduce((total, value) => total + value, 0) / values.length) * 10) / 10;

  return {
    averageScore,
    createdAt: new Date().toISOString(),
    id: `local-${Date.now()}`,
    riskLevel: classifyScore(averageScore),
  };
}

function buildQuestionBlocks(questions: PsychosocialQuestion[]): QuestionBlock[] {
  const sortedQuestions = [...questions].sort((first, second) => first.order - second.order);
  const firstQuestions = sortedQuestions.slice(0, 2);
  const remainingQuestions = sortedQuestions.slice(2);
  const blocks: QuestionBlock[] = [];

  if (firstQuestions.length > 0) {
    blocks.push({
      id: "inicio",
      questions: firstQuestions,
      title: "Inicio da pesquisa",
    });
  }

  for (const question of remainingQuestions) {
    const existingBlock = blocks.find((block) => block.id === question.factor);

    if (existingBlock === undefined) {
      blocks.push({
        id: question.factor,
        questions: [question],
        title: question.factor,
      });
    } else {
      existingBlock.questions.push(question);
    }
  }

  return blocks;
}

function isBlockAnswered(block: QuestionBlock | undefined, scores: Record<string, number>) {
  return block?.questions.every((question) => scores[question.id] !== undefined) === true;
}

function firstIncompleteBlockIndex(blocks: QuestionBlock[], scores: Record<string, number>) {
  const index = blocks.findIndex((block) => !isBlockAnswered(block, scores));

  return index === -1 ? Math.max(blocks.length - 1, 0) : index;
}

export function PsychosocialQuestionnairePanel({
  onCompleted,
  profile,
}: Readonly<{
  onCompleted?: (receipt: PsychosocialAnswerReceipt) => void;
  profile: EmployeeAccessProfile;
}>) {
  const [questions, setQuestions] = useState<PsychosocialQuestion[]>([]);
  const [campaigns, setCampaigns] = useState<PsychosocialCampaign[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [receipt, setReceipt] = useState<PsychosocialAnswerReceipt | null>(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSyncedFinalized, setHasSyncedFinalized] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);

  const storageKey = useMemo(() => `pronus:copsq:${profile.employeeId}`, [profile.employeeId]);

  useEffect(() => {
    const savedState = readSavedState(storageKey);

    setScores(savedState?.scores ?? {});
    setIsFinalized(savedState?.isFinalized ?? false);
    setReceipt(savedState?.receipt ?? null);
    setHasSyncedFinalized(false);
    if (savedState?.isFinalized === true && savedState.receipt !== null) {
      onCompleted?.(savedState.receipt);
    }
    setError(null);
  }, [onCompleted, storageKey]);

  useEffect(() => {
    let shouldIgnore = false;

    async function loadQuestionnaire() {
      setIsLoading(true);
      setError(null);

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
  const questionBlocks = useMemo(() => buildQuestionBlocks(questions), [questions]);
  const currentBlock = questionBlocks[currentBlockIndex];
  const currentBlockAnswered = isBlockAnswered(currentBlock, scores);
  const isLastBlock = currentBlockIndex >= questionBlocks.length - 1;
  const progress =
    questions.length === 0 ? 0 : Math.round((answeredQuestions / questions.length) * 100);
  const canSubmit =
    selectedCampaign !== undefined &&
    answeredQuestions === questions.length &&
    !isSubmitting &&
    !isFinalized;
  const linkTone = isFinalized
    ? "border-sky-200 bg-sky-50 text-sky-700"
    : "border-red-200 bg-red-50 text-red-700";

  function openQuestionnaire() {
    setCurrentBlockIndex(firstIncompleteBlockIndex(questionBlocks, scores));
    setShowCompletionMessage(isFinalized);
    setIsModalOpen(true);
  }

  function persist(nextScores: Record<string, number>, nextFinalized = isFinalized) {
    writeSavedState(storageKey, {
      isFinalized: nextFinalized,
      receipt,
      scores: nextScores,
    });
  }

  function setAnswer(questionId: string, score: number) {
    if (isFinalized) {
      return;
    }

    setScores((current) => {
      const next = { ...current, [questionId]: score };

      writeSavedState(storageKey, {
        isFinalized: false,
        receipt: null,
        scores: next,
      });

      return next;
    });
  }

  useEffect(() => {
    if (
      !isFinalized ||
      hasSyncedFinalized ||
      selectedCampaign === undefined ||
      questions.length === 0 ||
      answeredQuestions !== questions.length
    ) {
      return;
    }

    let shouldIgnore = false;
    const campaignId = selectedCampaign.id;

    async function syncFinalizedQuestionnaire() {
      try {
        const response = await fetch(`${getApiUrl()}/psychosocial/answers`, {
          body: JSON.stringify({
            campaignId,
            employeeId: profile.employeeId,
            scores: questions.map((question) => ({
              questionId: question.id,
              score: scores[question.id],
            })),
            sectorName: profile.department,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });
        const payload = (await response.json()) as PsychosocialAnswerReceipt | { message?: string };

        if (!response.ok || shouldIgnore) {
          return;
        }

        const syncedReceipt = payload as PsychosocialAnswerReceipt;
        setReceipt(syncedReceipt);
        onCompleted?.(syncedReceipt);
        writeSavedState(storageKey, {
          isFinalized: true,
          receipt: syncedReceipt,
          scores,
        });
      } finally {
        if (!shouldIgnore) {
          setHasSyncedFinalized(true);
        }
      }
    }

    void syncFinalizedQuestionnaire();

    return () => {
      shouldIgnore = true;
    };
  }, [
    answeredQuestions,
    hasSyncedFinalized,
    isFinalized,
    onCompleted,
    profile.department,
    profile.employeeId,
    questions,
    scores,
    selectedCampaign,
    storageKey,
  ]);

  async function submitQuestionnaire() {
    if (selectedCampaign === undefined || !canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    let nextReceipt = localReceipt(scores);

    try {
      const response = await fetch(`${getApiUrl()}/psychosocial/answers`, {
        body: JSON.stringify({
          campaignId: selectedCampaign.id,
          employeeId: profile.employeeId,
          scores: questions.map((question) => ({
            questionId: question.id,
            score: scores[question.id],
          })),
          sectorName: profile.department,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as PsychosocialAnswerReceipt | { message?: string };

      if (!response.ok) {
        throw new Error(responseMessage(payload, "Nao foi possivel enviar o questionario."));
      }

      nextReceipt = payload as PsychosocialAnswerReceipt;
    } catch {
      setError(
        "Pesquisa finalizada no portal. A sincronizacao sera refeita quando a API responder.",
      );
    } finally {
      setReceipt(nextReceipt);
      setIsFinalized(true);
      setHasSyncedFinalized(true);
      onCompleted?.(nextReceipt);
      setShowCompletionMessage(true);
      writeSavedState(storageKey, {
        isFinalized: true,
        receipt: nextReceipt,
        scores,
      });
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section className={`rounded-lg border px-4 py-3 ${linkTone}`}>
        <button
          className="flex w-full flex-col text-left"
          type="button"
          onClick={openQuestionnaire}
        >
          <span className="text-sm font-semibold">
            {isFinalized
              ? "Pesquisa comportamental concluida"
              : "Pesquisa comportamental - Clique para responder"}
          </span>
          <span className="mt-1 text-xs">
            {isFinalized
              ? "Registro finalizado. A PRONUS acompanhara os dados de forma agregada."
              : "O progresso e salvo automaticamente a cada resposta."}
          </span>
        </button>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
          <section className="flex max-h-[92vh] w-full max-w-5xl flex-col rounded-lg bg-white shadow-xl">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Pesquisa de Clima Organizacional
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {profile.fullName} / {profile.companyTradeName} / {profile.department}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Fechar pesquisa"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                  type="button"
                  onClick={() => {
                    persist(scores);
                    setIsModalOpen(false);
                  }}
                >
                  Fechar
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-5 py-5">
              <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
                <aside className="sticky top-4 self-start rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Termometro de respostas
                  </p>
                  <strong className="mt-2 block text-4xl font-semibold text-slate-950">
                    {progress}%
                  </strong>
                  <div className="mt-4 h-3 rounded-full bg-white ring-1 ring-slate-200">
                    <div
                      className={`h-3 rounded-full ${
                        isFinalized ? "bg-sky-600" : "bg-pronus-primary"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {answeredQuestions}/{questions.length} respostas salvas automaticamente.
                  </p>
                </aside>

                <div>
                  {showCompletionMessage ? (
                    <CompletionMessage onClose={() => setIsModalOpen(false)} />
                  ) : isLoading ? (
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                      Carregando pesquisa...
                    </div>
                  ) : selectedCampaign === undefined ? (
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                      Nenhuma campanha ativa foi localizada para esta empresa.
                    </div>
                  ) : currentBlock === undefined ? (
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                      Nenhuma pergunta disponivel para este ciclo.
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
                        <p className="text-xs font-semibold uppercase text-pronus-primary">
                          Bloco {currentBlockIndex + 1} de {questionBlocks.length}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-slate-950">
                          {currentBlock.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          Responda este bloco para seguir para a proxima etapa.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {currentBlock.questions.map((question) => (
                          <article
                            key={question.id}
                            className="rounded-md border border-slate-200 bg-slate-50 p-4"
                          >
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                              <h4 className="text-sm font-semibold text-slate-900">
                                {question.prompt}
                              </h4>
                              <span className="text-xs font-semibold text-slate-500">
                                {scores[question.id] === undefined ? "Pendente" : "Respondida"}
                              </span>
                            </div>

                            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                              {(question.options ?? defaultAnswerOptions).map((option) => {
                                const isSelected = scores[question.id] === option.value;

                                return (
                                  <button
                                    key={option.value}
                                    aria-label={`${option.value} - ${option.label}`}
                                    aria-pressed={isSelected}
                                    className={`min-h-11 rounded-md border px-2 py-2 text-xs font-semibold leading-snug transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                      isSelected
                                        ? "border-pronus-primary bg-pronus-primary text-white"
                                        : "border-slate-300 bg-white text-slate-700 hover:border-pronus-primary"
                                    }`}
                                    disabled={isFinalized}
                                    type="button"
                                    onClick={() => setAnswer(question.id, option.value)}
                                  >
                                    {option.label}
                                  </button>
                                );
                              })}
                            </div>
                          </article>
                        ))}
                      </div>

                      <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={currentBlockIndex === 0 || isSubmitting}
                          type="button"
                          onClick={() =>
                            setCurrentBlockIndex((current) => Math.max(current - 1, 0))
                          }
                        >
                          Voltar
                        </button>
                        {isLastBlock ? (
                          <button
                            className="rounded-md bg-pronus-primary px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={!canSubmit}
                            type="button"
                            onClick={() => void submitQuestionnaire()}
                          >
                            {isSubmitting ? "Finalizando..." : "Finalizar pesquisa"}
                          </button>
                        ) : (
                          <button
                            className="rounded-md bg-pronus-primary px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={!currentBlockAnswered || isSubmitting}
                            type="button"
                            onClick={() =>
                              setCurrentBlockIndex((current) =>
                                Math.min(current + 1, questionBlocks.length - 1),
                              )
                            }
                          >
                            Proximo
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {error !== null && (
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                  {error}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function CompletionMessage({ onClose }: Readonly<{ onClose: () => void }>) {
  return (
    <section className="rounded-lg border border-sky-200 bg-sky-50 p-5 text-center">
      <p className="text-sm leading-6 text-slate-700">
        Agradecemos por dedicar seu tempo para responder à pesquisa — sua participação é muito
        importante para entendermos melhor o dia a dia na empresa.
        <br />
        Com isso, conseguimos evoluir continuamente e construir um ambiente cada vez mais positivo
        para todos 💙
      </p>
      <button
        className="mt-5 rounded-md bg-pronus-primary px-5 py-2.5 text-sm font-semibold text-white"
        type="button"
        onClick={onClose}
      >
        Fechar
      </button>
    </section>
  );
}
