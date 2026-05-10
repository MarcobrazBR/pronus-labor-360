"use client";

import { useMemo, useState } from "react";
import { ModuleIcon } from "../module-icons";

type ReportCategory = "dimensions" | "hierarchies" | "attributes" | "members" | "measures";

type ReportField = {
  description: string;
  group: string;
  id: string;
  label: string;
  sensitivity?: "administrative" | "clinical" | "financial" | "sensitive";
};

const categoryLabels: Record<ReportCategory, string> = {
  attributes: "Atributos",
  dimensions: "Dimensoes",
  hierarchies: "Hierarquias",
  measures: "Medidas",
  members: "Membros",
};

const categoryDescriptions: Record<ReportCategory, string> = {
  attributes: "Campos descritivos que qualificam cada linha do relatorio.",
  dimensions: "Eixos principais de analise e agrupamento.",
  hierarchies: "Caminhos de navegacao e agrupamento do dado.",
  measures: "Numeros, somas, contagens, percentuais e indicadores.",
  members: "Valores e recortes que podem entrar como filtros do relatorio.",
};

const reportCatalog: Record<ReportCategory, ReportField[]> = {
  attributes: [
    {
      description: "Razao social, nome fantasia, CNPJ, CNAE principal e codigo interno PRONUS.",
      group: "Empresa e contrato",
      id: "company-registration",
      label: "Dados cadastrais da empresa",
      sensitivity: "administrative",
    },
    {
      description: "Pacote contratado, vigencia, vencimento, status e coberturas ativas.",
      group: "Empresa e contrato",
      id: "contract-coverage",
      label: "Contrato e cobertura",
      sensitivity: "financial",
    },
    {
      description: "Nome, CPF, data de nascimento, status cadastral e data de inclusao/exclusao.",
      group: "Trabalhador",
      id: "worker-registration",
      label: "Cadastro do trabalhador",
      sensitivity: "administrative",
    },
    {
      description: "Cargo, CBO, setor, GHE, vinculo funcional e tipo de usuario.",
      group: "Trabalhador",
      id: "worker-position",
      label: "Cargo, CBO, setor e GHE",
      sensitivity: "administrative",
    },
    {
      description: "CNAE, grau de risco, atividade, obrigacoes automaticas e checklist inicial.",
      group: "Inteligencia regulatoria",
      id: "regulatory-cnae",
      label: "CNAE e obrigacoes legais",
      sensitivity: "administrative",
    },
    {
      description: "Agentes fisicos, quimicos, biologicos, ergonomicos e de acidentes/mecanicos.",
      group: "Risco ocupacional",
      id: "occupational-agents",
      label: "Agentes de risco ocupacional",
      sensitivity: "administrative",
    },
    {
      description: "PGR, PCMSO, LTCAT, PPP, ASO, CAT, afastamentos e restricoes laborais.",
      group: "Risco ocupacional",
      id: "occupational-documents",
      label: "Documentos e eventos SST",
      sensitivity: "sensitive",
    },
    {
      description: "Status da campanha, prazo, respondentes, pendentes, adesao e risco agregado.",
      group: "Psicossocial",
      id: "psychosocial-campaign",
      label: "Campanha psicossocial",
      sensitivity: "sensitive",
    },
    {
      description: "Especialidade, agenda, horario, status da consulta e profissional responsavel.",
      group: "Assistencial",
      id: "appointment-details",
      label: "Atendimento e agenda",
      sensitivity: "sensitive",
    },
    {
      description: "Evento, data, area responsavel, sigilo, conduta, proximo passo e anexos.",
      group: "Prontuario integrado",
      id: "record-timeline",
      label: "Timeline do prontuario",
      sensitivity: "clinical",
    },
    {
      description: "Parcela, tipo, vencimento, valor, status, pagamento e inadimplencia.",
      group: "Financeiro",
      id: "billing-installments",
      label: "Faturas e parcelas",
      sensitivity: "financial",
    },
    {
      description: "Profissional, especialidade, tabela, consulta finalizada e valor a pagar.",
      group: "Financeiro",
      id: "professional-payment",
      label: "Pagamento dos profissionais",
      sensitivity: "financial",
    },
    {
      description: "Modelo, versao, assinatura, publicacao, anexo, log de acesso e alteracao.",
      group: "Documentos e auditoria",
      id: "documents-audit",
      label: "Documentos, assinatura e logs",
      sensitivity: "administrative",
    },
  ],
  dimensions: [
    {
      description: "Analise por empresa contratante, CNPJ, unidade e status do contrato.",
      group: "Organizacional",
      id: "company",
      label: "Empresa",
    },
    {
      description: "Agrupa trabalhadores, riscos, consultas e indicadores por setor.",
      group: "Organizacional",
      id: "sector",
      label: "Setor",
    },
    {
      description: "Agrupa por cargo cadastrado, CBO e papel operacional.",
      group: "Organizacional",
      id: "job-position",
      label: "Cargo / CBO",
    },
    {
      description: "Permite analisar dados por cliente, RH, administrativo, gestor ou corpo clinico.",
      group: "Pessoas",
      id: "person-profile",
      label: "Perfil de pessoa",
    },
    {
      description: "Agrupa por clinico geral, acolhimento psicologico ou atendimento nutricional.",
      group: "Assistencial",
      id: "specialty",
      label: "Especialidade",
    },
    {
      description: "Analise por profissional de saude, conselho e tabela vigente.",
      group: "Assistencial",
      id: "health-professional",
      label: "Profissional de saude",
    },
    {
      description: "Recorte por competencia, periodo, mes, data de consulta ou vencimento.",
      group: "Tempo",
      id: "period",
      label: "Periodo",
    },
    {
      description: "Agrupa dados por CNAE, grau de risco e classe de atividade.",
      group: "Regulatorio",
      id: "cnae-risk-degree",
      label: "CNAE / Grau de risco",
    },
    {
      description: "Analise por fisico, quimico, biologico, ergonomico ou acidentes/mecanicos.",
      group: "Regulatorio",
      id: "risk-type",
      label: "Tipo de risco",
    },
    {
      description: "Agrupa por status cadastral, financeiro, consulta, documento ou plano de acao.",
      group: "Operacional",
      id: "status",
      label: "Status",
    },
  ],
  hierarchies: [
    {
      description: "Da empresa ate o trabalhador, preservando a estrutura real do cliente.",
      group: "Organizacao",
      id: "company-sector-job-worker",
      label: "Empresa > Setor > Cargo > Trabalhador",
    },
    {
      description: "Do CNAE ate o checklist de campo que orienta o tecnico SST.",
      group: "Regulatorio",
      id: "cnae-degree-obligation-checklist",
      label: "CNAE > Grau > Obrigacao > Checklist",
    },
    {
      description: "Do setor ao risco encontrado e ao plano de acao correspondente.",
      group: "Risco ocupacional",
      id: "company-sector-risk-action",
      label: "Empresa > Setor > Risco > Plano de acao",
    },
    {
      description: "Do contrato ate o consumo de cada cobertura assistencial.",
      group: "Assistencial",
      id: "company-coverage-specialty-appointment",
      label: "Empresa > Cobertura > Especialidade > Consulta",
    },
    {
      description: "Da agenda do profissional ate o status financeiro da consulta.",
      group: "Assistencial",
      id: "professional-specialty-appointment-payment",
      label: "Profissional > Especialidade > Consulta > Pagamento",
    },
    {
      description: "Da competencia ate a parcela e o status financeiro final.",
      group: "Financeiro",
      id: "period-invoice-installment-status",
      label: "Competencia > Fatura > Parcela > Status",
    },
    {
      description: "Do documento ate assinatura, evidencia e log de auditoria.",
      group: "Documentos",
      id: "document-model-signature-audit",
      label: "Documento > Modelo > Assinatura > Auditoria",
    },
    {
      description: "Do trabalhador ate eventos ocupacionais, assistenciais e alertas criticos.",
      group: "Prontuario",
      id: "worker-record-event-alert",
      label: "Trabalhador > Prontuario > Evento > Alerta",
    },
  ],
  measures: [
    {
      description: "Total de empresas ativas no periodo filtrado.",
      group: "Operacional",
      id: "active-companies",
      label: "Quantidade de empresas ativas",
    },
    {
      description: "Total de trabalhadores ativos e elegiveis para uso do portal.",
      group: "Operacional",
      id: "active-workers",
      label: "Quantidade de clientes ativos",
    },
    {
      description: "Total de profissionais de saude ativos por especialidade.",
      group: "Operacional",
      id: "active-professionals",
      label: "Quantidade de profissionais ativos",
    },
    {
      description: "Consultas marcadas, realizadas, canceladas, abertas e pendentes.",
      group: "Assistencial",
      id: "appointments-count",
      label: "Quantidade de consultas",
    },
    {
      description: "Percentual de faltas em relacao ao total agendado.",
      group: "Assistencial",
      id: "absenteeism-rate",
      label: "Absenteismo",
    },
    {
      description: "Total de questionarios respondidos dividido pelas vidas cadastradas.",
      group: "Psicossocial",
      id: "psychosocial-adherence",
      label: "Adesao psicossocial",
    },
    {
      description: "Quantidade de trabalhadores com risco psicossocial alto ou critico.",
      group: "Psicossocial",
      id: "high-risk-workers",
      label: "Clientes em risco alto/critico",
    },
    {
      description: "Quantidade de ASOs vencidos, a vencer e dentro do prazo.",
      group: "SST",
      id: "aso-status",
      label: "ASO vencido ou a vencer",
    },
    {
      description: "Total de acoes abertas, vencidas, concluidas e em andamento.",
      group: "SST",
      id: "action-plan-count",
      label: "Planos de acao por status",
    },
    {
      description: "Valor total gerado no periodo.",
      group: "Financeiro",
      id: "generated-amount",
      label: "Valor total gerado",
      sensitivity: "financial",
    },
    {
      description: "Valor recebido no periodo.",
      group: "Financeiro",
      id: "paid-amount",
      label: "Valor total pago",
      sensitivity: "financial",
    },
    {
      description: "Valor em aberto dividido pelo valor total gerado.",
      group: "Financeiro",
      id: "delinquency-rate",
      label: "Percentual de inadimplencia",
      sensitivity: "financial",
    },
    {
      description: "Valor de pagamento profissional calculado por consultas finalizadas.",
      group: "Financeiro",
      id: "professional-amount",
      label: "Valor a pagar ao profissional",
      sensitivity: "financial",
    },
    {
      description: "Tempo medio entre encerramento da chamada e finalizacao da anamnese.",
      group: "Assistencial",
      id: "clinical-closure-time",
      label: "Tempo medio de fechamento clinico",
      sensitivity: "clinical",
    },
  ],
  members: [
    {
      description: "Industria Horizonte, Rede Norte, novas empresas e grupos economicos.",
      group: "Empresa",
      id: "company-members",
      label: "Empresas e grupos",
    },
    {
      description: "Ativo, suspenso, cancelado, pendente de validacao e encerrado.",
      group: "Status",
      id: "status-members",
      label: "Status cadastrais",
    },
    {
      description: "Clinico Geral, Acolhimento Psicologico e Atendimento Nutricional.",
      group: "Assistencial",
      id: "specialty-members",
      label: "Especialidades de atendimento",
    },
    {
      description: "Baixo, medio, alto e critico, para visao agregada e autorizada.",
      group: "Psicossocial",
      id: "risk-members",
      label: "Faixas de risco psicossocial",
      sensitivity: "sensitive",
    },
    {
      description: "Paga, a pagar, vencida, em negociacao e cancelada.",
      group: "Financeiro",
      id: "billing-members",
      label: "Status financeiros",
      sensitivity: "financial",
    },
    {
      description: "PGR, PCMSO, LTCAT, PPP, ASO, CAT, anexos e evidencias.",
      group: "Documentos",
      id: "document-members",
      label: "Tipos de documentos",
    },
    {
      description: "Fisico, quimico, biologico, ergonomico e acidentes/mecanicos.",
      group: "Risco ocupacional",
      id: "risk-type-members",
      label: "Tipos de riscos ocupacionais",
    },
    {
      description: "Aberto, em andamento, vencido, concluido, assinado e auditado.",
      group: "Operacional",
      id: "workflow-members",
      label: "Status de fluxos e documentos",
    },
  ],
};

const sampleValues: Record<string, string> = {
  "ASO vencido ou a vencer": "8 a vencer",
  "Absenteismo": "4,8%",
  "Adesao psicossocial": "82%",
  "Agentes de risco ocupacional": "Ruido; Ergonomia",
  "Atendimento e agenda": "Acolhimento Psicologico",
  "CNAE / Grau de risco": "22.29-3-99 / Grau 3",
  "CNAE e obrigacoes legais": "PGR, PCMSO, LTCAT",
  "Cadastro do trabalhador": "Rafael Moreira Lima",
  "Campanha psicossocial": "Prazo 30/05/2026",
  "Cargo / CBO": "Operador / 8621-50",
  "Cargo, CBO, setor e GHE": "Operador / Producao / GHE-02",
  "Clientes em risco alto/critico": "12",
  "Contrato e cobertura": "Essencial SST + Saude",
  "Dados cadastrais da empresa": "Industria Horizonte",
  "Empresa": "Industria Horizonte",
  "Empresa > Setor > Cargo > Trabalhador": "Horizonte > Producao > Operador",
  "Especialidade": "Acolhimento Psicologico",
  "Faturas e parcelas": "Parcela 05 / Paga",
  "Pagamento dos profissionais": "14 finalizadas",
  "Percentual de inadimplencia": "17,3%",
  "Periodo": "Maio/2026",
  "Quantidade de clientes ativos": "128",
  "Quantidade de consultas": "86",
  "Quantidade de empresas ativas": "18",
  "Quantidade de profissionais ativos": "5",
  "Setor": "Producao",
  "Status": "Ativo",
  "Timeline do prontuario": "Evento sigiloso",
  "Valor a pagar ao profissional": "R$ 1.260,00",
  "Valor total gerado": "R$ 222.700,00",
  "Valor total pago": "R$ 184.200,00",
};

const sensitivityLabels: Record<NonNullable<ReportField["sensitivity"]>, string> = {
  administrative: "Administrativo",
  clinical: "Clinico sigiloso",
  financial: "Financeiro",
  sensitive: "Sensivel",
};

function initialSelection(): Record<ReportCategory, string[]> {
  return {
    attributes: ["company-registration", "worker-position", "psychosocial-campaign"],
    dimensions: ["company", "sector", "period"],
    hierarchies: ["company-sector-job-worker"],
    measures: ["active-workers", "psychosocial-adherence", "high-risk-workers"],
    members: ["status-members"],
  };
}

function getSelectedFields(selection: Record<ReportCategory, string[]>) {
  return (Object.keys(reportCatalog) as ReportCategory[]).flatMap((category) =>
    reportCatalog[category].filter((field) => selection[category].includes(field.id)),
  );
}

export default function ReportsPage() {
  const [activeCategory, setActiveCategory] = useState<ReportCategory>("dimensions");
  const [selection, setSelection] = useState(initialSelection);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [reportTitle, setReportTitle] = useState("Relatorio ad hoc - acompanhamento SST");
  const [requestedBy, setRequestedBy] = useState("Cliente solicitante");
  const [previewGenerated, setPreviewGenerated] = useState(true);

  const selectedFields = useMemo(() => getSelectedFields(selection), [selection]);
  const selectedCount = selectedFields.length;
  const sensitiveCount = selectedFields.filter((field) => field.sensitivity === "clinical" || field.sensitivity === "sensitive").length;
  const visibleCatalog = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();
    const fields = reportCatalog[activeCategory];

    if (query.length === 0) {
      return fields;
    }

    return fields.filter((field) =>
      [field.label, field.group, field.description].join(" ").toLowerCase().includes(query),
    );
  }, [activeCategory, catalogSearch]);
  const previewColumns = selectedFields.slice(0, 10);

  function toggleField(category: ReportCategory, fieldId: string) {
    setSelection((current) => {
      const selectedIds = current[category];
      const nextIds = selectedIds.includes(fieldId)
        ? selectedIds.filter((id) => id !== fieldId)
        : [...selectedIds, fieldId];

      return { ...current, [category]: nextIds };
    });
    setPreviewGenerated(false);
  }

  function generatePreview() {
    setPreviewGenerated(true);
  }

  function clearSelection() {
    setSelection({
      attributes: [],
      dimensions: [],
      hierarchies: [],
      measures: [],
      members: [],
    });
    setPreviewGenerated(false);
  }

  return (
    <section className="space-y-5">
      <header className="rounded-lg border border-white/70 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-pronus-primary text-white">
              <ModuleIcon className="h-5 w-5" name="reports" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-pronus-primary">
                Relatorios
              </p>
              <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
                Gerador de relatorios ad hoc
              </h1>
            </div>
          </div>
          <div className="grid gap-2 text-sm font-semibold text-slate-700 sm:grid-cols-3">
            <InfoPill label="Campos selecionados" value={String(selectedCount)} />
            <InfoPill label="Campos sensiveis" value={String(sensitiveCount)} />
            <InfoPill label="Modo" value="Previa controlada" />
          </div>
        </div>
      </header>

      <section className="grid gap-5 xl:grid-cols-[430px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <h2 className="text-base font-semibold text-slate-950">Catalogo de campos</h2>
            <p className="mt-1 text-sm text-slate-500">
              Escolha campos por dimensao, hierarquia, atributo, membro e medida.
            </p>
            <label className="mt-4 block text-xs font-semibold uppercase text-slate-500">
              Filtrar catalogo
              <input
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal normal-case text-slate-900 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
                placeholder="Buscar campo, grupo ou descricao"
                type="search"
                value={catalogSearch}
                onChange={(event) => setCatalogSearch(event.target.value)}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2 border-b border-slate-200 p-4">
            {(Object.keys(categoryLabels) as ReportCategory[]).map((category) => (
              <button
                key={category}
                className={`rounded-md border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide transition ${
                  activeCategory === category
                    ? "border-pronus-primary bg-pronus-primary text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-pronus-primary/40 hover:bg-slate-50"
                }`}
                type="button"
                onClick={() => setActiveCategory(category)}
              >
                {categoryLabels[category]}
              </button>
            ))}
          </div>

          <div className="max-h-[650px] space-y-3 overflow-y-auto p-4">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-pronus-primary">
                {categoryLabels[activeCategory]}
              </p>
              <p className="mt-1 text-sm text-slate-600">{categoryDescriptions[activeCategory]}</p>
            </div>

            {visibleCatalog.map((field) => {
              const checked = selection[activeCategory].includes(field.id);

              return (
                <label
                  key={field.id}
                  className={`block cursor-pointer rounded-md border p-3 transition ${
                    checked
                      ? "border-pronus-primary bg-pronus-primary/5"
                      : "border-slate-200 bg-white hover:border-pronus-primary/40"
                  }`}
                >
                  <span className="flex items-start gap-3">
                    <input
                      checked={checked}
                      className="mt-1 h-4 w-4 accent-pronus-primary"
                      type="checkbox"
                      onChange={() => toggleField(activeCategory, field.id)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-950">{field.label}</span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                          {field.group}
                        </span>
                      </span>
                      <span className="mt-1 block text-sm text-slate-500">{field.description}</span>
                      {field.sensitivity !== undefined && (
                        <span className="mt-2 inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                          {sensitivityLabels[field.sensitivity]}
                        </span>
                      )}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </aside>

        <div className="space-y-5">
          <article className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4">
              <h2 className="text-base font-semibold text-slate-950">Composicao do relatorio</h2>
              <p className="mt-1 text-sm text-slate-500">
                Monte a estrutura antes de gerar a previa. Campos clinicos e sensiveis ficam
                destacados para revisao de permissao.
              </p>
            </div>

            <div className="grid gap-4 p-4 2xl:grid-cols-[1fr_1fr_auto]">
              <label className="text-xs font-semibold uppercase text-slate-500">
                Nome do relatorio
                <input
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal normal-case text-slate-900 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
                  value={reportTitle}
                  onChange={(event) => setReportTitle(event.target.value)}
                />
              </label>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Solicitante
                <input
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal normal-case text-slate-900 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
                  value={requestedBy}
                  onChange={(event) => setRequestedBy(event.target.value)}
                />
              </label>
              <div className="flex items-end gap-2">
                <button
                  className="rounded-md bg-pronus-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-pronus-primary/90"
                  type="button"
                  onClick={generatePreview}
                >
                  Gerar previa
                </button>
                <button
                  className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-pronus-primary hover:text-pronus-primary"
                  type="button"
                  onClick={clearSelection}
                >
                  Limpar
                </button>
              </div>
            </div>

            <div className="grid gap-4 border-t border-slate-200 p-4 md:grid-cols-2 2xl:grid-cols-5">
              {(Object.keys(categoryLabels) as ReportCategory[]).map((category) => (
                <SelectionColumn
                  key={category}
                  fields={reportCatalog[category].filter((field) =>
                    selection[category].includes(field.id),
                  )}
                  title={categoryLabels[category]}
                />
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Previa do relatorio</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {reportTitle} / {requestedBy}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-pronus-primary hover:text-pronus-primary"
                  type="button"
                >
                  Salvar definicao
                </button>
                <button
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-pronus-primary hover:text-pronus-primary"
                  type="button"
                >
                  Exportar CSV
                </button>
                <button
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-pronus-primary hover:text-pronus-primary"
                  type="button"
                >
                  Exportar PDF
                </button>
              </div>
            </div>

            {!previewGenerated || previewColumns.length === 0 ? (
              <div className="p-6">
                <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <h3 className="text-base font-semibold text-slate-950">
                    Selecione campos e gere uma previa
                  </h3>
                  <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
                    A previa ajuda o operador PRONUS a conferir se o relatorio atende ao pedido do
                    cliente antes de salvar ou exportar.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto p-4">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      {previewColumns.map((field) => (
                        <th key={field.id} className="whitespace-nowrap px-4 py-3">
                          {field.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {[0, 1, 2].map((row) => (
                      <tr key={row} className="hover:bg-slate-50">
                        {previewColumns.map((field) => (
                          <td key={`${row}-${field.id}`} className="whitespace-nowrap px-4 py-3 text-slate-700">
                            {sampleValues[field.label] ?? (row === 0 ? "Amostra operacional" : "Conforme filtro")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>

          <article className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <h2 className="font-semibold">Governanca e LGPD</h2>
            <p className="mt-1">
              Relatorios com dados clinicos, psicossociais ou financeiros devem respeitar perfil de
              acesso, finalidade, minimo necessario e registro de auditoria antes do envio ao cliente.
            </p>
          </article>
        </div>
      </section>
    </section>
  );
}

function InfoPill({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <span className="block text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <strong className="mt-0.5 block text-slate-950">{value}</strong>
    </div>
  );
}

function SelectionColumn({
  fields,
  title,
}: Readonly<{ fields: ReportField[]; title: string }>) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="mt-3 space-y-2">
        {fields.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum campo selecionado</p>
        ) : (
          fields.map((field) => (
            <div key={field.id} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700">
              {field.label}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
