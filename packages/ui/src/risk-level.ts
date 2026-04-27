import type { RiskLevel } from "@pronus/types";

export const riskLevelLabels: Record<RiskLevel, string> = {
  low: "Baixo",
  moderate: "Moderado",
  high: "Alto",
  critical: "Critico",
};

export const riskLevelColorClasses: Record<RiskLevel, string> = {
  low: "bg-emerald-100 text-emerald-800",
  moderate: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};
