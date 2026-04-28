import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import type {
  CreateDocumentPublicationInput,
  CreateDocumentSignatureRequestInput,
  CreateDocumentTemplateInput,
  CreatePronusDocumentInput,
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
  UpdateDocumentPublicationInput,
  UpdateDocumentSignatureRequestInput,
  UpdateDocumentTemplateInput,
  UpdatePronusDocumentInput,
} from "./documents.types";

const documentTypes = new Set<PronusDocumentType>([
  "pgr",
  "aso",
  "psychosocial_report",
  "term",
  "contract",
  "evidence",
  "other",
]);
const documentStatuses = new Set<PronusDocumentStatus>([
  "draft",
  "in_review",
  "approved",
  "published",
  "signed",
  "expired",
]);
const templateStatuses = new Set<DocumentTemplateStatus>(["draft", "active", "archived"]);
const publicationStatuses = new Set<DocumentPublicationStatus>([
  "scheduled",
  "published",
  "revoked",
]);
const signatureStatuses = new Set<DocumentSignatureStatus>(["pending", "signed", "expired"]);
const audiences = new Set<DocumentAudience>(["pronus", "client_hr", "employee", "clinical"]);

function now(): string {
  return new Date().toISOString();
}

function today(): string {
  return now().slice(0, 10);
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

function normalizeDocumentType(value: unknown): PronusDocumentType {
  if (typeof value !== "string" || !documentTypes.has(value as PronusDocumentType)) {
    throw new BadRequestException("Tipo de documento invalido");
  }

  return value as PronusDocumentType;
}

function normalizeDocumentStatus(value: unknown): PronusDocumentStatus | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || !documentStatuses.has(value as PronusDocumentStatus)) {
    throw new BadRequestException("Status do documento invalido");
  }

  return value as PronusDocumentStatus;
}

function normalizeTemplateStatus(value: unknown): DocumentTemplateStatus | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || !templateStatuses.has(value as DocumentTemplateStatus)) {
    throw new BadRequestException("Status do modelo invalido");
  }

  return value as DocumentTemplateStatus;
}

function normalizePublicationStatus(value: unknown): DocumentPublicationStatus | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || !publicationStatuses.has(value as DocumentPublicationStatus)) {
    throw new BadRequestException("Status da publicacao invalido");
  }

  return value as DocumentPublicationStatus;
}

function normalizeSignatureStatus(value: unknown): DocumentSignatureStatus | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || !signatureStatuses.has(value as DocumentSignatureStatus)) {
    throw new BadRequestException("Status da assinatura invalido");
  }

  return value as DocumentSignatureStatus;
}

function normalizeAudience(value: unknown): DocumentAudience {
  if (typeof value !== "string" || !audiences.has(value as DocumentAudience)) {
    throw new BadRequestException("Publico do documento invalido");
  }

  return value as DocumentAudience;
}

const startedAt = now();

const documents: PronusDocument[] = [
  {
    id: "document-horizonte-pgr-2026",
    title: "PGR 2026 - Industria Horizonte",
    companyTradeName: "Industria Horizonte",
    type: "pgr",
    status: "in_review",
    owner: "SST PRONUS",
    version: "1.0",
    dueDate: "2026-05-10",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "document-rede-norte-relatorio-psicossocial",
    title: "Relatorio psicossocial - Rede Norte",
    companyTradeName: "Rede Norte",
    type: "psychosocial_report",
    status: "draft",
    owner: "Psicologia PRONUS",
    version: "0.2",
    dueDate: "2026-05-18",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "document-horizonte-termo-lgpd",
    title: "Termo de ciencia LGPD - Industria Horizonte",
    companyTradeName: "Industria Horizonte",
    type: "term",
    status: "published",
    owner: "Operacao PRONUS",
    version: "1.1",
    publishedAt: "2026-04-24",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
];

const templates: DocumentTemplate[] = [
  {
    id: "template-pgr",
    name: "Modelo PGR padrao PRONUS",
    type: "pgr",
    owner: "SST PRONUS",
    status: "active",
    version: "2.1",
    updatedAt: startedAt,
  },
  {
    id: "template-psychosocial-report",
    name: "Modelo relatorio psicossocial agregado",
    type: "psychosocial_report",
    owner: "Psicologia PRONUS",
    status: "draft",
    version: "0.8",
    updatedAt: startedAt,
  },
  {
    id: "template-term-lgpd",
    name: "Termo de ciencia e privacidade",
    type: "term",
    owner: "Operacao PRONUS",
    status: "active",
    version: "1.3",
    updatedAt: startedAt,
  },
];

const publications: DocumentPublication[] = [
  {
    id: "publication-horizonte-termo-lgpd",
    documentId: "document-horizonte-termo-lgpd",
    title: "Termo de ciencia LGPD - Industria Horizonte",
    companyTradeName: "Industria Horizonte",
    audience: "client_hr",
    status: "published",
    publishedAt: "2026-04-24",
    expiresAt: "2026-12-31",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
];

const signatures: DocumentSignatureRequest[] = [
  {
    id: "signature-horizonte-termo-lgpd",
    documentId: "document-horizonte-termo-lgpd",
    title: "Termo de ciencia LGPD - Industria Horizonte",
    companyTradeName: "Industria Horizonte",
    signerName: "Mariana Costa",
    signerRole: "RH cliente",
    status: "pending",
    requestedAt: "2026-04-24",
    expiresAt: "2026-05-08",
  },
];

@Injectable()
export class DocumentsService {
  getSummary(): DocumentsSummary {
    return {
      generatedAt: now(),
      documents: documents.length,
      pendingReview: documents.filter((document) => document.status === "in_review").length,
      published: documents.filter((document) => document.status === "published").length,
      pendingSignatures: signatures.filter((signature) => signature.status === "pending").length,
    };
  }

  listDocuments(): PronusDocument[] {
    return documents;
  }

  createDocument(input: CreatePronusDocumentInput): PronusDocument {
    const createdAt = now();
    const document: PronusDocument = {
      id: randomUUID(),
      title: requireText(input.title, "title"),
      companyTradeName: requireText(input.companyTradeName, "companyTradeName"),
      type: normalizeDocumentType(input.type),
      status: "draft",
      owner: requireText(input.owner, "owner"),
      version: "0.1",
      dueDate: normalizeOptionalDate(input.dueDate, "dueDate"),
      createdAt,
      updatedAt: createdAt,
    };

    documents.unshift(document);
    return document;
  }

  updateDocument(id: string, input: UpdatePronusDocumentInput): PronusDocument {
    const document = this.findDocument(id);

    document.title = optionalText(input.title, "title") ?? document.title;
    document.companyTradeName =
      optionalText(input.companyTradeName, "companyTradeName") ?? document.companyTradeName;
    document.type = input.type === undefined ? document.type : normalizeDocumentType(input.type);
    document.owner = optionalText(input.owner, "owner") ?? document.owner;
    document.status = normalizeDocumentStatus(input.status) ?? document.status;
    document.version = optionalText(input.version, "version") ?? document.version;
    document.dueDate =
      input.dueDate === undefined
        ? document.dueDate
        : normalizeOptionalDate(input.dueDate, "dueDate");
    document.publishedAt =
      input.publishedAt === undefined
        ? document.publishedAt
        : normalizeOptionalDate(input.publishedAt, "publishedAt");
    document.updatedAt = now();

    return document;
  }

  listTemplates(): DocumentTemplate[] {
    return templates;
  }

  createTemplate(input: CreateDocumentTemplateInput): DocumentTemplate {
    const template: DocumentTemplate = {
      id: randomUUID(),
      name: requireText(input.name, "name"),
      type: normalizeDocumentType(input.type),
      owner: requireText(input.owner, "owner"),
      status: "draft",
      version: "0.1",
      updatedAt: now(),
    };

    templates.unshift(template);
    return template;
  }

  updateTemplate(id: string, input: UpdateDocumentTemplateInput): DocumentTemplate {
    const template = this.findTemplate(id);

    template.name = optionalText(input.name, "name") ?? template.name;
    template.type = input.type === undefined ? template.type : normalizeDocumentType(input.type);
    template.owner = optionalText(input.owner, "owner") ?? template.owner;
    template.status = normalizeTemplateStatus(input.status) ?? template.status;
    template.version = optionalText(input.version, "version") ?? template.version;
    template.updatedAt = now();

    return template;
  }

  listPublications(): DocumentPublication[] {
    return publications;
  }

  createPublication(input: CreateDocumentPublicationInput): DocumentPublication {
    const document = this.findDocument(input.documentId);
    const createdAt = now();
    const publication: DocumentPublication = {
      id: randomUUID(),
      documentId: document.id,
      title: document.title,
      companyTradeName: document.companyTradeName,
      audience: normalizeAudience(input.audience),
      status: "published",
      publishedAt: today(),
      expiresAt: normalizeOptionalDate(input.expiresAt, "expiresAt"),
      createdAt,
      updatedAt: createdAt,
    };

    document.status = "published";
    document.publishedAt = publication.publishedAt;
    document.updatedAt = createdAt;
    publications.unshift(publication);
    return publication;
  }

  updatePublication(id: string, input: UpdateDocumentPublicationInput): DocumentPublication {
    const publication = this.findPublication(id);

    publication.audience =
      input.audience === undefined ? publication.audience : normalizeAudience(input.audience);
    publication.status = normalizePublicationStatus(input.status) ?? publication.status;
    publication.publishedAt =
      input.publishedAt === undefined
        ? publication.publishedAt
        : normalizeOptionalDate(input.publishedAt, "publishedAt");
    publication.expiresAt =
      input.expiresAt === undefined
        ? publication.expiresAt
        : normalizeOptionalDate(input.expiresAt, "expiresAt");
    publication.updatedAt = now();

    return publication;
  }

  listSignatures(): DocumentSignatureRequest[] {
    return signatures;
  }

  createSignatureRequest(input: CreateDocumentSignatureRequestInput): DocumentSignatureRequest {
    const document = this.findDocument(input.documentId);
    const signature: DocumentSignatureRequest = {
      id: randomUUID(),
      documentId: document.id,
      title: document.title,
      companyTradeName: document.companyTradeName,
      signerName: requireText(input.signerName, "signerName"),
      signerRole: requireText(input.signerRole, "signerRole"),
      status: "pending",
      requestedAt: today(),
      expiresAt: normalizeOptionalDate(input.expiresAt, "expiresAt"),
    };

    signatures.unshift(signature);
    return signature;
  }

  updateSignatureRequest(
    id: string,
    input: UpdateDocumentSignatureRequestInput,
  ): DocumentSignatureRequest {
    const signature = this.findSignature(id);

    signature.signerName = optionalText(input.signerName, "signerName") ?? signature.signerName;
    signature.signerRole = optionalText(input.signerRole, "signerRole") ?? signature.signerRole;
    signature.status = normalizeSignatureStatus(input.status) ?? signature.status;
    signature.signedAt =
      input.signedAt === undefined
        ? signature.signedAt
        : normalizeOptionalDate(input.signedAt, "signedAt");
    signature.expiresAt =
      input.expiresAt === undefined
        ? signature.expiresAt
        : normalizeOptionalDate(input.expiresAt, "expiresAt");

    return signature;
  }

  private findDocument(id: string): PronusDocument {
    const document = documents.find((item) => item.id === id);

    if (document === undefined) {
      throw new NotFoundException("Documento nao encontrado");
    }

    return document;
  }

  private findTemplate(id: string): DocumentTemplate {
    const template = templates.find((item) => item.id === id);

    if (template === undefined) {
      throw new NotFoundException("Modelo de documento nao encontrado");
    }

    return template;
  }

  private findPublication(id: string): DocumentPublication {
    const publication = publications.find((item) => item.id === id);

    if (publication === undefined) {
      throw new NotFoundException("Publicacao de documento nao encontrada");
    }

    return publication;
  }

  private findSignature(id: string): DocumentSignatureRequest {
    const signature = signatures.find((item) => item.id === id);

    if (signature === undefined) {
      throw new NotFoundException("Solicitacao de assinatura nao encontrada");
    }

    return signature;
  }
}
