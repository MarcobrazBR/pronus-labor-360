"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  analysisDepthLabels,
  legalObligationLabels,
  riskTypeLabels,
  structuralAudienceLabels,
  type CompanyRegulatoryAssessment,
  type LegalObligationDefinition,
  type LegalObligationKey,
  type RegulatoryCnae,
  type RegulatoryRiskDegree,
  type ResolvedLegalObligation,
  type RiskScoreClass,
  type StructuralDepartment,
  type StructuralJobPosition,
  type TechnicalChecklistItem,
} from "../pronus-data";

type ConfigurationTab = "cnaes" | "riskDegrees" | "checklist" | "structures" | "operations";

type StructuralData = {
  departments: StructuralDepartment[];
  jobPositions: StructuralJobPosition[];
};

type CnaeForm = {
  code: string;
  description: string;
  riskDegree: string;
  activityClassification: string;
};

const tabs: Array<{ id: ConfigurationTab; label: string }> = [
  { id: "cnaes", label: "CNAE" },
  { id: "riskDegrees", label: "Grau de risco" },
  { id: "checklist", label: "Checklist técnico" },
  { id: "structures", label: "Estruturas" },
  { id: "operations", label: "Operacional" },
];

const initialCnaeForm: CnaeForm = {
  activityClassification: "",
  code: "",
  description: "",
  riskDegree: "1",
};

const operationGroups = [
  {
    label: "Feriados",
    value: "Calendario bloqueado",
    detail: "Natal, feriados nacionais e datas locais que removem vagas da agenda.",
  },
  {
    label: "Agenda",
    value: "Corpo clinico",
    detail: "Disponibilidade por profissional, dia util, tempo de consulta e bloqueios.",
  },
  {
    label: "Tabelas auxiliares",
    value: "Pagamentos e parametros",
    detail: "Valores por tempo de consulta, vigencias e tabelas de apoio ao motor SST.",
  },
];

const timelineStatusLabels: Record<
  CompanyRegulatoryAssessment["timeline"][number]["status"],
  string
> = {
  active: "Ativo",
  pending: "Pendente",
  planned: "Planejado",
};

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function scoreClasses(classification: RiskScoreClass) {
  if (classification === "critical") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  if (classification === "high") {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }

  if (classification === "medium") {
    return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
  }

  return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
}

function obligationDefinition(
  key: LegalObligationKey,
  obligations: LegalObligationDefinition[],
): LegalObligationDefinition {
  return (
    obligations.find((obligation) => obligation.key === key) ?? {
      key,
      label: legalObligationLabels[key],
      reference: "Parametro PRONUS",
    }
  );
}

function shouldRequireCipa(employeeCount: number) {
  return employeeCount >= 20;
}

function shouldRequireSesmt(riskDegree: number, employeeCount: number) {
  if (employeeCount < 50) {
    return false;
  }

  return riskDegree >= 3 || employeeCount >= 501;
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

function buildObligations(
  cnae: RegulatoryCnae,
  riskDegree: RegulatoryRiskDegree,
  employeeCount: number,
  obligations: LegalObligationDefinition[],
): ResolvedLegalObligation[] {
  const required = cnae.obligations.map((key) => ({
    ...obligationDefinition(key, obligations),
    reason: `Vinculada ao CNAE ${cnae.code} e ao grau de risco ${cnae.riskDegree}.`,
    status: "required" as const,
  }));
  const conditional: ResolvedLegalObligation[] = [];

  if (cnae.conditionalObligations.includes("cipa")) {
    conditional.push({
      ...obligationDefinition("cipa", obligations),
      reason: shouldRequireCipa(employeeCount)
        ? "Quantidade de colaboradores exige triagem de CIPA."
        : "Acompanhar crescimento do quadro e regra especifica aplicavel.",
      status: shouldRequireCipa(employeeCount) ? "required" : "conditional",
    });
  }

  if (cnae.conditionalObligations.includes("sesmt")) {
    conditional.push({
      ...obligationDefinition("sesmt", obligations),
      reason: shouldRequireSesmt(cnae.riskDegree, employeeCount)
        ? "Grau de risco e quadro exigem dimensionamento inicial do SESMT."
        : "Dimensionar quando quadro e risco alcancarem parametros da NR-04.",
      status: shouldRequireSesmt(cnae.riskDegree, employeeCount) ? "required" : "conditional",
    });
  }

  if (
    cnae.conditionalObligations.includes("aet") &&
    riskDegree.requiredRiskTypes.includes("ergonomic")
  ) {
    conditional.push({
      ...obligationDefinition("aet", obligations),
      reason: "Triagem ergonomica em campo pode exigir AET.",
      status: "conditional",
    });
  }

  const seen = new Set<LegalObligationKey>();
  return [...required, ...conditional].filter((item) => {
    if (seen.has(item.key)) {
      return false;
    }

    seen.add(item.key);
    return true;
  });
}

function buildChecklist(
  cnae: RegulatoryCnae,
  riskDegree: RegulatoryRiskDegree,
  employeeCount: number,
  obligations: ResolvedLegalObligation[],
): TechnicalChecklistItem[] {
  const riskTypes = riskDegree.requiredRiskTypes.map((risk) => riskTypeLabels[risk]).join(", ");
  const organizationRequired = obligations.some(
    (item) => (item.key === "cipa" || item.key === "sesmt") && item.status === "required",
  );
  const checklist: TechnicalChecklistItem[] = [
    {
      evidenceHint: "Planta, croqui, fotos ou mapa operacional validado em campo.",
      group: "Estrutura da empresa",
      id: "company-layout",
      label: "Registrar layout, unidades, setores e fluxo real de trabalho.",
      required: true,
    },
    {
      evidenceHint: "Relacao nominal, lotacao por setor e divergencias encontradas.",
      group: "Estrutura da empresa",
      id: "sector-headcount",
      label: `Confirmar quantidade de colaboradores por setor no total de ${employeeCount}.`,
      required: true,
    },
    {
      evidenceHint: "Agente, fonte geradora, trajetoria, frequencia e tempo de exposicao.",
      group: "Levantamento de riscos por setor",
      id: "risk-agents",
      label: `Avaliar riscos ${riskTypes} com profundidade ${analysisDepthLabels[riskDegree.analysisDepth]}.`,
      required: true,
    },
    {
      evidenceHint: "Evidencia fotografica, procedimento, medicao ou entrevista.",
      group: "Levantamento de riscos por setor",
      id: "risk-controls",
      label: "Registrar medidas de controle existentes e lacunas por risco identificado.",
      required: true,
    },
    {
      evidenceHint: "Ficha de entrega, treinamento, inspecao e registro de orientacao.",
      group: "EPC e EPI",
      id: "epi-epc",
      label: "Validar existencia, adequacao, frequencia de uso, CA e treinamento de EPI/EPC.",
      required: true,
    },
    {
      evidenceHint: "Arquivo, competencia, validade, responsavel tecnico e pendencias.",
      group: "Documentacao existente",
      id: "previous-docs",
      label: "Coletar PGR anterior, PCMSO, ASO, LTCAT e PPP disponiveis.",
      required: true,
    },
    {
      evidenceHint: "Atas, designacoes, registros de treinamento e dimensionamento.",
      group: "Organizacao legal",
      id: "legal-organization",
      label: "Verificar CIPA, SESMT, treinamentos obrigatorios e evidencias de cumprimento.",
      required: organizationRequired,
    },
    {
      evidenceHint: "CAT, ASO, riscos por cargo/setor, agentes nocivos, EPI e EPC.",
      group: "eSocial SST",
      id: "esocial-sst",
      label: `Preparar base para S-2210, S-2220 e S-2240 a partir do CNAE ${cnae.code}.`,
      required: true,
    },
  ];

  if (riskDegree.degree >= 3) {
    checklist.push({
      evidenceHint: "Plano de amostragem, laudo de higiene ocupacional ou justificativa tecnica.",
      group: "Levantamento de riscos por setor",
      id: "measurements",
      label: "Definir medicoes quantitativas ou justificativa tecnica para avaliacao qualitativa.",
      required: true,
    });
  }

  return checklist;
}

function buildAssessment(
  cnae: RegulatoryCnae,
  riskDegree: RegulatoryRiskDegree,
  employeeCount: number,
  obligationDefinitions: LegalObligationDefinition[],
): CompanyRegulatoryAssessment {
  const obligations = buildObligations(cnae, riskDegree, employeeCount, obligationDefinitions);
  const employeeFactor =
    employeeCount >= 501 ? 24 : employeeCount >= 101 ? 16 : employeeCount >= 20 ? 10 : 4;
  const scoreValue = Math.min(cnae.riskDegree * 18 + employeeFactor + obligations.length * 2, 100);
  const score = classifyScore(scoreValue);

  return {
    alerts: [
      {
        dueHint: `${riskDegree.reviewFrequencyMonths} meses`,
        id: "pgr-review",
        severity: riskDegree.degree >= 3 ? "warning" : "info",
        title: "Revisao do inventario de riscos",
      },
      {
        dueHint: "Conforme PCMSO",
        id: "aso-monitoring",
        severity: "warning",
        title: "Vencimento de exames ocupacionais",
      },
      ...(riskDegree.degree === 4
        ? [
            {
              dueHint: "Antes da emissao documental",
              id: "critical-risk",
              severity: "critical" as const,
              title: "Validacao tecnica prioritaria",
            },
          ]
        : []),
    ],
    checklist: buildChecklist(cnae, riskDegree, employeeCount, obligations),
    cnae,
    employeeCount,
    generatedAt: new Date().toISOString(),
    obligations,
    pcmsoBase: {
      reason: "PCMSO vinculado ao ciclo ocupacional e aos exames monitorados no S-2220.",
      required: true,
    },
    pgrBase: {
      actionPlanRequired: riskDegree.actionPlanRequired,
      analysisDepth: riskDegree.analysisDepth,
      inventoryRequired: riskDegree.inventoryRequired,
      requiredRiskTypes: riskDegree.requiredRiskTypes,
      reviewFrequencyMonths: riskDegree.reviewFrequencyMonths,
    },
    riskDegree,
    riskScore: {
      classification: score.classification,
      label: score.label,
      value: scoreValue,
    },
    timeline: [
      { id: "intake", status: "active", title: "Cadastro e leitura de CNAE" },
      { id: "field-checklist", status: "pending", title: "Checklist técnico em campo" },
      { id: "risk-inventory", status: "pending", title: "Inventario de riscos e plano de acao" },
      { id: "pcmso", status: "pending", title: "Base PCMSO e exames ocupacionais" },
      { id: "esocial", status: "planned", title: "Preparacao S-2210, S-2220 e S-2240" },
    ],
  };
}

export function ConfigurationPanel({
  initialCnaes,
  initialObligations,
  initialRiskDegrees,
  structural,
}: Readonly<{
  initialCnaes: RegulatoryCnae[];
  initialObligations: LegalObligationDefinition[];
  initialRiskDegrees: RegulatoryRiskDegree[];
  structural: StructuralData;
}>) {
  const [activeTab, setActiveTab] = useState<ConfigurationTab>("cnaes");
  const [cnaes, setCnaes] = useState(initialCnaes);
  const [cnaeQuery, setCnaeQuery] = useState("");
  const [isCnaeModalOpen, setIsCnaeModalOpen] = useState(false);
  const [cnaeForm, setCnaeForm] = useState(initialCnaeForm);
  const [assessmentCnae, setAssessmentCnae] = useState(initialCnaes[0]?.code ?? "");
  const [assessmentEmployees, setAssessmentEmployees] = useState("148");
  const [assessment, setAssessment] = useState<CompanyRegulatoryAssessment | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filteredCnaes = useMemo(() => {
    const normalized = cnaeQuery.trim().toLowerCase();

    if (normalized.length === 0) {
      return cnaes;
    }

    return cnaes.filter((cnae) =>
      [cnae.code, cnae.description, cnae.activityClassification, `grau ${cnae.riskDegree}`]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [cnaeQuery, cnaes]);

  const summaryCards = [
    { label: "CNAEs parametrizados", value: String(cnaes.length) },
    { label: "Graus de risco", value: String(initialRiskDegrees.length) },
    { label: "Obrigações legais", value: String(initialObligations.length) },
    {
      label: "Estruturas",
      value: String(structural.departments.length + structural.jobPositions.length),
    },
  ];

  function saveCnae() {
    const code = onlyDigits(cnaeForm.code);
    const riskDegree = Number(cnaeForm.riskDegree) as RegulatoryCnae["riskDegree"];

    if (code.length !== 7 || cnaeForm.description.trim().length === 0) {
      setMessage("Informe um CNAE com 7 digitos e uma descrição.");
      return;
    }

    const nextCnae: RegulatoryCnae = {
      activityClassification: cnaeForm.activityClassification.trim() || "Atividade parametrizada",
      code,
      conditionalObligations: ["cipa", "sesmt", "aet"],
      description: cnaeForm.description.trim(),
      obligations: ["pgr", "pcmso", "ltcat", "esocial_s2210", "esocial_s2220", "esocial_s2240"],
      riskDegree,
      sourceNote:
        "Parametro criado na interface do MVP; persistencia definitiva sera ligada ao backend.",
    };

    setCnaes((current) => [nextCnae, ...current.filter((item) => item.code !== code)]);
    setAssessmentCnae(code);
    setCnaeForm(initialCnaeForm);
    setIsCnaeModalOpen(false);
    setMessage("CNAE incluido na parametrizacao local do MVP.");
  }

  function analyzeCompany() {
    const code = onlyDigits(assessmentCnae);
    const employeeCount = Number(assessmentEmployees);
    const cnae = cnaes.find((item) => item.code === code);

    if (cnae === undefined) {
      setAssessment(null);
      setMessage("CNAE nao encontrado na parametrizacao atual.");
      return;
    }

    if (!Number.isInteger(employeeCount) || employeeCount < 0) {
      setAssessment(null);
      setMessage("Informe uma quantidade valida de colaboradores.");
      return;
    }

    const riskDegree = initialRiskDegrees.find((item) => item.degree === cnae.riskDegree);

    if (riskDegree === undefined) {
      setAssessment(null);
      setMessage("Grau de risco sem parametrizacao.");
      return;
    }

    setAssessment(buildAssessment(cnae, riskDegree, employeeCount, initialObligations));
    setMessage(null);
  }

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article key={card.label} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <strong className="mt-2 block text-3xl font-semibold tracking-normal">
              {card.value}
            </strong>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold ${
                  activeTab === tab.id
                    ? "bg-pronus-primary text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setMessage(null);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {message !== null && (
          <div className="mx-5 mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
            {message}
          </div>
        )}

        <div className="p-5">
          {activeTab === "cnaes" && (
            <CnaeCatalog
              cnaes={filteredCnaes}
              query={cnaeQuery}
              onAdd={() => setIsCnaeModalOpen(true)}
              onQuery={setCnaeQuery}
              onSelectForAssessment={(code) => {
                setAssessmentCnae(code);
                setActiveTab("checklist");
              }}
            />
          )}
          {activeTab === "riskDegrees" && <RiskDegreeCatalog riskDegrees={initialRiskDegrees} />}
          {activeTab === "checklist" && (
            <ChecklistSimulator
              assessment={assessment}
              cnaeCode={assessmentCnae}
              cnaes={cnaes}
              employeeCount={assessmentEmployees}
              onAnalyze={analyzeCompany}
              onCnaeCode={setAssessmentCnae}
              onEmployeeCount={setAssessmentEmployees}
            />
          )}
          {activeTab === "structures" && (
            <StructuresPanel
              departments={structural.departments}
              jobPositions={structural.jobPositions}
            />
          )}
          {activeTab === "operations" && <OperationsPanel />}
        </div>
      </section>

      {isCnaeModalOpen && (
        <CnaeModal
          form={cnaeForm}
          onClose={() => setIsCnaeModalOpen(false)}
          onSave={saveCnae}
          onUpdate={(field, value) => setCnaeForm((current) => ({ ...current, [field]: value }))}
        />
      )}
    </>
  );
}

function CnaeCatalog({
  cnaes,
  onAdd,
  onQuery,
  onSelectForAssessment,
  query,
}: Readonly<{
  cnaes: RegulatoryCnae[];
  onAdd: () => void;
  onQuery: (value: string) => void;
  onSelectForAssessment: (code: string) => void;
  query: string;
}>) {
  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <label className="block md:min-w-[24rem]">
          <span className="text-xs font-semibold uppercase text-slate-500">Buscar CNAE</span>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            placeholder="Codigo, descrição, atividade ou grau"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
          />
        </label>
        <button
          aria-label="Cadastrar CNAE"
          className="flex h-10 w-10 items-center justify-center rounded-md bg-pronus-primary text-xl font-semibold leading-none text-white shadow-sm"
          title="Cadastrar CNAE"
          type="button"
          onClick={onAdd}
        >
          +
        </button>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {cnaes.map((cnae) => (
          <article key={cnae.code} className="rounded-lg border border-slate-200 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-pronus-primary">
                  CNAE {cnae.code}
                </p>
                <h3 className="mt-1 text-base font-semibold">{cnae.description}</h3>
                <p className="mt-1 text-sm text-slate-600">{cnae.activityClassification}</p>
              </div>
              <span className="h-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                Grau {cnae.riskDegree}
              </span>
            </div>
            <TagList
              items={[...cnae.obligations, ...cnae.conditionalObligations].map(
                (item) => legalObligationLabels[item],
              )}
            />
            <button
              className="mt-4 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
              type="button"
              onClick={() => onSelectForAssessment(cnae.code)}
            >
              Analisar
            </button>
          </article>
        ))}
      </div>

      {cnaes.length === 0 && (
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Nenhum CNAE encontrado.
        </div>
      )}
    </div>
  );
}

function RiskDegreeCatalog({ riskDegrees }: Readonly<{ riskDegrees: RegulatoryRiskDegree[] }>) {
  return (
    <div className="grid gap-3 xl:grid-cols-2">
      {riskDegrees.map((riskDegree) => (
        <article key={riskDegree.degree} className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-pronus-primary">
                Grau {riskDegree.degree}
              </p>
              <h3 className="mt-1 text-base font-semibold">
                {analysisDepthLabels[riskDegree.analysisDepth]}
              </h3>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              Revisao {riskDegree.reviewFrequencyMonths}m
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{riskDegree.description}</p>
          <TagList items={riskDegree.requiredRiskTypes.map((risk) => riskTypeLabels[risk])} />
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <MiniInfo
              label="Inventario"
              value={riskDegree.inventoryRequired ? "Obrigatorio" : "Nao"}
            />
            <MiniInfo
              label="Plano de acao"
              value={riskDegree.actionPlanRequired ? "Obrigatorio" : "Nao"}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

function ChecklistSimulator({
  assessment,
  cnaeCode,
  cnaes,
  employeeCount,
  onAnalyze,
  onCnaeCode,
  onEmployeeCount,
}: Readonly<{
  assessment: CompanyRegulatoryAssessment | null;
  cnaeCode: string;
  cnaes: RegulatoryCnae[];
  employeeCount: string;
  onAnalyze: () => void;
  onCnaeCode: (value: string) => void;
  onEmployeeCount: (value: string) => void;
}>) {
  const groupedChecklist = useMemo(() => {
    if (assessment === null) {
      return [];
    }

    const groups = new Map<string, TechnicalChecklistItem[]>();

    for (const item of assessment.checklist) {
      groups.set(item.group, [...(groups.get(item.group) ?? []), item]);
    }

    return Array.from(groups.entries());
  }, [assessment]);

  return (
    <div>
      <div className="grid gap-3 lg:grid-cols-[1fr_12rem_auto]">
        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500">CNAE</span>
          <select
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            value={cnaeCode}
            onChange={(event) => onCnaeCode(event.target.value)}
          >
            {cnaes.map((cnae) => (
              <option key={cnae.code} value={cnae.code}>
                {cnae.code} - {cnae.description}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500">Colaboradores</span>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            min="0"
            type="number"
            value={employeeCount}
            onChange={(event) => onEmployeeCount(event.target.value)}
          />
        </label>
        <button
          className="h-10 self-end rounded-md bg-pronus-primary px-5 text-sm font-semibold text-white"
          type="button"
          onClick={onAnalyze}
        >
          Analisar
        </button>
      </div>

      {assessment === null ? (
        <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
          Informe CNAE e quantidade de colaboradores para gerar a primeira leitura regulatoria.
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          <section className="grid gap-3 lg:grid-cols-4">
            <MiniInfo label="CNAE" value={assessment.cnae.code} />
            <MiniInfo label="Grau de risco" value={`Grau ${assessment.riskDegree.degree}`} />
            <MiniInfo
              label="Revisao PGR"
              value={`${assessment.pgrBase.reviewFrequencyMonths} meses`}
            />
            <article className="rounded-md bg-slate-100 px-3 py-2">
              <p className="text-xs font-medium text-slate-500">Score</p>
              <span
                className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${scoreClasses(
                  assessment.riskScore.classification,
                )}`}
              >
                {assessment.riskScore.value} / {assessment.riskScore.label}
              </span>
            </article>
          </section>

          <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-lg border border-slate-200">
              <PanelTitle title="Obrigações geradas" />
              <div className="divide-y divide-slate-100">
                {assessment.obligations.map((obligation) => (
                  <article key={obligation.key} className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold">{obligation.label}</h4>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        {obligation.reference}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          obligation.status === "required"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                        }`}
                      >
                        {obligation.status === "required" ? "Obrigatorio" : "Condicional"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{obligation.reason}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200">
              <PanelTitle title="Alertas e linha do tempo" />
              <div className="grid gap-3 p-4 md:grid-cols-2">
                {assessment.alerts.map((alert) => (
                  <MiniInfo key={alert.id} label={alert.title} value={alert.dueHint} />
                ))}
                {assessment.timeline.map((event) => (
                  <MiniInfo
                    key={event.id}
                    label={event.title}
                    value={timelineStatusLabels[event.status]}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200">
            <PanelTitle title="Checklist tecnico" />
            <div className="grid gap-4 p-4 xl:grid-cols-2">
              {groupedChecklist.map(([group, items]) => (
                <article key={group} className="rounded-md bg-slate-50 p-4">
                  <h4 className="text-sm font-semibold">{group}</h4>
                  <div className="mt-3 space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-md border border-slate-200 bg-white p-3"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              item.required
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                            }`}
                          >
                            {item.required ? "Obrigatorio" : "Triagem"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-slate-900">{item.label}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{item.evidenceHint}</p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function StructuresPanel({
  departments,
  jobPositions,
}: Readonly<{
  departments: StructuralDepartment[];
  jobPositions: StructuralJobPosition[];
}>) {
  const groupedDepartments = departments.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.audience] = (accumulator[item.audience] ?? 0) + 1;
    return accumulator;
  }, {});
  const groupedJobs = jobPositions.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.audience] = (accumulator[item.audience] ?? 0) + 1;
    return accumulator;
  }, {});

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <StructureList
        actionHref="/empresas/cargos"
        grouped={groupedJobs}
        items={jobPositions.map((item) => ({
          detail: `${structuralAudienceLabels[item.audience]} / ${item.eSocialCode ?? "sem eSocial"}`,
          id: item.id,
          label: item.title,
        }))}
        title="Cargos"
      />
      <StructureList
        actionHref="/empresas/setores"
        grouped={groupedDepartments}
        items={departments.map((item) => ({
          detail: `${structuralAudienceLabels[item.audience]} / ${item.code ?? "sem codigo"}`,
          id: item.id,
          label: item.name,
        }))}
        title="Setores"
      />
    </div>
  );
}

function StructureList({
  actionHref,
  grouped,
  items,
  title,
}: Readonly<{
  actionHref: string;
  grouped: Record<string, number>;
  items: Array<{ id: string; label: string; detail: string }>;
  title: string;
}>) {
  return (
    <section className="rounded-lg border border-slate-200">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <h3 className="text-base font-semibold">{title}</h3>
        <Link
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          href={actionHref}
        >
          Abrir
        </Link>
      </div>
      <div className="grid gap-2 border-b border-slate-100 p-4 sm:grid-cols-2">
        {Object.entries(grouped).map(([audience, total]) => (
          <MiniInfo
            key={audience}
            label={structuralAudienceLabels[audience as keyof typeof structuralAudienceLabels]}
            value={String(total)}
          />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {items.slice(0, 6).map((item) => (
          <article key={item.id} className="px-4 py-3">
            <h4 className="text-sm font-semibold">{item.label}</h4>
            <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function OperationsPanel() {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {operationGroups.map((group) => (
        <article key={group.label} className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase text-pronus-primary">{group.label}</p>
          <h3 className="mt-2 text-base font-semibold">{group.value}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{group.detail}</p>
        </article>
      ))}
    </div>
  );
}

function CnaeModal({
  form,
  onClose,
  onSave,
  onUpdate,
}: Readonly<{
  form: CnaeForm;
  onClose: () => void;
  onSave: () => void;
  onUpdate: (field: keyof CnaeForm, value: string) => void;
}>) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 px-4 py-6">
      <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-pronus-primary">
              Configuracoes
            </p>
            <h3 className="mt-1 text-lg font-semibold">Cadastrar CNAE</h3>
          </div>
          <button
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
            type="button"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
        <div className="grid gap-3 p-5 md:grid-cols-2">
          <TextField
            label="Código CNAE"
            value={form.code}
            onChange={(value) => onUpdate("code", value)}
          />
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-500">Grau de risco</span>
            <select
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              value={form.riskDegree}
              onChange={(event) => onUpdate("riskDegree", event.target.value)}
            >
              {[1, 2, 3, 4].map((degree) => (
                <option key={degree} value={degree}>
                  Grau {degree}
                </option>
              ))}
            </select>
          </label>
          <TextField
            label="Classificação de atividade"
            value={form.activityClassification}
            onChange={(value) => onUpdate("activityClassification", value)}
          />
          <TextField
            label="Descrição"
            value={form.description}
            onChange={(value) => onUpdate("description", value)}
          />
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            type="button"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white"
            type="button"
            onClick={onSave}
          >
            Salvar CNAE
          </button>
        </div>
      </div>
    </div>
  );
}

function TextField({
  label,
  onChange,
  value,
}: Readonly<{ label: string; onChange: (value: string) => void; value: string }>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function PanelTitle({ title }: Readonly<{ title: string }>) {
  return (
    <div className="border-b border-slate-200 px-4 py-3">
      <h3 className="text-base font-semibold">{title}</h3>
    </div>
  );
}

function MiniInfo({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <article className="min-w-0 rounded-md bg-slate-100 px-3 py-2">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <strong className="mt-1 block break-words text-sm font-semibold text-slate-900">
        {value}
      </strong>
    </article>
  );
}

function TagList({ items }: Readonly<{ items: string[] }>) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
