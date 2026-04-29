import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import type {
  CreatePsychosocialCampaignInput,
  PsychosocialAnswerReceipt,
  PsychosocialCampaign,
  PsychosocialCampaignStatus,
  PsychosocialQuestion,
  PsychosocialRiskLevel,
  PsychosocialSectorSignal,
  PsychosocialSummary,
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

function normalizeScore(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 5) {
    throw new BadRequestException("Resposta deve ser um numero inteiro entre 1 e 5");
  }

  return value;
}

function riskScoreForQuestion(question: PsychosocialQuestion, score: number): number {
  return question.reverseScored ? 6 - score : score;
}

const startedAt = now();

const questions: PsychosocialQuestion[] = copsoqQuestions;

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
    return sectorSignals;
  }

  submitAnswer(input: SubmitPsychosocialAnswerInput): PsychosocialAnswerReceipt {
    const campaign = this.findCampaign(input.campaignId);
    const sectorName = requireText(input.sectorName, "sectorName");

    if (!Array.isArray(input.scores) || input.scores.length === 0) {
      throw new BadRequestException("Questionario sem respostas");
    }

    const questionsById = new Map(questions.map((question) => [question.id, question]));
    const normalizedScores = input.scores.map((answer) => {
      const question = questionsById.get(answer.questionId);

      if (question === undefined) {
        throw new BadRequestException("Questao psicossocial invalida");
      }

      return riskScoreForQuestion(question, normalizeScore(answer.score));
    });
    const averageScore =
      Math.round(
        (normalizedScores.reduce((total, score) => total + score, 0) / normalizedScores.length) *
          10,
      ) / 10;
    const riskLevel = classifyScore(averageScore);
    const createdAt = now();

    campaign.responseCount += 1;
    campaign.responseRate = responseRate(campaign.responseCount, campaign.targetParticipants);
    campaign.status = statusFromResponseRate(campaign.responseRate);
    campaign.updatedAt = createdAt;

    return {
      id: randomUUID(),
      campaignId: campaign.id,
      sectorName,
      averageScore,
      riskLevel,
      createdAt,
    };
  }

  private findCampaign(id: string): PsychosocialCampaign {
    const campaign = campaigns.find((item) => item.id === id);

    if (campaign === undefined) {
      throw new NotFoundException("Campanha psicossocial nao encontrada");
    }

    return campaign;
  }
}
