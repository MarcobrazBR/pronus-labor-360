export type RiskLevel = "low" | "moderate" | "high" | "critical";

export type UserType =
  | "pronus_admin"
  | "pronus_health_professional"
  | "client_hr"
  | "client_employee";

export type CompanyStatus = "active" | "inactive" | "blocked";

export type EmployeeRegistrationStatus =
  | "valid"
  | "pending_validation"
  | "blocked"
  | "inactive";

export type PsychosocialCampaignStatus =
  | "draft"
  | "active"
  | "threshold_reached"
  | "expired"
  | "extended"
  | "closed"
  | "analysis_in_progress"
  | "completed";

export type AuditAction =
  | "user_login"
  | "user_logout"
  | "employee_created"
  | "employee_updated"
  | "registration_change_submitted"
  | "registration_change_approved"
  | "registration_change_rejected"
  | "pgr_risk_created"
  | "pgr_risk_updated"
  | "psychosocial_campaign_created"
  | "psychosocial_answer_submitted"
  | "psychosocial_risk_adjusted"
  | "document_generated"
  | "document_published"
  | "billing_changed"
  | "client_blocked"
  | "client_unblocked";
