import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  AssessCompanyInput,
  CompanyRegulatoryAssessment,
  LegalObligationDefinition,
  LegalObligationKey,
  RegulatoryCnae,
  RegulatoryRiskDegree,
  ResolvedLegalObligation,
  RiskScoreClass,
  RiskTypeKey,
  TechnicalChecklistItem,
} from "./regulatory-intelligence.types";

const obligationDefinitions: LegalObligationDefinition[] = [
  { key: "pgr", label: "PGR", reference: "NR-01" },
  { key: "pcmso", label: "PCMSO", reference: "NR-07" },
  { key: "ltcat", label: "LTCAT", reference: "Lei 8.213/1991 e eSocial SST" },
  { key: "cipa", label: "CIPA", reference: "NR-05" },
  { key: "sesmt", label: "SESMT", reference: "NR-04" },
  { key: "aet", label: "AET", reference: "NR-17" },
  { key: "esocial_s2210", label: "S-2210 CAT", reference: "eSocial SST" },
  { key: "esocial_s2220", label: "S-2220 ASO", reference: "eSocial SST" },
  { key: "esocial_s2240", label: "S-2240 agentes nocivos", reference: "eSocial SST" },
];

const cnaes: RegulatoryCnae[] = [
  {
    code: "1091102",
    description: "Fabricacao de produtos de panificacao industrial",
    riskDegree: 3,
    activityClassification: "Industria de alimentos",
    obligations: ["pgr", "pcmso", "ltcat", "esocial_s2210", "esocial_s2220", "esocial_s2240"],
    conditionalObligations: ["cipa", "sesmt", "aet"],
    sourceNote:
      "Semente PRONUS baseada no fluxo CNAE/GR da NR-04, pendente de carga oficial completa.",
  },
  {
    code: "4711302",
    description: "Comercio varejista de mercadorias em geral com predominancia de alimentos",
    riskDegree: 2,
    activityClassification: "Comercio varejista",
    obligations: ["pgr", "pcmso", "ltcat", "esocial_s2210", "esocial_s2220", "esocial_s2240"],
    conditionalObligations: ["cipa", "sesmt", "aet"],
    sourceNote:
      "Semente PRONUS baseada no fluxo CNAE/GR da NR-04, pendente de carga oficial completa.",
  },
  {
    code: "8211300",
    description: "Servicos combinados de escritorio e apoio administrativo",
    riskDegree: 1,
    activityClassification: "Administrativo e apoio",
    obligations: ["pgr", "pcmso", "ltcat", "esocial_s2210", "esocial_s2220", "esocial_s2240"],
    conditionalObligations: ["cipa", "sesmt", "aet"],
    sourceNote:
      "Semente PRONUS baseada no fluxo CNAE/GR da NR-04, pendente de carga oficial completa.",
  },
  {
    code: "4120400",
    description: "Construcao de edificios",
    riskDegree: 3,
    activityClassification: "Construcao civil",
    obligations: ["pgr", "pcmso", "ltcat", "esocial_s2210", "esocial_s2220", "esocial_s2240"],
    conditionalObligations: ["cipa", "sesmt", "aet"],
    sourceNote:
      "Semente PRONUS baseada no fluxo CNAE/GR da NR-04, pendente de carga oficial completa.",
  },
  {
    code: "0710301",
    description: "Extracao de minerio de ferro",
    riskDegree: 4,
    activityClassification: "Mineracao",
    obligations: ["pgr", "pcmso", "ltcat", "esocial_s2210", "esocial_s2220", "esocial_s2240"],
    conditionalObligations: ["cipa", "sesmt", "aet"],
    sourceNote:
      "Semente PRONUS baseada no fluxo CNAE/GR da NR-04, pendente de carga oficial completa.",
  },
];

const allRiskTypes: RiskTypeKey[] = ["physical", "chemical", "biological", "ergonomic", "accident"];

const riskDegrees: RegulatoryRiskDegree[] = [
  {
    degree: 1,
    description: "Baixa complexidade operacional com exposicoes pontuais e baixa severidade.",
    requiredRiskTypes: allRiskTypes,
    analysisDepth: "basic",
    inventoryRequired: true,
    actionPlanRequired: true,
    reviewFrequencyMonths: 24,
  },
  {
    degree: 2,
    description:
      "Operacao com riscos moderados, rotinas repetitivas e necessidade de controles formais.",
    requiredRiskTypes: allRiskTypes,
    analysisDepth: "intermediate",
    inventoryRequired: true,
    actionPlanRequired: true,
    reviewFrequencyMonths: 18,
  },
  {
    degree: 3,
    description:
      "Operacao com exposicoes relevantes, processos produtivos e controles tecnicos obrigatorios.",
    requiredRiskTypes: allRiskTypes,
    analysisDepth: "detailed",
    inventoryRequired: true,
    actionPlanRequired: true,
    reviewFrequencyMonths: 12,
  },
  {
    degree: 4,
    description:
      "Operacao critica com alto potencial de dano, exigindo investigacao completa e evidencias robustas.",
    requiredRiskTypes: allRiskTypes,
    analysisDepth: "critical",
    inventoryRequired: true,
    actionPlanRequired: true,
    reviewFrequencyMonths: 6,
  },
];

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizeCnae(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new BadRequestException("CNAE deve ser informado");
  }

  const digits = onlyDigits(value);

  if (digits.length !== 7) {
    throw new BadRequestException("CNAE deve conter 7 digitos");
  }

  return digits;
}

function normalizeEmployeeCount(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new BadRequestException(
      "Numero de colaboradores deve ser inteiro e maior ou igual a zero",
    );
  }

  return value;
}

function getObligation(key: LegalObligationKey): LegalObligationDefinition {
  const obligation = obligationDefinitions.find((item) => item.key === key);

  if (obligation === undefined) {
    throw new NotFoundException("Obrigacao regulatoria nao encontrada");
  }

  return obligation;
}

function classifyScore(value: number): { classification: RiskScoreClass; label: string } {
  if (value >= 85) {
    return { classification: "critical", label: "Critico" };
  }

  if (value >= 65) {
    return { classification: "high", label: "Alto risco" };
  }

  if (value >= 40) {
    return { classification: "medium", label: "Medio risco" };
  }

  return { classification: "low", label: "Baixo risco" };
}

function shouldRequireCipa(employeeCount: number): boolean {
  return employeeCount >= 20;
}

function shouldRequireSesmt(riskDegree: number, employeeCount: number): boolean {
  if (employeeCount < 50) {
    return false;
  }

  return riskDegree >= 3 || employeeCount >= 501;
}

function uniqueObligations(obligations: ResolvedLegalObligation[]): ResolvedLegalObligation[] {
  const seen = new Set<LegalObligationKey>();
  return obligations.filter((obligation) => {
    if (seen.has(obligation.key)) {
      return false;
    }

    seen.add(obligation.key);
    return true;
  });
}

@Injectable()
export class RegulatoryIntelligenceService {
  listCnaes(): RegulatoryCnae[] {
    return cnaes;
  }

  listRiskDegrees(): RegulatoryRiskDegree[] {
    return riskDegrees;
  }

  listObligations(): LegalObligationDefinition[] {
    return obligationDefinitions;
  }

  assessCompany(input: AssessCompanyInput): CompanyRegulatoryAssessment {
    const cnaeCode = normalizeCnae(input.cnaeCode);
    const employeeCount = normalizeEmployeeCount(input.employeeCount);
    const cnae = cnaes.find((item) => item.code === cnaeCode);

    if (cnae === undefined) {
      throw new NotFoundException("CNAE nao cadastrado na inteligencia regulatoria");
    }

    const riskDegree = riskDegrees.find((item) => item.degree === cnae.riskDegree);

    if (riskDegree === undefined) {
      throw new NotFoundException("Grau de risco nao parametrizado");
    }

    const obligations = this.resolveObligations(cnae, riskDegree, employeeCount);
    const scoreValue = this.calculateRiskScore(cnae.riskDegree, employeeCount, obligations.length);
    const scoreClass = classifyScore(scoreValue);

    return {
      generatedAt: new Date().toISOString(),
      cnae,
      riskDegree,
      employeeCount,
      obligations,
      checklist: this.buildChecklist(cnae, riskDegree, employeeCount, obligations),
      pgrBase: {
        inventoryRequired: riskDegree.inventoryRequired,
        actionPlanRequired: riskDegree.actionPlanRequired,
        requiredRiskTypes: riskDegree.requiredRiskTypes,
        analysisDepth: riskDegree.analysisDepth,
        reviewFrequencyMonths: riskDegree.reviewFrequencyMonths,
      },
      pcmsoBase: obligations.some((item) => item.key === "pcmso")
        ? {
            required: true,
            reason: "PCMSO vinculado ao ciclo ocupacional e aos exames monitorados no S-2220.",
          }
        : undefined,
      riskScore: {
        value: scoreValue,
        classification: scoreClass.classification,
        label: scoreClass.label,
      },
      alerts: this.buildAlerts(riskDegree, obligations),
      timeline: this.buildTimeline(obligations),
    };
  }

  private resolveObligations(
    cnae: RegulatoryCnae,
    riskDegree: RegulatoryRiskDegree,
    employeeCount: number,
  ): ResolvedLegalObligation[] {
    const required = cnae.obligations.map((key) => ({
      ...getObligation(key),
      status: "required" as const,
      reason: `Vinculada ao CNAE ${cnae.code} e ao grau de risco ${cnae.riskDegree}.`,
    }));
    const conditional: ResolvedLegalObligation[] = [];

    if (cnae.conditionalObligations.includes("cipa")) {
      conditional.push({
        ...getObligation("cipa"),
        status: shouldRequireCipa(employeeCount) ? "required" : "conditional",
        reason: shouldRequireCipa(employeeCount)
          ? "Numero de colaboradores indica necessidade de avaliar constituicao/designacao de CIPA."
          : "Avaliar quando houver crescimento de quadro ou regra especifica aplicavel.",
      });
    }

    if (cnae.conditionalObligations.includes("sesmt")) {
      conditional.push({
        ...getObligation("sesmt"),
        status: shouldRequireSesmt(cnae.riskDegree, employeeCount) ? "required" : "conditional",
        reason: shouldRequireSesmt(cnae.riskDegree, employeeCount)
          ? "Grau de risco e quantidade de colaboradores exigem dimensionamento inicial do SESMT."
          : "Dimensionar conforme NR-04 quando o quadro e o risco alcancarem os parametros aplicaveis.",
      });
    }

    if (
      cnae.conditionalObligations.includes("aet") &&
      riskDegree.requiredRiskTypes.includes("ergonomic")
    ) {
      conditional.push({
        ...getObligation("aet"),
        status: "conditional",
        reason:
          "Risco ergonomico deve ser triado em campo e pode exigir AET quando houver indicios.",
      });
    }

    return uniqueObligations([...required, ...conditional]);
  }

  private calculateRiskScore(
    riskDegree: RegulatoryRiskDegree["degree"],
    employeeCount: number,
    obligationCount: number,
  ): number {
    const employeeFactor =
      employeeCount >= 501 ? 24 : employeeCount >= 101 ? 16 : employeeCount >= 20 ? 10 : 4;
    const score = riskDegree * 18 + employeeFactor + obligationCount * 2;
    return Math.min(score, 100);
  }

  private buildChecklist(
    cnae: RegulatoryCnae,
    riskDegree: RegulatoryRiskDegree,
    employeeCount: number,
    obligations: ResolvedLegalObligation[],
  ): TechnicalChecklistItem[] {
    const hasRequiredCipa = obligations.some(
      (item) => item.key === "cipa" && item.status === "required",
    );
    const hasRequiredSesmt = obligations.some(
      (item) => item.key === "sesmt" && item.status === "required",
    );
    const checklist: TechnicalChecklistItem[] = [
      {
        id: "company-layout",
        group: "Estrutura da empresa",
        label: "Registrar layout, unidades, setores e fluxo real de trabalho.",
        required: true,
        evidenceHint: "Planta, croqui, fotos ou mapa operacional validado em campo.",
      },
      {
        id: "sector-headcount",
        group: "Estrutura da empresa",
        label: `Confirmar quantidade de colaboradores por setor no total de ${employeeCount}.`,
        required: true,
        evidenceHint: "Relacao nominal, lotacao por setor e divergencias encontradas.",
      },
      {
        id: "risk-agents",
        group: "Levantamento de riscos por setor",
        label: `Avaliar agentes ${riskDegree.requiredRiskTypes.join(", ")} com profundidade ${riskDegree.analysisDepth}.`,
        required: true,
        evidenceHint: "Agente, fonte geradora, trajetoria, frequencia e tempo de exposicao.",
      },
      {
        id: "risk-controls",
        group: "Levantamento de riscos por setor",
        label: "Registrar medidas de controle existentes e lacunas por risco identificado.",
        required: true,
        evidenceHint: "Evidencia fotografica, procedimento, medicao ou entrevista.",
      },
      {
        id: "epi-epc",
        group: "EPC e EPI",
        label: "Validar existencia, adequacao, frequencia de uso, CA e treinamento de EPI/EPC.",
        required: true,
        evidenceHint: "Ficha de entrega, treinamento, inspecao e registro de orientacao.",
      },
      {
        id: "previous-docs",
        group: "Documentacao existente",
        label: "Coletar PGR anterior, PCMSO, ASO, LTCAT e PPP disponiveis.",
        required: true,
        evidenceHint: "Arquivo, competencia, validade, responsavel tecnico e pendencias.",
      },
      {
        id: "legal-organization",
        group: "Organizacao legal",
        label: "Verificar CIPA, SESMT, treinamentos obrigatorios e evidencias de cumprimento.",
        required: hasRequiredCipa || hasRequiredSesmt,
        evidenceHint: "Atas, designacoes, registros de treinamento e dimensionamento.",
      },
      {
        id: "esocial-sst",
        group: "eSocial SST",
        label: `Preparar base para S-2210, S-2220 e S-2240 a partir do CNAE ${cnae.code}.`,
        required: true,
        evidenceHint: "CAT, ASO, riscos por cargo/setor, agentes nocivos, EPI e EPC.",
      },
    ];

    if (riskDegree.degree >= 3) {
      checklist.push({
        id: "measurements",
        group: "Levantamento de riscos por setor",
        label:
          "Definir medicoes quantitativas ou justificativa tecnica para avaliacao qualitativa.",
        required: true,
        evidenceHint: "Plano de amostragem, laudo de higiene ocupacional ou justificativa tecnica.",
      });
    }

    return checklist;
  }

  private buildAlerts(
    riskDegree: RegulatoryRiskDegree,
    obligations: ResolvedLegalObligation[],
  ): CompanyRegulatoryAssessment["alerts"] {
    const alerts: CompanyRegulatoryAssessment["alerts"] = [
      {
        id: "pgr-review",
        title: "Revisao do inventario de riscos",
        severity: riskDegree.degree >= 3 ? "warning" : "info",
        dueHint: `${riskDegree.reviewFrequencyMonths} meses`,
      },
      {
        id: "training-review",
        title: "Treinamentos obrigatorios por exposicao",
        severity: riskDegree.degree >= 3 ? "warning" : "info",
        dueHint: "Definir apos levantamento em campo",
      },
    ];

    if (obligations.some((item) => item.key === "pcmso")) {
      alerts.push({
        id: "aso-monitoring",
        title: "Vencimento de exames ocupacionais",
        severity: "warning",
        dueHint: "Conforme PCMSO",
      });
    }

    if (riskDegree.degree === 4) {
      alerts.push({
        id: "critical-risk",
        title: "Empresa critica exige validacao tecnica prioritaria",
        severity: "critical",
        dueHint: "Antes da emissao documental",
      });
    }

    return alerts;
  }

  private buildTimeline(
    obligations: ResolvedLegalObligation[],
  ): CompanyRegulatoryAssessment["timeline"] {
    const hasPcmso = obligations.some((item) => item.key === "pcmso");

    return [
      { id: "intake", title: "Cadastro e leitura de CNAE", status: "active" },
      { id: "field-checklist", title: "Checklist tecnico em campo", status: "pending" },
      { id: "risk-inventory", title: "Inventario de riscos e plano de acao", status: "pending" },
      {
        id: "pcmso",
        title: "Base PCMSO e exames ocupacionais",
        status: hasPcmso ? "pending" : "planned",
      },
      { id: "esocial", title: "Preparacao S-2210, S-2220 e S-2240", status: "planned" },
    ];
  }
}
