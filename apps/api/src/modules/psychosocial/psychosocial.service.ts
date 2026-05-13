import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import type {
  CopsoqCompanyAnalysis,
  CopsoqAxisId,
  CopsoqAxisRisk,
  CopsoqSectorAxisRisk,
  CreatePsychosocialCampaignInput,
  PsychosocialEmployeeAnswer,
  PsychosocialInterventionAction,
  PsychosocialAnswerReceipt,
  PsychosocialCampaign,
  PsychosocialCampaignStatus,
  PsychosocialQuestion,
  PsychosocialQuestionnaireProgress,
  PsychosocialQuestionScore,
  PsychosocialRiskLevel,
  PsychosocialSectorSignal,
  PsychosocialSummary,
  PsychosocialTechnicalReport,
  SavePsychosocialProgressInput,
  SubmitPsychosocialAnswerInput,
  UpdatePsychosocialCampaignInput,
} from "./psychosocial.types";
import { copsoqQuestions } from "./copsoq-questions";

const campaignStatuses = new Set<PsychosocialCampaignStatus>([
  "draft",
  "active",
  "threshold_reached",
  "expired",
  "extended",
  "closed",
  "analysis_in_progress",
  "completed",
]);
const minimumAnonymousGroupSize = 7;

function now(): string {
  return new Date().toISOString();
}

function requireText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new BadRequestException(`Campo obrigatorio invalido: ${field}`);
  }

  return value.trim();
}

function optionalText(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new BadRequestException(`Campo invalido: ${field}`);
  }

  return value.trim();
}

function normalizeDate(value: unknown, field: string): string {
  const rawDate = requireText(value, field);
  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`Data invalida: ${field}`);
  }

  return rawDate.slice(0, 10);
}

function normalizePositiveInteger(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new BadRequestException(`${field} deve ser um inteiro positivo`);
  }

  return value;
}

function optionalNonNegativeInteger(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new BadRequestException(`${field} deve ser um inteiro maior ou igual a zero`);
  }

  return value;
}

function normalizeStatus(value: unknown): PsychosocialCampaignStatus | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || !campaignStatuses.has(value as PsychosocialCampaignStatus)) {
    throw new BadRequestException("Status de campanha invalido");
  }

  return value as PsychosocialCampaignStatus;
}

function responseRate(responseCount: number, targetParticipants: number): number {
  if (targetParticipants <= 0) {
    return 0;
  }

  return Math.round((responseCount / targetParticipants) * 100);
}

function statusFromResponseRate(rate: number): PsychosocialCampaignStatus {
  return rate >= 89 ? "threshold_reached" : "active";
}

function classifyScore(score: number): PsychosocialRiskLevel {
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

function classifyRiskPercent(percent: number): PsychosocialRiskLevel {
  if (percent >= 75) {
    return "critical";
  }

  if (percent >= 60) {
    return "high";
  }

  if (percent >= 35) {
    return "moderate";
  }

  return "low";
}

function normalizeScore(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 5) {
    throw new BadRequestException("Resposta deve ser um numero inteiro entre 1 e 5");
  }

  return value;
}

function riskScoreForQuestion(question: PsychosocialQuestion, score: number): number {
  return question.reverseScored ? 6 - score : score;
}

function axisIdForQuestion(question: PsychosocialQuestion): CopsoqAxisId | undefined {
  if (question.factor === "Identificacao") {
    return undefined;
  }

  if (question.factor.startsWith("A1.") || question.factor.startsWith("A2.")) {
    return "work_demands";
  }

  if (question.factor.startsWith("A3.") || question.factor.startsWith("A4.")) {
    return "work_organization";
  }

  if (question.factor.startsWith("A5.") || question.factor.startsWith("A6.")) {
    return "relationships_leadership";
  }

  if (question.factor.startsWith("B1.") || question.factor.startsWith("B2.")) {
    return "company_worker_relation";
  }

  if (question.factor.startsWith("C1.")) {
    return "health_wellbeing";
  }

  return undefined;
}

function riskPercentFromScore(score: number): number {
  return Math.round(((score - 1) / 4) * 1000) / 10;
}

const startedAt = now();

const questions: PsychosocialQuestion[] = copsoqQuestions;

const copsoqAxes: Array<{ id: CopsoqAxisId; label: string }> = [
  {
    id: "work_demands",
    label: "Exigencias do Trabalho",
  },
  {
    id: "work_organization",
    label: "Organizacao e Conteudo do Trabalho",
  },
  {
    id: "relationships_leadership",
    label: "Relacoes Interpessoais e Lideranca",
  },
  {
    id: "company_worker_relation",
    label: "Relacao Empresa-Colaborador",
  },
  {
    id: "health_wellbeing",
    label: "Efeitos na Saude e Bem-estar",
  },
];

const seededCopsoqSectorRisk: Array<
  Omit<CopsoqSectorAxisRisk, "axes" | "accumulatedRiskLevel" | "priorityAxisId" | "priorityAxisLabel">
> = [
  {
    companyTradeName: "Industria Horizonte",
    sectorName: "Producao",
    responses: 75,
    accumulatedRiskPercent: 49,
    recommendation: "Atuar em carga de trabalho e clareza de prioridades sem expor respostas individuais.",
  },
  {
    companyTradeName: "Industria Horizonte",
    sectorName: "Manutencao",
    responses: 5,
    accumulatedRiskPercent: 68,
    recommendation: "Priorizar escuta tecnica e revisar escala, prontidao e suporte da lideranca.",
  },
  {
    companyTradeName: "Industria Horizonte",
    sectorName: "Administrativo",
    responses: 24,
    accumulatedRiskPercent: 61,
    recommendation: "Atacar efeitos de saude e bem-estar com acolhimento e revisao de demandas.",
  },
  {
    companyTradeName: "Industria Horizonte",
    sectorName: "Comercial",
    responses: 30,
    accumulatedRiskPercent: 72,
    recommendation: "Tratar efeitos em saude e bem-estar como prioridade setorial imediata.",
  },
  {
    companyTradeName: "Rede Norte",
    sectorName: "Atendimento",
    responses: 92,
    accumulatedRiskPercent: 36,
    recommendation: "Manter monitoramento, reforcar comunicacao e ampliar adesao da campanha.",
  },
  {
    companyTradeName: "Rede Norte",
    sectorName: "Logistica",
    responses: 84,
    accumulatedRiskPercent: 58,
    recommendation: "Atuar em exigencias do trabalho e previsibilidade de escala.",
  },
  {
    companyTradeName: "Rede Norte",
    sectorName: "Setores agregados",
    responses: 7,
    accumulatedRiskPercent: 43,
    recommendation: "Manter dados agregados por privacidade e observar tendencia na proxima campanha.",
  },
];

const seededCopsoqAxisBySector: Record<string, Partial<Record<CopsoqAxisId, number>>> = {
  Administrativo: {
    company_worker_relation: 54,
    health_wellbeing: 76,
    relationships_leadership: 55,
    work_demands: 61,
    work_organization: 58,
  },
  Atendimento: {
    company_worker_relation: 29,
    health_wellbeing: 39,
    relationships_leadership: 31,
    work_demands: 42,
    work_organization: 37,
  },
  Comercial: {
    company_worker_relation: 66,
    health_wellbeing: 84,
    relationships_leadership: 63,
    work_demands: 71,
    work_organization: 74,
  },
  Logistica: {
    company_worker_relation: 49,
    health_wellbeing: 55,
    relationships_leadership: 45,
    work_demands: 67,
    work_organization: 64,
  },
  Manutencao: {
    company_worker_relation: 63,
    health_wellbeing: 74,
    relationships_leadership: 71,
    work_demands: 78,
    work_organization: 56,
  },
  Producao: {
    company_worker_relation: 42,
    health_wellbeing: 53,
    relationships_leadership: 45,
    work_demands: 62,
    work_organization: 51,
  },
  "Setores agregados": {
    company_worker_relation: 41,
    health_wellbeing: 47,
    relationships_leadership: 39,
    work_demands: 48,
    work_organization: 43,
  },
};

interface PsychosocialStorageState {
  answers: PsychosocialEmployeeAnswer[];
  progress: PsychosocialQuestionnaireProgress[];
}

const campaigns: PsychosocialCampaign[] = [
  {
    id: "campaign-horizonte-2026-01",
    companyTradeName: "Industria Horizonte",
    name: "Campanha Psicossocial 2026 - Industria Horizonte",
    startDate: "2026-04-01",
    endDate: "2026-05-01",
    targetParticipants: 148,
    responseCount: 134,
    responseRate: 91,
    status: "threshold_reached",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "campaign-rede-norte-2026-01",
    companyTradeName: "Rede Norte",
    name: "Campanha Psicossocial 2026 - Rede Norte",
    startDate: "2026-04-10",
    endDate: "2026-05-10",
    targetParticipants: 326,
    responseCount: 251,
    responseRate: 77,
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
];

const seededAnswers: PsychosocialEmployeeAnswer[] = [
  {
    id: "answer-employee-001",
    campaignId: "campaign-horizonte-2026-01",
    companyTradeName: "Industria Horizonte",
    employeeId: "employee-001",
    sectorName: "Producao",
    averageScore: 2.2,
    riskLevel: "low",
    riskPercent: 30,
    createdAt: "2026-04-18T12:00:00.000Z",
  },
  {
    id: "answer-employee-002",
    campaignId: "campaign-horizonte-2026-01",
    companyTradeName: "Industria Horizonte",
    employeeId: "employee-002",
    sectorName: "Manutencao",
    averageScore: 3.9,
    riskPercent: 72.5,
    riskLevel: "high",
    createdAt: "2026-04-29T19:00:00.000Z",
  },
  {
    id: "answer-employee-003",
    campaignId: "campaign-horizonte-2026-01",
    companyTradeName: "Industria Horizonte",
    employeeId: "employee-003",
    sectorName: "Administrativo",
    averageScore: 3.7,
    riskPercent: 67.5,
    riskLevel: "high",
    createdAt: "2026-04-20T12:00:00.000Z",
  },
];

function workspaceRoot(): string {
  let current = process.cwd();

  while (true) {
    const packagePath = join(current, "package.json");

    if (
      existsSync(packagePath) &&
      readFileSync(packagePath, "utf8").includes('"name": "pronus-labor-360"')
    ) {
      return current;
    }

    const parent = dirname(current);

    if (parent === current) {
      return process.cwd();
    }

    current = parent;
  }
}

function psychosocialStatePath(): string {
  return join(workspaceRoot(), ".data", "psychosocial-state.json");
}

function emptyPsychosocialState(): PsychosocialStorageState {
  return {
    answers: [...seededAnswers],
    progress: [],
  };
}

function loadPsychosocialState(): PsychosocialStorageState {
  const filePath = psychosocialStatePath();
  const legacyPath = join(process.cwd(), ".data", "psychosocial-state.json");
  const readablePath = existsSync(filePath) ? filePath : legacyPath;

  if (!existsSync(readablePath)) {
    return emptyPsychosocialState();
  }

  try {
    const parsedState = JSON.parse(
      readFileSync(readablePath, "utf8"),
    ) as Partial<PsychosocialStorageState>;
    const storedAnswers = parsedState.answers ?? [];
    const storedProgress = parsedState.progress ?? [];

    return {
      ...emptyPsychosocialState(),
      ...parsedState,
      answers: [
        ...storedAnswers,
        ...seededAnswers.filter((seededAnswer) =>
          storedAnswers.every((answer) => answer.employeeId !== seededAnswer.employeeId),
        ),
      ],
      progress: storedProgress,
    };
  } catch {
    return emptyPsychosocialState();
  }
}

function savePsychosocialState(state: PsychosocialStorageState): void {
  const filePath = psychosocialStatePath();
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(state, null, 2), "utf8");
}

const psychosocialState = loadPsychosocialState();

const sectorSignals: PsychosocialSectorSignal[] = [
  {
    id: "signal-horizonte-producao",
    campaignId: "campaign-horizonte-2026-01",
    companyTradeName: "Industria Horizonte",
    sectorName: "Producao",
    participants: 82,
    responses: 75,
    responseRate: 91,
    averageScore: 3.1,
    riskLevel: "moderate",
    privacyStatus: "visible",
    recommendation: "Monitorar carga de trabalho e reforcar comunicacao com liderancas.",
  },
  {
    id: "signal-horizonte-manutencao",
    campaignId: "campaign-horizonte-2026-01",
    companyTradeName: "Industria Horizonte",
    sectorName: "Manutencao",
    participants: 5,
    responses: 5,
    responseRate: 100,
    averageScore: 3.8,
    riskLevel: "high",
    privacyStatus: "visible",
    recommendation: "Priorizar entrevista tecnica e revisao de organizacao de plantao.",
  },
  {
    id: "signal-rede-norte-atendimento",
    campaignId: "campaign-rede-norte-2026-01",
    companyTradeName: "Rede Norte",
    sectorName: "Atendimento",
    participants: 120,
    responses: 92,
    responseRate: 77,
    averageScore: 2.2,
    riskLevel: "low",
    privacyStatus: "visible",
    recommendation: "Manter monitoramento e incentivar adesao ate 89%.",
  },
  {
    id: "signal-rede-norte-grupo-agregado",
    campaignId: "campaign-rede-norte-2026-01",
    companyTradeName: "Rede Norte",
    sectorName: "Setores agregados",
    participants: 9,
    responses: 7,
    responseRate: 78,
    averageScore: 2.9,
    riskLevel: "moderate",
    privacyStatus: "aggregated",
    recommendation: "Dados agrupados para preservar privacidade de setores pequenos.",
  },
];

@Injectable()
export class PsychosocialService {
  getSummary(): PsychosocialSummary {
    const activeCampaigns = campaigns.filter(
      (campaign) => campaign.status === "active" || campaign.status === "threshold_reached",
    );
    const averageResponseRate =
      campaigns.length === 0
        ? 0
        : Math.round(
            campaigns.reduce((total, campaign) => total + campaign.responseRate, 0) /
              campaigns.length,
          );

    return {
      generatedAt: now(),
      campaigns: campaigns.length,
      activeCampaigns: activeCampaigns.length,
      thresholdReached: campaigns.filter((campaign) => campaign.responseRate >= 89).length,
      averageResponseRate,
      highOrCriticalSectors: sectorSignals.filter(
        (signal) => signal.riskLevel === "high" || signal.riskLevel === "critical",
      ).length,
      pendingInterviews: sectorSignals.filter(
        (signal) => signal.riskLevel === "high" || signal.riskLevel === "critical",
      ).length,
    };
  }

  listQuestions(): PsychosocialQuestion[] {
    return questions;
  }

  listCampaigns(): PsychosocialCampaign[] {
    return campaigns;
  }

  getCampaign(id: string): PsychosocialCampaign {
    return this.findCampaign(id);
  }

  createCampaign(input: CreatePsychosocialCampaignInput): PsychosocialCampaign {
    const targetParticipants = normalizePositiveInteger(
      input.targetParticipants,
      "targetParticipants",
    );
    const createdAt = now();
    const campaign: PsychosocialCampaign = {
      id: randomUUID(),
      companyTradeName: requireText(input.companyTradeName, "companyTradeName"),
      name: requireText(input.name, "name"),
      startDate: normalizeDate(input.startDate, "startDate"),
      endDate: normalizeDate(input.endDate, "endDate"),
      targetParticipants,
      responseCount: 0,
      responseRate: 0,
      status: "draft",
      createdAt,
      updatedAt: createdAt,
    };

    campaigns.unshift(campaign);
    return campaign;
  }

  updateCampaign(id: string, input: UpdatePsychosocialCampaignInput): PsychosocialCampaign {
    const campaign = this.findCampaign(id);
    const targetParticipants =
      input.targetParticipants === undefined
        ? campaign.targetParticipants
        : normalizePositiveInteger(input.targetParticipants, "targetParticipants");
    const responseCount =
      optionalNonNegativeInteger(input.responseCount, "responseCount") ?? campaign.responseCount;
    const rate = responseRate(responseCount, targetParticipants);

    campaign.name = optionalText(input.name, "name") ?? campaign.name;
    campaign.startDate =
      input.startDate === undefined
        ? campaign.startDate
        : normalizeDate(input.startDate, "startDate");
    campaign.endDate =
      input.endDate === undefined ? campaign.endDate : normalizeDate(input.endDate, "endDate");
    campaign.targetParticipants = targetParticipants;
    campaign.responseCount = responseCount;
    campaign.responseRate = rate;
    campaign.status = normalizeStatus(input.status) ?? statusFromResponseRate(rate);
    campaign.updatedAt = now();

    return campaign;
  }

  listSectorSignals(): PsychosocialSectorSignal[] {
    return sectorSignals.map((signal) => this.applyPrivacyRule(signal));
  }

  listCopsoqAnalysis(): CopsoqCompanyAnalysis[] {
    return campaigns.map((campaign) => this.buildCopsoqCompanyAnalysis(campaign));
  }

  listTechnicalReports(): PsychosocialTechnicalReport[] {
    return campaigns.map((campaign) => this.buildTechnicalReport(campaign));
  }

  listAnswers(): PsychosocialEmployeeAnswer[] {
    return psychosocialState.answers;
  }

  getEmployeeAnswer(employeeId: string): PsychosocialEmployeeAnswer | null {
    return (
      psychosocialState.answers
        .filter((answer) => answer.employeeId === employeeId)
        .sort((first, second) => second.createdAt.localeCompare(first.createdAt))[0] ?? null
    );
  }

  getEmployeeProgress(employeeId: string): PsychosocialQuestionnaireProgress | null {
    return (
      psychosocialState.progress
        .filter((progress) => progress.employeeId === employeeId)
        .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt))[0] ?? null
    );
  }

  saveProgress(input: SavePsychosocialProgressInput): PsychosocialQuestionnaireProgress {
    const campaign = this.findCampaign(input.campaignId);
    const employeeId = requireText(input.employeeId, "employeeId");
    const sectorName = requireText(input.sectorName, "sectorName");
    const normalizedScores = this.normalizeQuestionScores(input.scores, false);
    const updatedAt = now();
    const existingProgress = psychosocialState.progress.find(
      (progress) => progress.campaignId === campaign.id && progress.employeeId === employeeId,
    );
    const receipt = this.getEmployeeAnswer(employeeId) ?? existingProgress?.receipt;
    const progress: PsychosocialQuestionnaireProgress = {
      id: existingProgress?.id ?? randomUUID(),
      campaignId: campaign.id,
      companyTradeName: campaign.companyTradeName,
      employeeId,
      sectorName,
      scores: normalizedScores,
      answeredCount: normalizedScores.length,
      totalQuestions: this.scorableQuestions().length,
      progressPercent: this.progressPercent(normalizedScores),
      isFinalized: receipt !== undefined && receipt !== null,
      receipt: receipt ?? undefined,
      startedAt: existingProgress?.startedAt ?? updatedAt,
      updatedAt,
      finalizedAt: existingProgress?.finalizedAt,
    };

    if (existingProgress === undefined) {
      psychosocialState.progress.unshift(progress);
    } else {
      Object.assign(existingProgress, progress);
    }

    savePsychosocialState(psychosocialState);
    return progress;
  }

  submitAnswer(input: SubmitPsychosocialAnswerInput): PsychosocialAnswerReceipt {
    const campaign = this.findCampaign(input.campaignId);
    const sectorName = requireText(input.sectorName, "sectorName");
    const employeeId = optionalText(input.employeeId, "employeeId");

    if (!Array.isArray(input.scores) || input.scores.length === 0) {
      throw new BadRequestException("Questionario sem respostas");
    }

    const scoredResult = this.calculateCopsoqScore(input.scores);
    const averageScore = scoredResult.averageScore;
    const riskLevel = scoredResult.riskLevel;
    const createdAt = now();
    const existingAnswer =
      employeeId === undefined
        ? undefined
        : psychosocialState.answers.find(
            (answer) => answer.campaignId === campaign.id && answer.employeeId === employeeId,
          );

    if (existingAnswer === undefined) {
      campaign.responseCount += 1;
    }

    campaign.responseRate = responseRate(campaign.responseCount, campaign.targetParticipants);
    campaign.status = statusFromResponseRate(campaign.responseRate);
    campaign.updatedAt = createdAt;

    const receipt: PsychosocialAnswerReceipt = {
      id: existingAnswer?.id ?? randomUUID(),
      campaignId: campaign.id,
      employeeId,
      sectorName,
      averageScore,
      riskPercent: scoredResult.riskPercent,
      riskLevel,
      axisScores: scoredResult.axisScores,
      createdAt,
    };

    if (employeeId !== undefined) {
      const storedAnswer: PsychosocialEmployeeAnswer = {
        ...receipt,
        companyTradeName: campaign.companyTradeName,
        employeeId,
      };

      if (existingAnswer === undefined) {
        psychosocialState.answers.unshift(storedAnswer);
      } else {
        Object.assign(existingAnswer, storedAnswer);
      }

      savePsychosocialState(psychosocialState);
      this.markProgressAsFinalized(campaign, employeeId, sectorName, input.scores, receipt);
    }

    return receipt;
  }

  private scorableQuestions(): PsychosocialQuestion[] {
    return questions.filter((question) => axisIdForQuestion(question) !== undefined);
  }

  private normalizeQuestionScores(
    scores: PsychosocialQuestionScore[],
    requireAllQuestions: boolean,
  ): PsychosocialQuestionScore[] {
    if (!Array.isArray(scores) || scores.length === 0) {
      return [];
    }

    const questionsById = new Map(questions.map((question) => [question.id, question]));
    const normalizedByQuestion = new Map<string, PsychosocialQuestionScore>();

    for (const answer of scores) {
      const question = questionsById.get(answer.questionId);

      if (question === undefined) {
        throw new BadRequestException("Questao psicossocial invalida");
      }

      normalizedByQuestion.set(answer.questionId, {
        questionId: answer.questionId,
        score: normalizeScore(answer.score),
      });
    }

    const normalizedScores = Array.from(normalizedByQuestion.values()).sort((first, second) => {
      const firstQuestion = questionsById.get(first.questionId);
      const secondQuestion = questionsById.get(second.questionId);
      return (firstQuestion?.order ?? 0) - (secondQuestion?.order ?? 0);
    });

    if (requireAllQuestions) {
      const missingQuestion = this.scorableQuestions().find(
        (question) => !normalizedByQuestion.has(question.id),
      );

      if (missingQuestion !== undefined) {
        throw new BadRequestException("Questionario finalizado sem todas as perguntas obrigatorias");
      }
    }

    return normalizedScores;
  }

  private progressPercent(scores: PsychosocialQuestionScore[]): number {
    const requiredQuestions = this.scorableQuestions();
    const answeredRequiredQuestions = new Set(
      scores
        .filter((score) => {
          const question = questions.find((item) => item.id === score.questionId);
          return question !== undefined && axisIdForQuestion(question) !== undefined;
        })
        .map((score) => score.questionId),
    );

    if (requiredQuestions.length === 0) {
      return 0;
    }

    return Math.round((answeredRequiredQuestions.size / requiredQuestions.length) * 100);
  }

  private calculateCopsoqScore(scores: PsychosocialQuestionScore[]): {
    averageScore: number;
    riskPercent: number;
    riskLevel: PsychosocialRiskLevel;
    axisScores: CopsoqAxisRisk[];
  } {
    const normalizedScores = this.normalizeQuestionScores(scores, true);
    const questionsById = new Map(questions.map((question) => [question.id, question]));
    const groupedScores = new Map<CopsoqAxisId, number[]>();
    const allRiskScores: number[] = [];

    for (const answer of normalizedScores) {
      const question = questionsById.get(answer.questionId);
      const axisId = question === undefined ? undefined : axisIdForQuestion(question);

      if (question === undefined || axisId === undefined) {
        continue;
      }

      const riskScore = riskScoreForQuestion(question, answer.score);
      const currentScores = groupedScores.get(axisId) ?? [];

      currentScores.push(riskScore);
      groupedScores.set(axisId, currentScores);
      allRiskScores.push(riskScore);
    }

    if (allRiskScores.length === 0) {
      throw new BadRequestException("Questionario sem perguntas pontuaveis");
    }

    const averageScore =
      Math.round(
        (allRiskScores.reduce((total, score) => total + score, 0) / allRiskScores.length) * 10,
      ) / 10;
    const riskPercent = riskPercentFromScore(averageScore);
    const axisScores = copsoqAxes.map<CopsoqAxisRisk>((axis) => {
      const axisRiskScores = groupedScores.get(axis.id) ?? [];
      const axisAverage =
        axisRiskScores.length === 0
          ? 0
          : axisRiskScores.reduce((total, score) => total + score, 0) / axisRiskScores.length;
      const axisRiskPercent = axisRiskScores.length === 0 ? 0 : riskPercentFromScore(axisAverage);

      return {
        axisId: axis.id,
        axisLabel: axis.label,
        riskLevel: classifyRiskPercent(axisRiskPercent),
        riskPercent: Math.round(axisRiskPercent * 10) / 10,
      };
    });

    return {
      averageScore,
      riskLevel: classifyRiskPercent(riskPercent),
      riskPercent,
      axisScores,
    };
  }

  private markProgressAsFinalized(
    campaign: PsychosocialCampaign,
    employeeId: string,
    sectorName: string,
    scores: PsychosocialQuestionScore[],
    receipt: PsychosocialAnswerReceipt,
  ): void {
    const updatedAt = now();
    const existingProgress = psychosocialState.progress.find(
      (progress) => progress.campaignId === campaign.id && progress.employeeId === employeeId,
    );
    const normalizedScores = this.normalizeQuestionScores(scores, false);
    const finalizedProgress: PsychosocialQuestionnaireProgress = {
      id: existingProgress?.id ?? randomUUID(),
      campaignId: campaign.id,
      companyTradeName: campaign.companyTradeName,
      employeeId,
      sectorName,
      scores: normalizedScores,
      answeredCount: normalizedScores.length,
      totalQuestions: this.scorableQuestions().length,
      progressPercent: 100,
      isFinalized: true,
      receipt,
      startedAt: existingProgress?.startedAt ?? updatedAt,
      updatedAt,
      finalizedAt: updatedAt,
    };

    if (existingProgress === undefined) {
      psychosocialState.progress.unshift(finalizedProgress);
    } else {
      Object.assign(existingProgress, finalizedProgress);
    }

    savePsychosocialState(psychosocialState);
  }

  private applyPrivacyRule(signal: PsychosocialSectorSignal): PsychosocialSectorSignal {
    if (signal.responses >= minimumAnonymousGroupSize) {
      return {
        ...signal,
        privacyStatus: "visible",
      };
    }

    return {
      ...signal,
      privacyStatus: "aggregated",
      sectorName: "Setores agregados",
      recommendation:
        "Resultado agrupado automaticamente para preservar anonimato em grupos pequenos.",
    };
  }

  private buildTechnicalReport(campaign: PsychosocialCampaign): PsychosocialTechnicalReport {
    const analysis = this.buildCopsoqCompanyAnalysis(campaign);
    const signals = sectorSignals.filter((signal) => signal.campaignId === campaign.id);
    const visibleGroups = signals.filter(
      (signal) => signal.responses >= minimumAnonymousGroupSize,
    ).length;
    const aggregatedGroups = signals.length - visibleGroups;

    return {
      id: `report-${campaign.id}`,
      campaignId: campaign.id,
      companyTradeName: campaign.companyTradeName,
      generatedAt: now(),
      minimumAnonymousGroupSize,
      totalResponses: campaign.responseCount,
      visibleGroups,
      aggregatedGroups,
      overallRiskPercent: analysis.overallRiskPercent,
      overallRiskLevel: analysis.overallRiskLevel,
      priorityAxisLabel: analysis.priorityAxisLabel,
      executiveSummary:
        analysis.overallRiskLevel === "high" || analysis.overallRiskLevel === "critical"
          ? `Campanha indica prioridade tecnica em ${analysis.priorityAxisLabel.toLowerCase()}, mantendo exposicao apenas agregada por regra minima de anonimato.`
          : `Campanha em acompanhamento preventivo, com atencao a ${analysis.priorityAxisLabel.toLowerCase()} e manutencao da regra minima de anonimato.`,
      interventionPlan: this.buildInterventionPlan(analysis),
    };
  }

  private buildInterventionPlan(analysis: CopsoqCompanyAnalysis): PsychosocialInterventionAction[] {
    const sortedAxes = [...analysis.axes].sort(
      (first, second) => second.riskPercent - first.riskPercent,
    );

    return sortedAxes.slice(0, 3).map((axis, index) => ({
      id: `intervention-${analysis.campaignId}-${axis.axisId}`,
      priority:
        axis.riskLevel === "critical" ? "critical" : axis.riskLevel === "high" ? "high" : "medium",
      target: axis.axisLabel,
      action:
        index === 0
          ? "Construir plano de intervencao com lideranca, RH e corpo clinico PRONUS."
          : "Monitorar indicador e definir acao preventiva setorial sem expor dados individuais.",
      ownerSuggestion: index === 0 ? "PRONUS + RH cliente" : "RH cliente",
      evidenceExpected:
        "Registro de reuniao, plano de acao, comunicacao interna e nova medicao de acompanhamento.",
    }));
  }

  private findCampaign(id: string): PsychosocialCampaign {
    const campaign = campaigns.find((item) => item.id === id);

    if (campaign === undefined) {
      throw new NotFoundException("Campanha psicossocial nao encontrada");
    }

    return campaign;
  }

  private buildCopsoqCompanyAnalysis(campaign: PsychosocialCampaign): CopsoqCompanyAnalysis {
    const sectors = seededCopsoqSectorRisk
      .filter((sector) => sector.companyTradeName === campaign.companyTradeName)
      .map((sector) => this.buildCopsoqSectorAxisRisk(sector));
    const axes = copsoqAxes.map<CopsoqAxisRisk>((axis) => {
      const weightedTotal = sectors.reduce(
        (total, sector) =>
          total +
          (sector.axes.find((item) => item.axisId === axis.id)?.riskPercent ?? 0) *
            Math.max(sector.responses, 1),
        0,
      );
      const responseBase = sectors.reduce((total, sector) => total + Math.max(sector.responses, 1), 0);
      const riskPercent =
        responseBase === 0 ? 0 : Math.round((weightedTotal / responseBase) * 10) / 10;

      return {
        axisId: axis.id,
        axisLabel: axis.label,
        riskLevel: classifyRiskPercent(riskPercent),
        riskPercent,
      };
    });
    const priorityAxis = [...axes].sort((first, second) => second.riskPercent - first.riskPercent)[0]!;
    const overallRiskPercent =
      axes.length === 0
        ? 0
        : Math.round(
            (axes.reduce((total, axis) => total + axis.riskPercent, 0) / axes.length) * 10,
          ) / 10;

    return {
      companyTradeName: campaign.companyTradeName,
      campaignId: campaign.id,
      generatedAt: now(),
      responses: campaign.responseCount,
      overallRiskPercent,
      overallRiskLevel: classifyRiskPercent(overallRiskPercent),
      priorityAxisId: priorityAxis.axisId,
      priorityAxisLabel: priorityAxis.axisLabel,
      companyWideRecommendation:
        priorityAxis.riskLevel === "high" || priorityAxis.riskLevel === "critical"
          ? `Priorizar plano transversal para ${priorityAxis.axisLabel.toLowerCase()} e complementar com acoes por setor.`
          : "Manter acompanhamento setorial e reforcar comunicacao preventiva.",
      axes,
      sectors,
    };
  }

  private buildCopsoqSectorAxisRisk(
    sector: Omit<
      CopsoqSectorAxisRisk,
      "axes" | "accumulatedRiskLevel" | "priorityAxisId" | "priorityAxisLabel"
    >,
  ): CopsoqSectorAxisRisk {
    const axisRisk: Partial<Record<CopsoqAxisId, number>> =
      seededCopsoqAxisBySector[sector.sectorName] ?? {};
    const axes = copsoqAxes.map<CopsoqAxisRisk>((axis) => {
      const riskPercent = axisRisk[axis.id] ?? sector.accumulatedRiskPercent;

      return {
        axisId: axis.id,
        axisLabel: axis.label,
        riskLevel: classifyRiskPercent(riskPercent),
        riskPercent,
      };
    });
    const priorityAxis = [...axes].sort((first, second) => second.riskPercent - first.riskPercent)[0]!;

    return {
      ...sector,
      accumulatedRiskLevel: classifyRiskPercent(sector.accumulatedRiskPercent),
      axes,
      priorityAxisId: priorityAxis.axisId,
      priorityAxisLabel: priorityAxis.axisLabel,
    };
  }
}
