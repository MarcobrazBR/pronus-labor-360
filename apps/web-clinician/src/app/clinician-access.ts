import { getPublicApiUrl } from "@pronus/config";
export type PronusAccessProfile = {
  id: string;
  fullName: string;
  cpf: string;
  email: string;
  department: string;
  jobPosition: string;
  audience: "pronus_administrative" | "pronus_clinical";
  role: "master_admin" | "administrative" | "clinical";
  status: "active" | "pending_validation" | "blocked" | "inactive";
  mustChangePassword: boolean;
  permissions: {
    fullAccess: boolean;
    canResetPronusUsers: boolean;
    canViewClinicalRecords: boolean;
    canManageCompanies: boolean;
    canManageSchedule: boolean;
  };
};

export type ClinicianSession = {
  cpf: string;
  email: string;
  fullName: string;
  id: string;
  license: string;
  mustChangePassword: boolean;
  specialty: string;
};

export const sessionStorageKey = "pronus:clinician-session";

const licenseByUserId: Record<string, string> = {
  "pronus-dr-carlos": "CRM-SP 123456",
  "pronus-psi-larissa": "CRP-SP 06/123456",
  "pronus-psi-adriano": "CRP-SP 06/198823",
};

export function getApiUrl() {
  return getPublicApiUrl();
}

export function responseMessage(payload: unknown, fallback: string) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return fallback;
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function standardPassword(cpf: string) {
  return onlyDigits(cpf).slice(0, 6);
}

export function isStrongPassword(value: string) {
  return (
    value.length === 6 && /[A-Za-z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value)
  );
}

export function toClinicianSession(profile: PronusAccessProfile): ClinicianSession {
  return {
    cpf: profile.cpf,
    email: profile.email,
    fullName: profile.fullName,
    id: profile.id,
    license: licenseByUserId[profile.id] ?? "Registro profissional vinculado",
    mustChangePassword: profile.mustChangePassword,
    specialty: profile.jobPosition,
  };
}

export function isClinicalProfile(profile: PronusAccessProfile) {
  return profile.role === "clinical" && profile.audience === "pronus_clinical";
}
