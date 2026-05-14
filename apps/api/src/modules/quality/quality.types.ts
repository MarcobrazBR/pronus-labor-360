export type AutomatedTestStatus = "planned" | "covered" | "needs_backend" | "blocked";

export type AutomatedTestDomain =
  | "login"
  | "permissions"
  | "structural_registration"
  | "spreadsheet_import"
  | "psychosocial"
  | "schedule"
  | "clinical_record"
  | "finance";

export interface AutomatedTestSuite {
  id: string;
  domain: AutomatedTestDomain;
  title: string;
  status: AutomatedTestStatus;
  criticalFlows: string[];
  acceptanceCriteria: string[];
  nextAutomationTarget: string;
}

export type LgpdConsentStatus = "active" | "pending" | "revoked" | "expired";

export type LgpdConsentPurpose =
  | "account_access"
  | "psychosocial_questionnaire"
  | "telehealth_recording"
  | "clinical_record"
  | "document_signature"
  | "esocial_processing";

export interface LgpdConsentRecord {
  id: string;
  companyTradeName: string;
  subjectType: "employee" | "client_hr" | "pronus_user";
  subjectName: string;
  purpose: LgpdConsentPurpose;
  legalBasis: string;
  status: LgpdConsentStatus;
  version: string;
  channel: string;
  grantedAt?: string;
  revokedAt?: string;
  retentionUntil?: string;
  evidenceHash?: string;
}

export interface LgpdRetentionPolicy {
  id: string;
  dataDomain: string;
  legalBasis: string;
  retentionPeriodMonths: number;
  deletionAction: "anonymize" | "delete" | "legal_hold";
  reviewFrequency: string;
  ownerRole: string;
  active: boolean;
}

export interface AttachmentSecurityPolicy {
  id: string;
  bucketName: string;
  dataClass: "administrative" | "occupational" | "clinical" | "psychosocial";
  allowedMimeTypes: string[];
  maxSizeMb: number;
  encryptionRequired: boolean;
  signedUrlMinutes: number;
  retentionPolicyId: string;
}

export interface SensitiveAccessTrailEvent {
  id: string;
  companyTradeName: string;
  subjectName?: string;
  actorName: string;
  actorRole: string;
  dataDomain: "psychosocial" | "clinical_record" | "document" | "finance" | "esocial";
  action: "view" | "create" | "update" | "download" | "export" | "delete";
  decision: "allowed" | "denied";
  purpose: string;
  reason?: string;
  createdAt: string;
}

export type ESocialSstEventType = "S-2210" | "S-2220" | "S-2240" | "S-3000";

export type ESocialSstQueueStatus =
  | "draft"
  | "pending_validation"
  | "ready_for_future_submission"
  | "blocked_by_missing_data"
  | "canceled";

export interface ESocialSstQueueItem {
  id: string;
  eventType: ESocialSstEventType;
  companyTradeName: string;
  employeeName?: string;
  employeeCpf?: string;
  sourceModule: "cat" | "occupational_exam" | "risk_inventory" | "event_exclusion";
  sourceReferenceId: string;
  status: ESocialSstQueueStatus;
  schemaVersion: string;
  payloadSummary: Record<string, string | number | boolean>;
  validationMessages: string[];
  generatedAt: string;
  dueAt?: string;
  futureSubmissionEnabled: boolean;
}

export interface QualitySummary {
  generatedAt: string;
  automatedTestCoverage: {
    covered: number;
    total: number;
    percent: number;
  };
  lgpdGovernance: {
    activeConsents: number;
    pendingConsents: number;
    retentionPolicies: number;
    sensitiveAccessEvents: number;
  };
  attachmentSecurity: {
    policies: number;
    encryptedBuckets: number;
    privateBuckets: number;
  };
  esocialSstQueue: {
    total: number;
    readyForFutureSubmission: number;
    blockedByMissingData: number;
    futureSubmissionEnabled: boolean;
  };
}
