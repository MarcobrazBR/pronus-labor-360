export type PronusDocumentType =
  | "pgr"
  | "aso"
  | "psychosocial_report"
  | "term"
  | "contract"
  | "evidence"
  | "other";

export type PronusDocumentStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "published"
  | "signed"
  | "expired";

export type DocumentTemplateStatus = "draft" | "active" | "archived";
export type DocumentPublicationStatus = "scheduled" | "published" | "revoked";
export type DocumentSignatureStatus = "pending" | "signed" | "expired";
export type DocumentAudience = "pronus" | "client_hr" | "employee" | "clinical";

export interface DocumentsSummary {
  generatedAt: string;
  documents: number;
  pendingReview: number;
  published: number;
  pendingSignatures: number;
}

export interface PronusDocument {
  id: string;
  title: string;
  companyTradeName: string;
  type: PronusDocumentType;
  status: PronusDocumentStatus;
  owner: string;
  version: string;
  dueDate?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: PronusDocumentType;
  owner: string;
  status: DocumentTemplateStatus;
  version: string;
  updatedAt: string;
}

export interface DocumentPublication {
  id: string;
  documentId: string;
  title: string;
  companyTradeName: string;
  audience: DocumentAudience;
  status: DocumentPublicationStatus;
  publishedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSignatureRequest {
  id: string;
  documentId: string;
  title: string;
  companyTradeName: string;
  signerName: string;
  signerRole: string;
  status: DocumentSignatureStatus;
  requestedAt: string;
  signedAt?: string;
  expiresAt?: string;
}

export interface CreatePronusDocumentInput {
  title: string;
  companyTradeName: string;
  type: PronusDocumentType;
  owner: string;
  dueDate?: string;
}

export type UpdatePronusDocumentInput = Partial<CreatePronusDocumentInput> & {
  status?: PronusDocumentStatus;
  version?: string;
  publishedAt?: string;
};

export interface CreateDocumentTemplateInput {
  name: string;
  type: PronusDocumentType;
  owner: string;
}

export type UpdateDocumentTemplateInput = Partial<CreateDocumentTemplateInput> & {
  status?: DocumentTemplateStatus;
  version?: string;
};

export interface CreateDocumentPublicationInput {
  documentId: string;
  audience: DocumentAudience;
  expiresAt?: string;
}

export type UpdateDocumentPublicationInput = Partial<
  Pick<CreateDocumentPublicationInput, "audience" | "expiresAt">
> & {
  status?: DocumentPublicationStatus;
  publishedAt?: string;
};

export interface CreateDocumentSignatureRequestInput {
  documentId: string;
  signerName: string;
  signerRole: string;
  expiresAt?: string;
}

export type UpdateDocumentSignatureRequestInput = Partial<
  Pick<CreateDocumentSignatureRequestInput, "signerName" | "signerRole" | "expiresAt">
> & {
  status?: DocumentSignatureStatus;
  signedAt?: string;
};
