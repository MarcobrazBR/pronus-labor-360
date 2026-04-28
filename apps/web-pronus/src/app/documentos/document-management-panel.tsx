"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import type {
  DocumentAudience,
  DocumentPublication,
  DocumentPublicationStatus,
  DocumentSignatureRequest,
  DocumentSignatureStatus,
  DocumentTemplate,
  DocumentTemplateStatus,
  DocumentsSummary,
  PronusDocument,
  PronusDocumentStatus,
  PronusDocumentType,
} from "../pronus-data";
import {
  documentAudienceLabels,
  documentPublicationStatusClasses,
  documentPublicationStatusLabels,
  documentSignatureStatusClasses,
  documentSignatureStatusLabels,
  documentTemplateStatusClasses,
  documentTemplateStatusLabels,
  pronusDocumentStatusClasses,
  pronusDocumentStatusLabels,
  pronusDocumentTypeLabels,
} from "../pronus-data";

type TabId = "documents" | "templates" | "publications" | "signatures";
type ModalKind = TabId | null;

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "documents", label: "Documentos" },
  { id: "templates", label: "Modelos" },
  { id: "publications", label: "Publicacoes" },
  { id: "signatures", label: "Assinaturas" },
];

const initialDocumentForm = {
  title: "",
  companyTradeName: "",
  type: "pgr" as PronusDocumentType,
  owner: "",
  dueDate: "",
};

const initialTemplateForm = {
  name: "",
  type: "pgr" as PronusDocumentType,
  owner: "",
};

const initialPublicationForm = {
  documentId: "",
  audience: "client_hr" as DocumentAudience,
  expiresAt: "",
};

const initialSignatureForm = {
  documentId: "",
  signerName: "",
  signerRole: "",
  expiresAt: "",
};

export function DocumentManagementPanel({
  summary,
  initialDocuments,
  initialTemplates,
  initialPublications,
  initialSignatures,
}: Readonly<{
  summary: DocumentsSummary;
  initialDocuments: PronusDocument[];
  initialTemplates: DocumentTemplate[];
  initialPublications: DocumentPublication[];
  initialSignatures: DocumentSignatureRequest[];
}>) {
  const [activeTab, setActiveTab] = useState<TabId>("documents");
  const [documents, setDocuments] = useState(initialDocuments);
  const [templates, setTemplates] = useState(initialTemplates);
  const [publications, setPublications] = useState(initialPublications);
  const [signatures, setSignatures] = useState(initialSignatures);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState<ModalKind>(null);
  const [message, setMessage] = useState<string | undefined>();
  const [documentForm, setDocumentForm] = useState(initialDocumentForm);
  const [templateForm, setTemplateForm] = useState(initialTemplateForm);
  const [publicationForm, setPublicationForm] = useState({
    ...initialPublicationForm,
    documentId: initialDocuments[0]?.id ?? "",
  });
  const [signatureForm, setSignatureForm] = useState({
    ...initialSignatureForm,
    documentId: initialDocuments[0]?.id ?? "",
  });

  const computedSummary = useMemo(
    () => ({
      documents: Math.max(summary.documents, documents.length),
      pendingReview: documents.filter((document) => document.status === "in_review").length,
      published: documents.filter((document) => document.status === "published").length,
      pendingSignatures: signatures.filter((signature) => signature.status === "pending").length,
    }),
    [documents, signatures, summary.documents],
  );

  const summaryCards = [
    { label: "Documentos", value: computedSummary.documents, detail: "itens controlados" },
    { label: "Em revisao", value: computedSummary.pendingReview, detail: "aguardando validacao" },
    { label: "Publicados", value: computedSummary.published, detail: "visiveis ao publico-alvo" },
    {
      label: "Assinaturas",
      value: computedSummary.pendingSignatures,
      detail: "pendentes de aceite",
    },
  ];

  const filteredDocuments = documents.filter((document) => {
    const searchable = [
      document.title,
      document.companyTradeName,
      document.owner,
      document.version,
      pronusDocumentTypeLabels[document.type],
      pronusDocumentStatusLabels[document.status],
    ]
      .join(" ")
      .toLowerCase();

    return (
      matches(searchable, query) && (statusFilter === "all" || document.status === statusFilter)
    );
  });

  const filteredTemplates = templates.filter((template) => {
    const searchable = [
      template.name,
      template.owner,
      template.version,
      pronusDocumentTypeLabels[template.type],
      documentTemplateStatusLabels[template.status],
    ]
      .join(" ")
      .toLowerCase();

    return (
      matches(searchable, query) && (statusFilter === "all" || template.status === statusFilter)
    );
  });

  const filteredPublications = publications.filter((publication) => {
    const searchable = [
      publication.title,
      publication.companyTradeName,
      documentAudienceLabels[publication.audience],
      documentPublicationStatusLabels[publication.status],
    ]
      .join(" ")
      .toLowerCase();

    return (
      matches(searchable, query) && (statusFilter === "all" || publication.status === statusFilter)
    );
  });

  const filteredSignatures = signatures.filter((signature) => {
    const searchable = [
      signature.title,
      signature.companyTradeName,
      signature.signerName,
      signature.signerRole,
      documentSignatureStatusLabels[signature.status],
    ]
      .join(" ")
      .toLowerCase();

    return (
      matches(searchable, query) && (statusFilter === "all" || signature.status === statusFilter)
    );
  });

  const currentCount =
    activeTab === "documents"
      ? filteredDocuments.length
      : activeTab === "templates"
        ? filteredTemplates.length
        : activeTab === "publications"
          ? filteredPublications.length
          : filteredSignatures.length;

  function changeTab(tabId: TabId) {
    setActiveTab(tabId);
    setQuery("");
    setStatusFilter("all");
    setMessage(undefined);
  }

  function openModal(kind: TabId) {
    setMessage(undefined);
    setModal(kind);

    if (kind === "publications") {
      setPublicationForm((current) => ({
        ...current,
        documentId: current.documentId || documents[0]?.id || "",
      }));
    }

    if (kind === "signatures") {
      setSignatureForm((current) => ({
        ...current,
        documentId: current.documentId || documents[0]?.id || "",
      }));
    }
  }

  function submitDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      documentForm.title.trim().length === 0 ||
      documentForm.companyTradeName.trim().length === 0 ||
      documentForm.owner.trim().length === 0
    ) {
      setMessage("Preencha documento, empresa e responsavel.");
      return;
    }

    const createdDocument: PronusDocument = {
      id: `document-local-${Date.now()}`,
      title: documentForm.title.trim(),
      companyTradeName: documentForm.companyTradeName.trim(),
      type: documentForm.type,
      status: "draft",
      owner: documentForm.owner.trim(),
      version: "0.1",
      dueDate: documentForm.dueDate || undefined,
    };

    setDocuments((current) => [createdDocument, ...current]);
    setDocumentForm(initialDocumentForm);
    setMessage("Documento criado como rascunho.");
    setModal(null);
  }

  function submitTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (templateForm.name.trim().length === 0 || templateForm.owner.trim().length === 0) {
      setMessage("Preencha modelo e responsavel.");
      return;
    }

    const createdTemplate: DocumentTemplate = {
      id: `template-local-${Date.now()}`,
      name: templateForm.name.trim(),
      type: templateForm.type,
      owner: templateForm.owner.trim(),
      status: "draft",
      version: "0.1",
      updatedAt: todayIso(),
    };

    setTemplates((current) => [createdTemplate, ...current]);
    setTemplateForm(initialTemplateForm);
    setMessage("Modelo criado como rascunho.");
    setModal(null);
  }

  function submitPublication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedDocument = documents.find(
      (document) => document.id === publicationForm.documentId,
    );

    if (selectedDocument === undefined) {
      setMessage("Selecione um documento para publicar.");
      return;
    }

    const createdPublication: DocumentPublication = {
      id: `publication-local-${Date.now()}`,
      documentId: selectedDocument.id,
      title: selectedDocument.title,
      companyTradeName: selectedDocument.companyTradeName,
      audience: publicationForm.audience,
      status: "published",
      publishedAt: todayIso(),
      expiresAt: publicationForm.expiresAt || undefined,
    };

    setPublications((current) => [createdPublication, ...current]);
    setDocuments((current) =>
      current.map((document) =>
        document.id === selectedDocument.id
          ? { ...document, status: "published", publishedAt: todayIso() }
          : document,
      ),
    );
    setPublicationForm({ ...initialPublicationForm, documentId: documents[0]?.id ?? "" });
    setMessage("Documento publicado para o publico selecionado.");
    setModal(null);
  }

  function submitSignature(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedDocument = documents.find((document) => document.id === signatureForm.documentId);

    if (
      selectedDocument === undefined ||
      signatureForm.signerName.trim().length === 0 ||
      signatureForm.signerRole.trim().length === 0
    ) {
      setMessage("Selecione o documento e informe assinante e papel.");
      return;
    }

    const createdSignature: DocumentSignatureRequest = {
      id: `signature-local-${Date.now()}`,
      documentId: selectedDocument.id,
      title: selectedDocument.title,
      companyTradeName: selectedDocument.companyTradeName,
      signerName: signatureForm.signerName.trim(),
      signerRole: signatureForm.signerRole.trim(),
      status: "pending",
      requestedAt: todayIso(),
      expiresAt: signatureForm.expiresAt || undefined,
    };

    setSignatures((current) => [createdSignature, ...current]);
    setSignatureForm({ ...initialSignatureForm, documentId: documents[0]?.id ?? "" });
    setMessage("Solicitacao de assinatura criada.");
    setModal(null);
  }

  return (
    <>
      <nav className="mb-5 flex flex-wrap gap-2 text-sm font-semibold" aria-label="Documentos">
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
            onClick={() => openModal(activeTab)}
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

        {activeTab === "documents" && (
          <DocumentsList documents={filteredDocuments} onChangeStatus={setDocumentStatus} />
        )}
        {activeTab === "templates" && (
          <TemplatesList templates={filteredTemplates} onChangeStatus={setTemplateStatus} />
        )}
        {activeTab === "publications" && (
          <PublicationsList
            publications={filteredPublications}
            onChangeStatus={setPublicationStatus}
          />
        )}
        {activeTab === "signatures" && (
          <SignaturesList signatures={filteredSignatures} onChangeStatus={setSignatureStatus} />
        )}
      </section>

      {modal === "documents" && (
        <Modal title="Novo documento" onClose={() => setModal(null)}>
          <form className="grid gap-3" onSubmit={submitDocument}>
            <div className="grid gap-3 md:grid-cols-2">
              <TextField
                label="Documento"
                value={documentForm.title}
                onChange={(value) => setDocumentForm((current) => ({ ...current, title: value }))}
              />
              <TextField
                label="Empresa"
                value={documentForm.companyTradeName}
                onChange={(value) =>
                  setDocumentForm((current) => ({ ...current, companyTradeName: value }))
                }
              />
              <SelectField
                label="Tipo"
                value={documentForm.type}
                options={toOptions(pronusDocumentTypeLabels)}
                onChange={(value) =>
                  setDocumentForm((current) => ({ ...current, type: value as PronusDocumentType }))
                }
              />
              <TextField
                label="Responsavel"
                value={documentForm.owner}
                onChange={(value) => setDocumentForm((current) => ({ ...current, owner: value }))}
              />
              <TextField
                label="Prazo"
                type="date"
                value={documentForm.dueDate}
                onChange={(value) => setDocumentForm((current) => ({ ...current, dueDate: value }))}
              />
            </div>
            <ModalActions onClose={() => setModal(null)} submitLabel="Salvar documento" />
          </form>
        </Modal>
      )}

      {modal === "templates" && (
        <Modal title="Novo modelo" onClose={() => setModal(null)}>
          <form className="grid gap-3" onSubmit={submitTemplate}>
            <div className="grid gap-3 md:grid-cols-2">
              <TextField
                label="Modelo"
                value={templateForm.name}
                onChange={(value) => setTemplateForm((current) => ({ ...current, name: value }))}
              />
              <SelectField
                label="Tipo"
                value={templateForm.type}
                options={toOptions(pronusDocumentTypeLabels)}
                onChange={(value) =>
                  setTemplateForm((current) => ({ ...current, type: value as PronusDocumentType }))
                }
              />
              <TextField
                label="Responsavel"
                value={templateForm.owner}
                onChange={(value) => setTemplateForm((current) => ({ ...current, owner: value }))}
              />
            </div>
            <ModalActions onClose={() => setModal(null)} submitLabel="Salvar modelo" />
          </form>
        </Modal>
      )}

      {modal === "publications" && (
        <Modal title="Nova publicacao" onClose={() => setModal(null)}>
          <form className="grid gap-3" onSubmit={submitPublication}>
            <SelectField
              label="Documento"
              value={publicationForm.documentId}
              options={documents.map((document) => ({ label: document.title, value: document.id }))}
              onChange={(value) =>
                setPublicationForm((current) => ({ ...current, documentId: value }))
              }
            />
            <div className="grid gap-3 md:grid-cols-2">
              <SelectField
                label="Publico"
                value={publicationForm.audience}
                options={toOptions(documentAudienceLabels)}
                onChange={(value) =>
                  setPublicationForm((current) => ({
                    ...current,
                    audience: value as DocumentAudience,
                  }))
                }
              />
              <TextField
                label="Validade"
                type="date"
                value={publicationForm.expiresAt}
                onChange={(value) =>
                  setPublicationForm((current) => ({ ...current, expiresAt: value }))
                }
              />
            </div>
            <ModalActions onClose={() => setModal(null)} submitLabel="Publicar" />
          </form>
        </Modal>
      )}

      {modal === "signatures" && (
        <Modal title="Nova assinatura" onClose={() => setModal(null)}>
          <form className="grid gap-3" onSubmit={submitSignature}>
            <SelectField
              label="Documento"
              value={signatureForm.documentId}
              options={documents.map((document) => ({ label: document.title, value: document.id }))}
              onChange={(value) =>
                setSignatureForm((current) => ({ ...current, documentId: value }))
              }
            />
            <div className="grid gap-3 md:grid-cols-3">
              <TextField
                label="Assinante"
                value={signatureForm.signerName}
                onChange={(value) =>
                  setSignatureForm((current) => ({ ...current, signerName: value }))
                }
              />
              <TextField
                label="Papel"
                value={signatureForm.signerRole}
                onChange={(value) =>
                  setSignatureForm((current) => ({ ...current, signerRole: value }))
                }
              />
              <TextField
                label="Validade"
                type="date"
                value={signatureForm.expiresAt}
                onChange={(value) =>
                  setSignatureForm((current) => ({ ...current, expiresAt: value }))
                }
              />
            </div>
            <ModalActions onClose={() => setModal(null)} submitLabel="Solicitar assinatura" />
          </form>
        </Modal>
      )}
    </>
  );

  function setDocumentStatus(id: string, status: PronusDocumentStatus) {
    setDocuments((current) =>
      current.map((document) =>
        document.id === id
          ? {
              ...document,
              status,
              publishedAt:
                status === "published"
                  ? (document.publishedAt ?? todayIso())
                  : document.publishedAt,
            }
          : document,
      ),
    );
  }

  function setTemplateStatus(id: string, status: DocumentTemplateStatus) {
    setTemplates((current) =>
      current.map((template) => (template.id === id ? { ...template, status } : template)),
    );
  }

  function setPublicationStatus(id: string, status: DocumentPublicationStatus) {
    setPublications((current) =>
      current.map((publication) =>
        publication.id === id
          ? {
              ...publication,
              status,
              publishedAt:
                status === "published"
                  ? (publication.publishedAt ?? todayIso())
                  : publication.publishedAt,
            }
          : publication,
      ),
    );
  }

  function setSignatureStatus(id: string, status: DocumentSignatureStatus) {
    setSignatures((current) =>
      current.map((signature) =>
        signature.id === id
          ? {
              ...signature,
              status,
              signedAt:
                status === "signed" ? (signature.signedAt ?? todayIso()) : signature.signedAt,
            }
          : signature,
      ),
    );
  }
}

function DocumentsList({
  documents,
  onChangeStatus,
}: Readonly<{
  documents: PronusDocument[];
  onChangeStatus: (id: string, status: PronusDocumentStatus) => void;
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
                {pronusDocumentTypeLabels[document.type]}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {document.companyTradeName} / {document.owner} / versao {document.version}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {document.dueDate !== undefined
                ? `Prazo ${dateLabel(document.dueDate)}`
                : "Sem prazo"}
              {document.publishedAt !== undefined
                ? ` / publicado em ${dateLabel(document.publishedAt)}`
                : ""}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[auto_160px] xl:justify-end">
            <StatusBadge className={pronusDocumentStatusClasses(document.status)}>
              {pronusDocumentStatusLabels[document.status]}
            </StatusBadge>
            <select
              aria-label={`Status de ${document.title}`}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
              value={document.status}
              onChange={(event) =>
                onChangeStatus(document.id, event.target.value as PronusDocumentStatus)
              }
            >
              {toOptions(pronusDocumentStatusLabels).map((option) => (
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

function TemplatesList({
  templates,
  onChangeStatus,
}: Readonly<{
  templates: DocumentTemplate[];
  onChangeStatus: (id: string, status: DocumentTemplateStatus) => void;
}>) {
  if (templates.length === 0) {
    return <EmptyState message="Nenhum modelo encontrado para os filtros informados." />;
  }

  return (
    <div className="divide-y divide-slate-100">
      {templates.map((template) => (
        <article key={template.id} className="grid gap-4 px-5 py-4 xl:grid-cols-[1fr_auto]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-semibold">{template.name}</h4>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {pronusDocumentTypeLabels[template.type]}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {template.owner} / versao {template.version}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Atualizado em {dateLabel(template.updatedAt)}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[auto_150px] xl:justify-end">
            <StatusBadge className={documentTemplateStatusClasses(template.status)}>
              {documentTemplateStatusLabels[template.status]}
            </StatusBadge>
            <select
              aria-label={`Status de ${template.name}`}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
              value={template.status}
              onChange={(event) =>
                onChangeStatus(template.id, event.target.value as DocumentTemplateStatus)
              }
            >
              {toOptions(documentTemplateStatusLabels).map((option) => (
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

function PublicationsList({
  publications,
  onChangeStatus,
}: Readonly<{
  publications: DocumentPublication[];
  onChangeStatus: (id: string, status: DocumentPublicationStatus) => void;
}>) {
  if (publications.length === 0) {
    return <EmptyState message="Nenhuma publicacao encontrada para os filtros informados." />;
  }

  return (
    <div className="divide-y divide-slate-100">
      {publications.map((publication) => (
        <article key={publication.id} className="grid gap-4 px-5 py-4 xl:grid-cols-[1fr_auto]">
          <div>
            <h4 className="text-sm font-semibold">{publication.title}</h4>
            <p className="mt-1 text-sm text-slate-600">
              {publication.companyTradeName} / {documentAudienceLabels[publication.audience]}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {publication.publishedAt !== undefined
                ? `Publicado em ${dateLabel(publication.publishedAt)}`
                : "Aguardando publicacao"}
              {publication.expiresAt !== undefined
                ? ` / validade ${dateLabel(publication.expiresAt)}`
                : ""}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[auto_150px] xl:justify-end">
            <StatusBadge className={documentPublicationStatusClasses(publication.status)}>
              {documentPublicationStatusLabels[publication.status]}
            </StatusBadge>
            <select
              aria-label={`Status de ${publication.title}`}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
              value={publication.status}
              onChange={(event) =>
                onChangeStatus(publication.id, event.target.value as DocumentPublicationStatus)
              }
            >
              {toOptions(documentPublicationStatusLabels).map((option) => (
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

function SignaturesList({
  signatures,
  onChangeStatus,
}: Readonly<{
  signatures: DocumentSignatureRequest[];
  onChangeStatus: (id: string, status: DocumentSignatureStatus) => void;
}>) {
  if (signatures.length === 0) {
    return <EmptyState message="Nenhuma assinatura encontrada para os filtros informados." />;
  }

  return (
    <div className="divide-y divide-slate-100">
      {signatures.map((signature) => (
        <article key={signature.id} className="grid gap-4 px-5 py-4 xl:grid-cols-[1fr_auto]">
          <div>
            <h4 className="text-sm font-semibold">{signature.title}</h4>
            <p className="mt-1 text-sm text-slate-600">
              {signature.companyTradeName} / {signature.signerName} / {signature.signerRole}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Solicitado em {dateLabel(signature.requestedAt)}
              {signature.signedAt !== undefined
                ? ` / assinado em ${dateLabel(signature.signedAt)}`
                : ""}
              {signature.expiresAt !== undefined
                ? ` / validade ${dateLabel(signature.expiresAt)}`
                : ""}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[auto_140px] xl:justify-end">
            <StatusBadge className={documentSignatureStatusClasses(signature.status)}>
              {documentSignatureStatusLabels[signature.status]}
            </StatusBadge>
            <select
              aria-label={`Status de ${signature.title}`}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
              value={signature.status}
              onChange={(event) =>
                onChangeStatus(signature.id, event.target.value as DocumentSignatureStatus)
              }
            >
              {toOptions(documentSignatureStatusLabels).map((option) => (
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

function StatusBadge({
  children,
  className,
}: Readonly<{ children: ReactNode; className: string }>) {
  return (
    <span className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

function EmptyState({ message }: Readonly<{ message: string }>) {
  return <div className="px-5 py-8 text-sm text-slate-500">{message}</div>;
}

function currentTitle(tabId: TabId) {
  if (tabId === "documents") {
    return "Fila documental";
  }

  if (tabId === "templates") {
    return "Modelos";
  }

  if (tabId === "publications") {
    return "Publicacoes";
  }

  return "Assinaturas";
}

function currentCreateLabel(tabId: TabId) {
  if (tabId === "documents") {
    return "Novo documento";
  }

  if (tabId === "templates") {
    return "Novo modelo";
  }

  if (tabId === "publications") {
    return "Nova publicacao";
  }

  return "Nova assinatura";
}

function currentPlaceholder(tabId: TabId) {
  if (tabId === "documents") {
    return "Documento, empresa, responsavel ou tipo";
  }

  if (tabId === "templates") {
    return "Modelo, responsavel ou tipo";
  }

  if (tabId === "publications") {
    return "Documento, empresa ou publico";
  }

  return "Documento, empresa ou assinante";
}

function statusOptions(tabId: TabId) {
  const all = [{ label: "Todos", value: "all" }];

  if (tabId === "documents") {
    return [...all, ...toOptions(pronusDocumentStatusLabels)];
  }

  if (tabId === "templates") {
    return [...all, ...toOptions(documentTemplateStatusLabels)];
  }

  if (tabId === "publications") {
    return [...all, ...toOptions(documentPublicationStatusLabels)];
  }

  return [...all, ...toOptions(documentSignatureStatusLabels)];
}

function matches(searchable: string, query: string) {
  return query.trim().length === 0 || searchable.includes(query.trim().toLowerCase());
}

function toOptions<T extends string>(labels: Record<T, string>) {
  return Object.entries(labels).map(([value, label]) => ({ label: String(label), value }));
}

function dateLabel(value: string) {
  const date = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("pt-BR");
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
