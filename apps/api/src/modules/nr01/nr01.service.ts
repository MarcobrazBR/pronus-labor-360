import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import type {
  CreateNr01ActionPlanItemInput,
  CreateNr01DocumentInput,
  CreateNr01EvidenceInput,
  CreateNr01RiskInput,
  Nr01ActionPlanItem,
  Nr01ActionStatus,
  Nr01Document,
  Nr01DocumentStatus,
  Nr01DocumentType,
  Nr01Evidence,
  Nr01EvidenceStatus,
  Nr01EvidenceType,
  Nr01RecordStatus,
  Nr01Risk,
  Nr01RiskLevel,
  Nr01RiskType,
  Nr01Summary,
  UpdateNr01ActionPlanItemInput,
  UpdateNr01DocumentInput,
  UpdateNr01EvidenceInput,
  UpdateNr01RiskInput,
} from "./nr01.types";

const riskTypes = new Set<Nr01RiskType>([
  "physical",
  "chemical",
  "biological",
  "ergonomic",
  "accident",
]);
const riskStatuses = new Set<Nr01RecordStatus>(["draft", "active", "review", "archived"]);
const actionStatuses = new Set<Nr01ActionStatus>(["open", "in_progress", "done", "overdue"]);
const evidenceTypes = new Set<Nr01EvidenceType>([
  "photo",
  "report",
  "training_record",
  "measurement",
  "other",
]);
const evidenceStatuses = new Set<Nr01EvidenceStatus>(["pending_review", "accepted", "rejected"]);
const documentTypes = new Set<Nr01DocumentType>([
  "pgr",
  "inventory",
  "technical_report",
  "action_plan",
  "other",
]);
const documentStatuses = new Set<Nr01DocumentStatus>([
  "draft",
  "in_review",
  "approved",
  "published",
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

function normalizeScore(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 5) {
    throw new BadRequestException(`${field} deve ser um numero inteiro entre 1 e 5`);
  }

  return value;
}

function optionalScore(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return normalizeScore(value, field);
}

function normalizeRiskType(value: unknown): Nr01RiskType {
  if (typeof value !== "string" || !riskTypes.has(value as Nr01RiskType)) {
    throw new BadRequestException("Tipo de risco invalido");
  }

  return value as Nr01RiskType;
}

function normalizeRiskStatus(value: unknown): Nr01RecordStatus | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || !riskStatuses.has(value as Nr01RecordStatus)) {
    throw new BadRequestException("Status do risco invalido");
  }

  return value as Nr01RecordStatus;
}

function normalizeActionStatus(value: unknown): Nr01ActionStatus | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || !actionStatuses.has(value as Nr01ActionStatus)) {
    throw new BadRequestException("Status da acao invalido");
  }

  return value as Nr01ActionStatus;
}

function normalizeEvidenceType(value: unknown): Nr01EvidenceType {
  if (typeof value !== "string" || !evidenceTypes.has(value as Nr01EvidenceType)) {
    throw new BadRequestException("Tipo de evidencia invalido");
  }

  return value as Nr01EvidenceType;
}

function normalizeEvidenceStatus(value: unknown): Nr01EvidenceStatus | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || !evidenceStatuses.has(value as Nr01EvidenceStatus)) {
    throw new BadRequestException("Status da evidencia invalido");
  }

  return value as Nr01EvidenceStatus;
}

function normalizeDocumentType(value: unknown): Nr01DocumentType {
  if (typeof value !== "string" || !documentTypes.has(value as Nr01DocumentType)) {
    throw new BadRequestException("Tipo de documento invalido");
  }

  return value as Nr01DocumentType;
}

function normalizeDocumentStatus(value: unknown): Nr01DocumentStatus | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || !documentStatuses.has(value as Nr01DocumentStatus)) {
    throw new BadRequestException("Status do documento invalido");
  }

  return value as Nr01DocumentStatus;
}

function normalizeMeasures(value: unknown): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new BadRequestException("Medidas de controle devem ser uma lista de textos");
  }

  return value.map((item) => item.trim()).filter(Boolean);
}

function classifyRisk(probability: number, severity: number): Nr01RiskLevel {
  const score = probability * severity;

  if (score >= 20) {
    return "critical";
  }

  if (score >= 12) {
    return "high";
  }

  if (score >= 6) {
    return "moderate";
  }

  return "low";
}

function normalizeDueDate(value: unknown): string {
  const rawDate = requireText(value, "dueDate");
  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException("Data de prazo invalida");
  }

  return rawDate.slice(0, 10);
}

function normalizeOptionalDate(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const rawDate = requireText(value, field);
  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`Data invalida: ${field}`);
  }

  return rawDate.slice(0, 10);
}

function optionalCount(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new BadRequestException(`Campo numerico invalido: ${field}`);
  }

  return value;
}

const startedAt = now();

const risks: Nr01Risk[] = [
  {
    id: "risk-horizonte-ruido",
    companyTradeName: "Industria Horizonte",
    unitName: "Matriz",
    departmentName: "Producao",
    jobPositionTitle: "Operadora de Maquina",
    type: "physical",
    danger: "Ruido continuo acima do nivel de acao",
    risk: "Perda auditiva induzida por ruido",
    probability: 4,
    severity: 4,
    level: "high",
    controlMeasures: ["Uso de protetor auricular", "Dosimetria periodica", "Treinamento de EPI"],
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "risk-horizonte-ergonomia",
    companyTradeName: "Industria Horizonte",
    unitName: "Matriz",
    departmentName: "Manutencao",
    jobPositionTitle: "Tecnico de Seguranca",
    type: "ergonomic",
    danger: "Posturas forcadas em manutencao corretiva",
    risk: "Disturbios osteomusculares relacionados ao trabalho",
    probability: 3,
    severity: 4,
    level: "high",
    controlMeasures: ["Revisao de procedimento", "Pausas programadas"],
    status: "review",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "risk-rede-norte-queda",
    companyTradeName: "Rede Norte",
    unitName: "Centro de Distribuicao",
    departmentName: "Logistica",
    jobPositionTitle: "Auxiliar de Logistica",
    type: "accident",
    danger: "Circulacao em area com empilhadeiras",
    risk: "Atropelamento ou colisao interna",
    probability: 3,
    severity: 5,
    level: "high",
    controlMeasures: ["Sinalizacao de rota", "Separacao fisica de pedestres"],
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "risk-rede-norte-quimico",
    companyTradeName: "Rede Norte",
    unitName: "Loja 01",
    departmentName: "Atendimento",
    type: "chemical",
    danger: "Produtos de limpeza em uso rotineiro",
    risk: "Irritacao cutanea ou respiratoria",
    probability: 2,
    severity: 2,
    level: "low",
    controlMeasures: ["FISPQ disponivel", "Luvas de protecao"],
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
];

const actionPlan: Nr01ActionPlanItem[] = [
  {
    id: "action-ruido-dosimetria",
    riskId: "risk-horizonte-ruido",
    companyTradeName: "Industria Horizonte",
    title: "Atualizar dosimetria da linha de envase",
    responsible: "Equipe SST PRONUS",
    dueDate: "2026-05-20",
    status: "in_progress",
    evidenceCount: 1,
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "action-rotas-empilhadeira",
    riskId: "risk-rede-norte-queda",
    companyTradeName: "Rede Norte",
    title: "Implantar rota segregada para pedestres",
    responsible: "Logistica Cliente",
    dueDate: "2026-05-10",
    status: "open",
    evidenceCount: 0,
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "action-ergonomia-procedimento",
    riskId: "risk-horizonte-ergonomia",
    companyTradeName: "Industria Horizonte",
    title: "Revisar procedimento de manutencao corretiva",
    responsible: "Engenharia de Seguranca",
    dueDate: "2026-04-20",
    status: "overdue",
    evidenceCount: 0,
    createdAt: startedAt,
    updatedAt: startedAt,
  },
];

const evidences: Nr01Evidence[] = [
  {
    id: "evidence-ruido-dosimetria-2026",
    actionId: "action-ruido-dosimetria",
    riskId: "risk-horizonte-ruido",
    companyTradeName: "Industria Horizonte",
    title: "Relatorio de dosimetria atualizado",
    type: "measurement",
    responsible: "Higiene Ocupacional PRONUS",
    receivedAt: "2026-04-18",
    status: "accepted",
    notes: "Arquivo validado para revisao do inventario.",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
];

const documents: Nr01Document[] = [
  {
    id: "document-horizonte-pgr-2026",
    companyTradeName: "Industria Horizonte",
    title: "PGR 2026 - Industria Horizonte",
    type: "pgr",
    referencePeriod: "2026",
    status: "in_review",
    generatedAt: "2026-04-15",
    updatedAt: startedAt,
  },
  {
    id: "document-rede-norte-inventario-2026",
    companyTradeName: "Rede Norte",
    title: "Inventario de riscos 2026 - Rede Norte",
    type: "inventory",
    referencePeriod: "2026",
    status: "draft",
    generatedAt: "2026-04-22",
    updatedAt: startedAt,
  },
];

@Injectable()
export class Nr01Service {
  getSummary(): Nr01Summary {
    return {
      generatedAt: now(),
      risks: risks.filter((risk) => risk.status !== "archived").length,
      criticalRisks: risks.filter((risk) => risk.level === "critical" && risk.status !== "archived")
        .length,
      highRisks: risks.filter((risk) => risk.level === "high" && risk.status !== "archived").length,
      openActions: actionPlan.filter(
        (action) => action.status === "open" || action.status === "in_progress",
      ).length,
      overdueActions: actionPlan.filter((action) => action.status === "overdue").length,
      evidences: evidences.filter((evidence) => evidence.status !== "rejected").length,
    };
  }

  listRisks(): Nr01Risk[] {
    return risks.filter((risk) => risk.status !== "archived");
  }

  getRisk(id: string): Nr01Risk {
    return this.findRisk(id);
  }

  createRisk(input: CreateNr01RiskInput): Nr01Risk {
    const probability = normalizeScore(input.probability, "probability");
    const severity = normalizeScore(input.severity, "severity");
    const createdAt = now();
    const risk: Nr01Risk = {
      id: randomUUID(),
      companyTradeName: requireText(input.companyTradeName, "companyTradeName"),
      unitName: requireText(input.unitName, "unitName"),
      departmentName: requireText(input.departmentName, "departmentName"),
      jobPositionTitle: optionalText(input.jobPositionTitle, "jobPositionTitle"),
      type: normalizeRiskType(input.type),
      danger: requireText(input.danger, "danger"),
      risk: requireText(input.risk, "risk"),
      probability,
      severity,
      level: classifyRisk(probability, severity),
      controlMeasures: normalizeMeasures(input.controlMeasures),
      status: "active",
      createdAt,
      updatedAt: createdAt,
    };

    risks.unshift(risk);
    return risk;
  }

  updateRisk(id: string, input: UpdateNr01RiskInput): Nr01Risk {
    const risk = this.findRisk(id);
    const probability = optionalScore(input.probability, "probability") ?? risk.probability;
    const severity = optionalScore(input.severity, "severity") ?? risk.severity;

    risk.companyTradeName =
      optionalText(input.companyTradeName, "companyTradeName") ?? risk.companyTradeName;
    risk.unitName = optionalText(input.unitName, "unitName") ?? risk.unitName;
    risk.departmentName =
      optionalText(input.departmentName, "departmentName") ?? risk.departmentName;
    risk.jobPositionTitle =
      optionalText(input.jobPositionTitle, "jobPositionTitle") ?? risk.jobPositionTitle;
    risk.type = input.type === undefined ? risk.type : normalizeRiskType(input.type);
    risk.danger = optionalText(input.danger, "danger") ?? risk.danger;
    risk.risk = optionalText(input.risk, "risk") ?? risk.risk;
    risk.probability = probability;
    risk.severity = severity;
    risk.level = classifyRisk(probability, severity);
    risk.controlMeasures =
      input.controlMeasures === undefined
        ? risk.controlMeasures
        : normalizeMeasures(input.controlMeasures);
    risk.status = normalizeRiskStatus(input.status) ?? risk.status;
    risk.updatedAt = now();

    return risk;
  }

  archiveRisk(id: string): Nr01Risk {
    return this.updateRisk(id, { status: "archived" });
  }

  listActionPlan(): Nr01ActionPlanItem[] {
    return actionPlan
      .filter((action) => action.status !== "done")
      .map((action) => ({
        ...action,
        evidenceCount: evidences.filter(
          (evidence) => evidence.actionId === action.id && evidence.status !== "rejected",
        ).length,
      }));
  }

  createActionPlanItem(input: CreateNr01ActionPlanItemInput): Nr01ActionPlanItem {
    const risk = this.findRisk(input.riskId);
    const createdAt = now();
    const action: Nr01ActionPlanItem = {
      id: randomUUID(),
      riskId: risk.id,
      companyTradeName: risk.companyTradeName,
      title: requireText(input.title, "title"),
      responsible: requireText(input.responsible, "responsible"),
      dueDate: normalizeDueDate(input.dueDate),
      status: "open",
      evidenceCount: 0,
      createdAt,
      updatedAt: createdAt,
    };

    actionPlan.unshift(action);
    return action;
  }

  updateActionPlanItem(id: string, input: UpdateNr01ActionPlanItemInput): Nr01ActionPlanItem {
    const action = this.findAction(id);

    action.title = optionalText(input.title, "title") ?? action.title;
    action.responsible = optionalText(input.responsible, "responsible") ?? action.responsible;
    action.dueDate = input.dueDate === undefined ? action.dueDate : normalizeDueDate(input.dueDate);
    action.status = normalizeActionStatus(input.status) ?? action.status;
    action.evidenceCount =
      optionalCount(input.evidenceCount, "evidenceCount") ?? action.evidenceCount;
    action.updatedAt = now();

    return action;
  }

  listEvidences(): Nr01Evidence[] {
    return evidences;
  }

  createEvidence(input: CreateNr01EvidenceInput): Nr01Evidence {
    const action = this.findAction(input.actionId);
    const risk = this.findRisk(action.riskId);
    const createdAt = now();
    const evidence: Nr01Evidence = {
      id: randomUUID(),
      actionId: action.id,
      riskId: risk.id,
      companyTradeName: action.companyTradeName,
      title: requireText(input.title, "title"),
      type: normalizeEvidenceType(input.type),
      responsible: requireText(input.responsible, "responsible"),
      receivedAt: normalizeOptionalDate(input.receivedAt, "receivedAt") ?? createdAt.slice(0, 10),
      status: "pending_review",
      notes: optionalText(input.notes, "notes"),
      createdAt,
      updatedAt: createdAt,
    };

    evidences.unshift(evidence);
    action.evidenceCount = evidences.filter(
      (item) => item.actionId === action.id && item.status !== "rejected",
    ).length;
    action.updatedAt = createdAt;

    return evidence;
  }

  updateEvidence(id: string, input: UpdateNr01EvidenceInput): Nr01Evidence {
    const evidence = this.findEvidence(id);
    const previousActionId = evidence.actionId;

    evidence.title = optionalText(input.title, "title") ?? evidence.title;
    evidence.type = input.type === undefined ? evidence.type : normalizeEvidenceType(input.type);
    evidence.responsible = optionalText(input.responsible, "responsible") ?? evidence.responsible;
    evidence.receivedAt =
      input.receivedAt === undefined
        ? evidence.receivedAt
        : (normalizeOptionalDate(input.receivedAt, "receivedAt") ?? evidence.receivedAt);
    evidence.status = normalizeEvidenceStatus(input.status) ?? evidence.status;
    evidence.notes =
      input.notes === undefined ? evidence.notes : optionalText(input.notes, "notes");
    evidence.updatedAt = now();

    const action = this.findAction(previousActionId);
    action.evidenceCount = evidences.filter(
      (item) => item.actionId === previousActionId && item.status !== "rejected",
    ).length;
    action.updatedAt = evidence.updatedAt;

    return evidence;
  }

  listDocuments(): Nr01Document[] {
    return documents;
  }

  createDocument(input: CreateNr01DocumentInput): Nr01Document {
    const createdAt = now();
    const document: Nr01Document = {
      id: randomUUID(),
      companyTradeName: requireText(input.companyTradeName, "companyTradeName"),
      title: requireText(input.title, "title"),
      type: normalizeDocumentType(input.type),
      referencePeriod: requireText(input.referencePeriod, "referencePeriod"),
      status: "draft",
      generatedAt: createdAt.slice(0, 10),
      updatedAt: createdAt,
    };

    documents.unshift(document);
    return document;
  }

  updateDocument(id: string, input: UpdateNr01DocumentInput): Nr01Document {
    const document = this.findDocument(id);

    document.companyTradeName =
      optionalText(input.companyTradeName, "companyTradeName") ?? document.companyTradeName;
    document.title = optionalText(input.title, "title") ?? document.title;
    document.type = input.type === undefined ? document.type : normalizeDocumentType(input.type);
    document.referencePeriod =
      optionalText(input.referencePeriod, "referencePeriod") ?? document.referencePeriod;
    document.status = normalizeDocumentStatus(input.status) ?? document.status;
    document.approvedAt =
      input.approvedAt === undefined
        ? document.approvedAt
        : normalizeOptionalDate(input.approvedAt, "approvedAt");
    document.updatedAt = now();

    return document;
  }

  private findRisk(id: string): Nr01Risk {
    const risk = risks.find((item) => item.id === id);

    if (risk === undefined) {
      throw new NotFoundException("Risco NR-01 nao encontrado");
    }

    return risk;
  }

  private findAction(id: string): Nr01ActionPlanItem {
    const action = actionPlan.find((item) => item.id === id);

    if (action === undefined) {
      throw new NotFoundException("Acao do plano nao encontrada");
    }

    return action;
  }

  private findEvidence(id: string): Nr01Evidence {
    const evidence = evidences.find((item) => item.id === id);

    if (evidence === undefined) {
      throw new NotFoundException("Evidencia NR-01 nao encontrada");
    }

    return evidence;
  }

  private findDocument(id: string): Nr01Document {
    const document = documents.find((item) => item.id === id);

    if (document === undefined) {
      throw new NotFoundException("Documento NR-01 nao encontrado");
    }

    return document;
  }
}
