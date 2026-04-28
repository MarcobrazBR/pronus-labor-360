"use client";

import { riskLevelColorClasses, riskLevelLabels } from "@pronus/ui";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { Nr01ActionPlanItem, Nr01Document, Nr01Evidence, Nr01Risk } from "../pronus-data";
import {
  actionStatusClasses,
  documentStatusClasses,
  evidenceStatusClasses,
  nr01ActionStatusLabels,
} from "../pronus-data";

type TabId = "inventory" | "actions" | "evidences" | "documents";
type ModalKind = "risk" | "action" | "evidence" | "document" | null;
type RiskType = NonNullable<Nr01Risk["type"]>;

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "inventory", label: "Inventario" },
  { id: "actions", label: "Plano de acao" },
  { id: "evidences", label: "Evidencias" },
  { id: "documents", label: "Documentos" },
];

const riskTypeLabels: Record<RiskType, string> = {
  physical: "Fisico",
  chemical: "Quimico",
  biological: "Biologico",
  ergonomic: "Ergonomico",
  accident: "Acidente",
};

const riskStatusLabels: Record<Nr01Risk["status"], string> = {
  draft: "Rascunho",
  active: "Ativo",
  review: "Revisao",
  archived: "Arquivado",
};

const evidenceTypeLabels: Record<Nr01Evidence["type"], string> = {
  photo: "Foto",
  report: "Relatorio",
  training_record: "Treinamento",
  measurement: "Medicao",
  other: "Outro",
};

const evidenceStatusLabels: Record<Nr01Evidence["status"], string> = {
  pending_review: "Em revisao",
  accepted: "Aceita",
  rejected: "Rejeitada",
};

const documentTypeLabels: Record<Nr01Document["type"], string> = {
  pgr: "PGR",
  inventory: "Inventario",
  technical_report: "Relatorio tecnico",
  action_plan: "Plano de acao",
  other: "Outro",
};

const documentStatusLabels: Record<Nr01Document["status"], string> = {
  draft: "Rascunho",
  in_review: "Em revisao",
  approved: "Aprovado",
  published: "Publicado",
};

const initialRiskForm = {
  companyTradeName: "",
  unitName: "",
  departmentName: "",
  jobPositionTitle: "",
  type: "physical" as RiskType,
  danger: "",
  risk: "",
  probability: "3",
  severity: "3",
  controlMeasures: "",
};

const initialActionForm = {
  riskId: "",
  title: "",
  responsible: "",
  dueDate: "",
};

const initialEvidenceForm = {
  actionId: "",
  title: "",
  type: "report" as Nr01Evidence["type"],
  responsible: "",
  receivedAt: "",
  notes: "",
};

const initialDocumentForm = {
  companyTradeName: "",
  title: "",
  type: "pgr" as Nr01Document["type"],
  referencePeriod: "2026",
};

export function OccupationalRiskPanel({
  initialRisks,
  initialActions,
  initialEvidences,
  initialDocuments,
}: Readonly<{
  initialRisks: Nr01Risk[];
  initialActions: Nr01ActionPlanItem[];
  initialEvidences: Nr01Evidence[];
  initialDocuments: Nr01Document[];
}>) {
  const [activeTab, setActiveTab] = useState<TabId>("inventory");
  const [risks, setRisks] = useState(initialRisks);
  const [actions, setActions] = useState(initialActions);
  const [evidences, setEvidences] = useState(initialEvidences);
  const [documents, setDocuments] = useState(initialDocuments);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState<ModalKind>(null);
  const [message, setMessage] = useState<string | undefined>();
  const [riskForm, setRiskForm] = useState(initialRiskForm);
  const [actionForm, setActionForm] = useState({
    ...initialActionForm,
    riskId: initialRisks[0]?.id ?? "",
  });
  const [evidenceForm, setEvidenceForm] = useState({
    ...initialEvidenceForm,
    actionId: initialActions[0]?.id ?? "",
  });
  const [documentForm, setDocumentForm] = useState(initialDocumentForm);

  const computedSummary = useMemo(() => {
    const visibleRisks = risks.filter((risk) => risk.status !== "archived");
    const visibleActions = actions.filter((action) => action.status !== "done");

    return {
      risks: visibleRisks.length,
      highOrCritical: visibleRisks.filter(
        (risk) => risk.level === "high" || risk.level === "critical",
      ).length,
      openActions: visibleActions.filter(
        (action) => action.status === "open" || action.status === "in_progress",
      ).length,
      evidences: evidences.filter((evidence) => evidence.status !== "rejected").length,
    };
  }, [actions, evidences, risks]);

  const summaryCards = [
    { label: "Riscos", value: computedSummary.risks, detail: "inventario ativo" },
    {
      label: "Altos/Criticos",
      value: computedSummary.highOrCritical,
      detail: "prioridade tecnica",
    },
    { label: "Acoes abertas", value: computedSummary.openActions, detail: "plano PGR" },
    { label: "Evidencias", value: computedSummary.evidences, detail: "anexos vinculados" },
  ];

  const filteredRisks = risks.filter((risk) => {
    const searchable = [
      risk.companyTradeName,
      risk.departmentName,
      risk.jobPositionTitle,
      risk.danger,
      risk.risk,
      riskStatusLabels[risk.status],
      risk.level,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matches(searchable, query) && (statusFilter === "all" || risk.status === statusFilter);
  });

  const filteredActions = actions.filter((action) => {
    const searchable = [
      action.companyTradeName,
      action.title,
      action.responsible,
      action.dueDate,
      nr01ActionStatusLabels[action.status],
    ]
      .join(" ")
      .toLowerCase();

    return matches(searchable, query) && (statusFilter === "all" || action.status === statusFilter);
  });

  const filteredEvidences = evidences.filter((evidence) => {
    const searchable = [
      evidence.companyTradeName,
      evidence.title,
      evidence.responsible,
      evidenceTypeLabels[evidence.type],
      evidenceStatusLabels[evidence.status],
      evidence.notes,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      matches(searchable, query) && (statusFilter === "all" || evidence.status === statusFilter)
    );
  });

  const filteredDocuments = documents.filter((document) => {
    const searchable = [
      document.companyTradeName,
      document.title,
      documentTypeLabels[document.type],
      documentStatusLabels[document.status],
      document.referencePeriod,
    ]
      .join(" ")
      .toLowerCase();

    return (
      matches(searchable, query) && (statusFilter === "all" || document.status === statusFilter)
    );
  });

  const currentCount =
    activeTab === "inventory"
      ? filteredRisks.length
      : activeTab === "actions"
        ? filteredActions.length
        : activeTab === "evidences"
          ? filteredEvidences.length
          : filteredDocuments.length;

  function changeTab(tabId: TabId) {
    setActiveTab(tabId);
    setQuery("");
    setStatusFilter("all");
    setMessage(undefined);
  }

  function openModal(kind: Exclude<ModalKind, null>) {
    setModal(kind);
    setMessage(undefined);

    if (kind === "action") {
      setActionForm((current) => ({ ...current, riskId: current.riskId || risks[0]?.id || "" }));
    }

    if (kind === "evidence") {
      setEvidenceForm((current) => ({
        ...current,
        actionId: current.actionId || actions[0]?.id || "",
      }));
    }
  }

  function closeModal() {
    setModal(null);
  }

  function submitRisk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      riskForm.companyTradeName.trim().length === 0 ||
      riskForm.departmentName.trim().length === 0 ||
      riskForm.danger.trim().length === 0 ||
      riskForm.risk.trim().length === 0
    ) {
      setMessage("Preencha empresa, setor, perigo e risco para cadastrar.");
      return;
    }

    const probability = numberFromField(riskForm.probability);
    const severity = numberFromField(riskForm.severity);
    const createdRisk: Nr01Risk = {
      id: `risk-local-${Date.now()}`,
      companyTradeName: riskForm.companyTradeName.trim(),
      unitName: riskForm.unitName.trim() || undefined,
      departmentName: riskForm.departmentName.trim(),
      jobPositionTitle: riskForm.jobPositionTitle.trim() || undefined,
      type: riskForm.type,
      danger: riskForm.danger.trim(),
      risk: riskForm.risk.trim(),
      probability,
      severity,
      level: classifyRisk(probability, severity),
      controlMeasures: splitMeasures(riskForm.controlMeasures),
      status: "active",
    };

    setRisks((current) => [createdRisk, ...current]);
    setRiskForm(initialRiskForm);
    setMessage("Risco cadastrado no painel do MVP.");
    closeModal();
  }

  function submitAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedRisk = risks.find((risk) => risk.id === actionForm.riskId);

    if (
      selectedRisk === undefined ||
      actionForm.title.trim().length === 0 ||
      actionForm.responsible.trim().length === 0 ||
      actionForm.dueDate.trim().length === 0
    ) {
      setMessage("Selecione um risco e preencha acao, responsavel e prazo.");
      return;
    }

    const createdAction: Nr01ActionPlanItem = {
      id: `action-local-${Date.now()}`,
      riskId: selectedRisk.id,
      companyTradeName: selectedRisk.companyTradeName,
      title: actionForm.title.trim(),
      responsible: actionForm.responsible.trim(),
      dueDate: actionForm.dueDate,
      status: "open",
      evidenceCount: 0,
    };

    setActions((current) => [createdAction, ...current]);
    setActionForm({ ...initialActionForm, riskId: risks[0]?.id ?? "" });
    setMessage("Acao incluida no plano.");
    closeModal();
  }

  function submitEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedAction = actions.find((action) => action.id === evidenceForm.actionId);

    if (
      selectedAction === undefined ||
      evidenceForm.title.trim().length === 0 ||
      evidenceForm.responsible.trim().length === 0
    ) {
      setMessage("Selecione uma acao e preencha evidencia e responsavel.");
      return;
    }

    const createdEvidence: Nr01Evidence = {
      id: `evidence-local-${Date.now()}`,
      actionId: selectedAction.id,
      riskId: selectedAction.riskId ?? "",
      companyTradeName: selectedAction.companyTradeName,
      title: evidenceForm.title.trim(),
      type: evidenceForm.type,
      responsible: evidenceForm.responsible.trim(),
      receivedAt: evidenceForm.receivedAt || new Date().toISOString().slice(0, 10),
      status: "pending_review",
      notes: evidenceForm.notes.trim() || undefined,
    };

    setEvidences((current) => [createdEvidence, ...current]);
    setActions((current) =>
      current.map((action) =>
        action.id === selectedAction.id
          ? { ...action, evidenceCount: action.evidenceCount + 1 }
          : action,
      ),
    );
    setEvidenceForm({ ...initialEvidenceForm, actionId: actions[0]?.id ?? "" });
    setMessage("Evidencia anexada para revisao.");
    closeModal();
  }

  function submitDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      documentForm.companyTradeName.trim().length === 0 ||
      documentForm.title.trim().length === 0 ||
      documentForm.referencePeriod.trim().length === 0
    ) {
      setMessage("Preencha empresa, documento e periodo.");
      return;
    }

    const createdDocument: Nr01Document = {
      id: `document-local-${Date.now()}`,
      companyTradeName: documentForm.companyTradeName.trim(),
      title: documentForm.title.trim(),
      type: documentForm.type,
      referencePeriod: documentForm.referencePeriod.trim(),
      status: "draft",
      generatedAt: new Date().toISOString().slice(0, 10),
    };

    setDocuments((current) => [createdDocument, ...current]);
    setDocumentForm(initialDocumentForm);
    setMessage("Documento criado como rascunho.");
    closeModal();
  }

  return (
    <>
      <nav
        className="mb-5 flex flex-wrap gap-2 text-sm font-semibold"
        aria-label="Risco ocupacional"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            aria-pressed={activeTab === tab.id}
            className={`rounded-md px-3 py-2 transition ${
              activeTab === tab.id
                ? "bg-pronus-primary text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:border-pronus-primary/40"
            }`}
            type="button"
            onClick={() => changeTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article key={card.label} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <strong className="mt-2 block text-3xl font-semibold tracking-normal">
              {card.value}
            </strong>
            <span className="mt-2 block text-sm text-slate-600">{card.detail}</span>
          </article>
        ))}
      </section>

      <section className="mt-4 rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold">{currentTitle(activeTab)}</h3>
            <span className="mt-1 inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {currentCount} registros
            </span>
          </div>
          <button
            aria-label={currentCreateLabel(activeTab)}
            className="flex h-10 w-10 items-center justify-center rounded-md bg-pronus-primary text-lg font-semibold text-white shadow-sm hover:bg-pronus-primary/90"
            type="button"
            onClick={() => openModal(currentModal(activeTab))}
          >
            +
          </button>
        </div>

        <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-[minmax(220px,1fr)_190px_auto]">
          <label className="text-xs font-semibold uppercase text-slate-500">
            Pesquisar
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal normal-case text-pronus-text outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
              placeholder={currentPlaceholder(activeTab)}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="text-xs font-semibold uppercase text-slate-500">
            Status
            <select
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case text-pronus-text outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {statusOptions(activeTab).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            className="h-10 self-end rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:border-pronus-primary/40"
            type="button"
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
            }}
          >
            Limpar
          </button>
        </div>

        {message !== undefined && (
          <div className="border-b border-slate-100 bg-sky-50 px-5 py-3 text-sm font-medium text-sky-800">
            {message}
          </div>
        )}

        {activeTab === "inventory" && (
          <RiskList risks={filteredRisks} onChangeStatus={setRiskStatus} />
        )}
        {activeTab === "actions" && (
          <ActionList actions={filteredActions} onChangeStatus={setActionStatus} />
        )}
        {activeTab === "evidences" && (
          <EvidenceList evidences={filteredEvidences} onChangeStatus={setEvidenceStatus} />
        )}
        {activeTab === "documents" && (
          <DocumentList documents={filteredDocuments} onChangeStatus={setDocumentStatus} />
        )}
      </section>

      {modal === "risk" && (
        <Modal title="Cadastrar risco" onClose={closeModal}>
          <form className="grid gap-3" onSubmit={submitRisk}>
            <div className="grid gap-3 md:grid-cols-2">
              <TextField
                label="Empresa"
                value={riskForm.companyTradeName}
                onChange={(value) =>
                  setRiskForm((current) => ({ ...current, companyTradeName: value }))
                }
              />
              <TextField
                label="Unidade"
                value={riskForm.unitName}
                onChange={(value) => setRiskForm((current) => ({ ...current, unitName: value }))}
              />
              <TextField
                label="Setor"
                value={riskForm.departmentName}
                onChange={(value) =>
                  setRiskForm((current) => ({ ...current, departmentName: value }))
                }
              />
              <TextField
                label="Cargo"
                value={riskForm.jobPositionTitle}
                onChange={(value) =>
                  setRiskForm((current) => ({ ...current, jobPositionTitle: value }))
                }
              />
              <SelectField
                label="Tipo"
                value={riskForm.type}
                options={toOptions(riskTypeLabels)}
                onChange={(value) =>
                  setRiskForm((current) => ({ ...current, type: value as RiskType }))
                }
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <NumberField
                  label="Probabilidade"
                  value={riskForm.probability}
                  onChange={(value) =>
                    setRiskForm((current) => ({ ...current, probability: value }))
                  }
                />
                <NumberField
                  label="Severidade"
                  value={riskForm.severity}
                  onChange={(value) => setRiskForm((current) => ({ ...current, severity: value }))}
                />
              </div>
            </div>
            <TextField
              label="Perigo"
              value={riskForm.danger}
              onChange={(value) => setRiskForm((current) => ({ ...current, danger: value }))}
            />
            <TextField
              label="Risco"
              value={riskForm.risk}
              onChange={(value) => setRiskForm((current) => ({ ...current, risk: value }))}
            />
            <TextareaField
              label="Medidas de controle"
              value={riskForm.controlMeasures}
              onChange={(value) =>
                setRiskForm((current) => ({ ...current, controlMeasures: value }))
              }
            />
            <ModalActions onClose={closeModal} submitLabel="Salvar risco" />
          </form>
        </Modal>
      )}

      {modal === "action" && (
        <Modal title="Incluir acao" onClose={closeModal}>
          <form className="grid gap-3" onSubmit={submitAction}>
            <SelectField
              label="Risco vinculado"
              value={actionForm.riskId}
              options={risks.map((risk) => ({
                label: `${risk.companyTradeName} / ${risk.danger}`,
                value: risk.id,
              }))}
              onChange={(value) => setActionForm((current) => ({ ...current, riskId: value }))}
            />
            <TextField
              label="Acao"
              value={actionForm.title}
              onChange={(value) => setActionForm((current) => ({ ...current, title: value }))}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <TextField
                label="Responsavel"
                value={actionForm.responsible}
                onChange={(value) =>
                  setActionForm((current) => ({ ...current, responsible: value }))
                }
              />
              <TextField
                label="Prazo"
                type="date"
                value={actionForm.dueDate}
                onChange={(value) => setActionForm((current) => ({ ...current, dueDate: value }))}
              />
            </div>
            <ModalActions onClose={closeModal} submitLabel="Salvar acao" />
          </form>
        </Modal>
      )}

      {modal === "evidence" && (
        <Modal title="Anexar evidencia" onClose={closeModal}>
          <form className="grid gap-3" onSubmit={submitEvidence}>
            <SelectField
              label="Acao vinculada"
              value={evidenceForm.actionId}
              options={actions.map((action) => ({
                label: `${action.companyTradeName} / ${action.title}`,
                value: action.id,
              }))}
              onChange={(value) => setEvidenceForm((current) => ({ ...current, actionId: value }))}
            />
            <TextField
              label="Evidencia"
              value={evidenceForm.title}
              onChange={(value) => setEvidenceForm((current) => ({ ...current, title: value }))}
            />
            <div className="grid gap-3 md:grid-cols-3">
              <SelectField
                label="Tipo"
                value={evidenceForm.type}
                options={toOptions(evidenceTypeLabels)}
                onChange={(value) =>
                  setEvidenceForm((current) => ({
                    ...current,
                    type: value as Nr01Evidence["type"],
                  }))
                }
              />
              <TextField
                label="Responsavel"
                value={evidenceForm.responsible}
                onChange={(value) =>
                  setEvidenceForm((current) => ({ ...current, responsible: value }))
                }
              />
              <TextField
                label="Recebimento"
                type="date"
                value={evidenceForm.receivedAt}
                onChange={(value) =>
                  setEvidenceForm((current) => ({ ...current, receivedAt: value }))
                }
              />
            </div>
            <TextareaField
              label="Observacoes"
              value={evidenceForm.notes}
              onChange={(value) => setEvidenceForm((current) => ({ ...current, notes: value }))}
            />
            <ModalActions onClose={closeModal} submitLabel="Salvar evidencia" />
          </form>
        </Modal>
      )}

      {modal === "document" && (
        <Modal title="Gerar documento" onClose={closeModal}>
          <form className="grid gap-3" onSubmit={submitDocument}>
            <div className="grid gap-3 md:grid-cols-2">
              <TextField
                label="Empresa"
                value={documentForm.companyTradeName}
                onChange={(value) =>
                  setDocumentForm((current) => ({ ...current, companyTradeName: value }))
                }
              />
              <TextField
                label="Periodo"
                value={documentForm.referencePeriod}
                onChange={(value) =>
                  setDocumentForm((current) => ({ ...current, referencePeriod: value }))
                }
              />
              <TextField
                label="Documento"
                value={documentForm.title}
                onChange={(value) => setDocumentForm((current) => ({ ...current, title: value }))}
              />
              <SelectField
                label="Tipo"
                value={documentForm.type}
                options={toOptions(documentTypeLabels)}
                onChange={(value) =>
                  setDocumentForm((current) => ({
                    ...current,
                    type: value as Nr01Document["type"],
                  }))
                }
              />
            </div>
            <ModalActions onClose={closeModal} submitLabel="Salvar documento" />
          </form>
        </Modal>
      )}
    </>
  );

  function setRiskStatus(id: string, status: Nr01Risk["status"]) {
    setRisks((current) => current.map((risk) => (risk.id === id ? { ...risk, status } : risk)));
  }

  function setActionStatus(id: string, status: Nr01ActionPlanItem["status"]) {
    setActions((current) =>
      current.map((action) => (action.id === id ? { ...action, status } : action)),
    );
  }

  function setEvidenceStatus(id: string, status: Nr01Evidence["status"]) {
    setEvidences((current) =>
      current.map((evidence) => (evidence.id === id ? { ...evidence, status } : evidence)),
    );
  }

  function setDocumentStatus(id: string, status: Nr01Document["status"]) {
    setDocuments((current) =>
      current.map((document) => (document.id === id ? { ...document, status } : document)),
    );
  }
}

function RiskList({
  risks,
  onChangeStatus,
}: Readonly<{
  risks: Nr01Risk[];
  onChangeStatus: (id: string, status: Nr01Risk["status"]) => void;
}>) {
  if (risks.length === 0) {
    return <EmptyState message="Nenhum risco encontrado para os filtros informados." />;
  }

  return (
    <div className="divide-y divide-slate-100">
      {risks.map((risk) => (
        <article key={risk.id} className="grid gap-4 px-5 py-4 xl:grid-cols-[1fr_auto]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-semibold">{risk.danger}</h4>
              {risk.type !== undefined && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {riskTypeLabels[risk.type]}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {risk.companyTradeName} / {risk.departmentName}
              {risk.jobPositionTitle !== undefined ? ` / ${risk.jobPositionTitle}` : ""}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {risk.risk} / P{risk.probability} x S{risk.severity}
            </p>
            {risk.controlMeasures !== undefined && risk.controlMeasures.length > 0 && (
              <p className="mt-2 text-xs text-slate-500">
                Controles: {risk.controlMeasures.join(", ")}
              </p>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-[auto_150px] xl:justify-end">
            <span
              className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${riskLevelColorClasses[risk.level]}`}
            >
              {riskLevelLabels[risk.level]}
            </span>
            <select
              aria-label={`Status de ${risk.danger}`}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
              value={risk.status}
              onChange={(event) =>
                onChangeStatus(risk.id, event.target.value as Nr01Risk["status"])
              }
            >
              {toOptions(riskStatusLabels).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </article>
      ))}
    </div>
  );
}

function ActionList({
  actions,
  onChangeStatus,
}: Readonly<{
  actions: Nr01ActionPlanItem[];
  onChangeStatus: (id: string, status: Nr01ActionPlanItem["status"]) => void;
}>) {
  if (actions.length === 0) {
    return <EmptyState message="Nenhuma acao encontrada para os filtros informados." />;
  }

  return (
    <div className="divide-y divide-slate-100">
      {actions.map((action) => (
        <article key={action.id} className="grid gap-4 px-5 py-4 xl:grid-cols-[1fr_auto]">
          <div>
            <h4 className="text-sm font-semibold">{action.title}</h4>
            <p className="mt-1 text-sm text-slate-600">
              {action.companyTradeName} / {action.responsible}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Prazo {dateLabel(action.dueDate)} / evidencias {action.evidenceCount}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[auto_160px] xl:justify-end">
            <span
              className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${actionStatusClasses(
                action.status,
              )}`}
            >
              {nr01ActionStatusLabels[action.status]}
            </span>
            <select
              aria-label={`Status de ${action.title}`}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
              value={action.status}
              onChange={(event) =>
                onChangeStatus(action.id, event.target.value as Nr01ActionPlanItem["status"])
              }
            >
              {Object.entries(nr01ActionStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </article>
      ))}
    </div>
  );
}

function EvidenceList({
  evidences,
  onChangeStatus,
}: Readonly<{
  evidences: Nr01Evidence[];
  onChangeStatus: (id: string, status: Nr01Evidence["status"]) => void;
}>) {
  if (evidences.length === 0) {
    return <EmptyState message="Nenhuma evidencia encontrada para os filtros informados." />;
  }

  return (
    <div className="divide-y divide-slate-100">
      {evidences.map((evidence) => (
        <article key={evidence.id} className="grid gap-4 px-5 py-4 xl:grid-cols-[1fr_auto]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-semibold">{evidence.title}</h4>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {evidenceTypeLabels[evidence.type]}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {evidence.companyTradeName} / {evidence.responsible}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Recebida em {dateLabel(evidence.receivedAt)}
            </p>
            {evidence.notes !== undefined && (
              <p className="mt-2 text-xs text-slate-500">{evidence.notes}</p>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-[auto_160px] xl:justify-end">
            <span
              className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${evidenceStatusClasses(
                evidence.status,
              )}`}
            >
              {evidenceStatusLabels[evidence.status]}
            </span>
            <select
              aria-label={`Status de ${evidence.title}`}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
              value={evidence.status}
              onChange={(event) =>
                onChangeStatus(evidence.id, event.target.value as Nr01Evidence["status"])
              }
            >
              {toOptions(evidenceStatusLabels).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </article>
      ))}
    </div>
  );
}

function DocumentList({
  documents,
  onChangeStatus,
}: Readonly<{
  documents: Nr01Document[];
  onChangeStatus: (id: string, status: Nr01Document["status"]) => void;
}>) {
  if (documents.length === 0) {
    return <EmptyState message="Nenhum documento encontrado para os filtros informados." />;
  }

  return (
    <div className="divide-y divide-slate-100">
      {documents.map((document) => (
        <article key={document.id} className="grid gap-4 px-5 py-4 xl:grid-cols-[1fr_auto]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-semibold">{document.title}</h4>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {documentTypeLabels[document.type]}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {document.companyTradeName} / periodo {document.referencePeriod}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Gerado em {dateLabel(document.generatedAt)}
              {document.approvedAt !== undefined
                ? ` / aprovado em ${dateLabel(document.approvedAt)}`
                : ""}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[auto_160px] xl:justify-end">
            <span
              className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${documentStatusClasses(
                document.status,
              )}`}
            >
              {documentStatusLabels[document.status]}
            </span>
            <select
              aria-label={`Status de ${document.title}`}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
              value={document.status}
              onChange={(event) =>
                onChangeStatus(document.id, event.target.value as Nr01Document["status"])
              }
            >
              {toOptions(documentStatusLabels).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </article>
      ))}
    </div>
  );
}

function Modal({
  children,
  title,
  onClose,
}: Readonly<{ children: ReactNode; title: string; onClose: () => void }>) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6">
      <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold">{title}</h3>
          <button
            aria-label="Fechar"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:border-pronus-primary"
            type="button"
            onClick={onClose}
          >
            x
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}>) {
  return (
    <label className="text-xs font-semibold uppercase text-slate-500">
      {label}
      <input
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal normal-case text-pronus-text outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: Readonly<{ label: string; value: string; onChange: (value: string) => void }>) {
  return (
    <label className="text-xs font-semibold uppercase text-slate-500">
      {label}
      <input
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal normal-case text-pronus-text outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
        max={5}
        min={1}
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: Readonly<{
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}>) {
  return (
    <label className="text-xs font-semibold uppercase text-slate-500">
      {label}
      <select
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case text-pronus-text outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextareaField({
  label,
  value,
  onChange,
}: Readonly<{ label: string; value: string; onChange: (value: string) => void }>) {
  return (
    <label className="text-xs font-semibold uppercase text-slate-500">
      {label}
      <textarea
        className="mt-2 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal normal-case text-pronus-text outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ModalActions({
  onClose,
  submitLabel,
}: Readonly<{ onClose: () => void; submitLabel: string }>) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
      <button
        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
        type="button"
        onClick={onClose}
      >
        Cancelar
      </button>
      <button
        className="rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white"
        type="submit"
      >
        {submitLabel}
      </button>
    </div>
  );
}

function EmptyState({ message }: Readonly<{ message: string }>) {
  return <div className="px-5 py-8 text-sm text-slate-500">{message}</div>;
}

function matches(searchable: string, query: string) {
  return query.trim().length === 0 || searchable.includes(query.trim().toLowerCase());
}

function currentTitle(tabId: TabId) {
  if (tabId === "inventory") {
    return "Inventario de riscos";
  }

  if (tabId === "actions") {
    return "Plano de acao";
  }

  if (tabId === "evidences") {
    return "Evidencias";
  }

  return "Documentos";
}

function currentCreateLabel(tabId: TabId) {
  if (tabId === "inventory") {
    return "Cadastrar risco";
  }

  if (tabId === "actions") {
    return "Incluir acao";
  }

  if (tabId === "evidences") {
    return "Anexar evidencia";
  }

  return "Gerar documento";
}

function currentModal(tabId: TabId): Exclude<ModalKind, null> {
  if (tabId === "inventory") {
    return "risk";
  }

  if (tabId === "actions") {
    return "action";
  }

  if (tabId === "evidences") {
    return "evidence";
  }

  return "document";
}

function currentPlaceholder(tabId: TabId) {
  if (tabId === "inventory") {
    return "Empresa, setor, cargo, perigo ou risco";
  }

  if (tabId === "actions") {
    return "Empresa, acao, responsavel ou prazo";
  }

  if (tabId === "evidences") {
    return "Empresa, evidencia, responsavel ou tipo";
  }

  return "Empresa, documento, tipo ou periodo";
}

function statusOptions(tabId: TabId) {
  const all = [{ label: "Todos", value: "all" }];

  if (tabId === "inventory") {
    return [...all, ...toOptions(riskStatusLabels)];
  }

  if (tabId === "actions") {
    return [
      ...all,
      ...Object.entries(nr01ActionStatusLabels).map(([value, label]) => ({ label, value })),
    ];
  }

  if (tabId === "evidences") {
    return [...all, ...toOptions(evidenceStatusLabels)];
  }

  return [...all, ...toOptions(documentStatusLabels)];
}

function classifyRisk(probability: number, severity: number): Nr01Risk["level"] {
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

function numberFromField(value: string) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    return 1;
  }

  return Math.min(Math.max(parsed, 1), 5);
}

function splitMeasures(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toOptions<T extends string>(labels: Record<T, string>) {
  return Object.entries(labels).map(([value, label]) => ({ label: String(label), value }));
}

function dateLabel(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}
