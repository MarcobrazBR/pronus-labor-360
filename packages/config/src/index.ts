export const brandColors = {
  primary: "#457B9D",
  action: "#A8DADC",
  background: "#F1F4F8",
  text: "#1D3557",
} as const;

export const appNames = {
  pronus: "Portal PRONUS",
  client: "Portal RH Cliente",
  employee: "Portal Colaborador",
  clinician: "Portal Profissional de Saude",
} as const;

export const defaultApiUrl = "http://localhost:3333";

export const localFrontendOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
] as const;

type EnvReader = Record<string, string | undefined>;

function readEnv(): EnvReader {
  if (typeof process === "undefined") {
    return {};
  }

  return process.env;
}

function normalizeUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export function getPublicApiUrl(env: EnvReader = readEnv()) {
  const value = env.NEXT_PUBLIC_API_URL ?? env.API_PUBLIC_URL ?? defaultApiUrl;

  return normalizeUrl(value);
}

export function buildApiUrl(path: string, env: EnvReader = readEnv()) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${getPublicApiUrl(env)}${normalizedPath}`;
}

export function getAllowedOrigins(env: EnvReader = readEnv()) {
  const configuredOrigins = (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return Array.from(new Set([...localFrontendOrigins, ...configuredOrigins]));
}

export function isDemoFallbackEnabled(env: EnvReader = readEnv()) {
  return env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "false";
}

export const deploymentTopology = {
  frontend: {
    provider: "aws",
    recommendedService: "AWS Amplify Hosting",
    apps: ["web-pronus", "web-client", "web-employee", "web-clinician"],
  },
  backend: {
    apiRuntime: "AWS App Runner, ECS/Fargate ou Lambda",
    managedServices: ["Supabase PostgreSQL", "Supabase Auth", "Supabase Storage"],
  },
} as const;
