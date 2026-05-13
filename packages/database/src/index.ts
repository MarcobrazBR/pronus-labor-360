import { PrismaClient } from "@prisma/client";

export const databasePackageName = "@pronus/database";

export type DatabaseRuntimeMode = "demo" | "supabase-postgres";

export interface DatabaseRuntime {
  mode: DatabaseRuntimeMode;
  databaseConfigured: boolean;
  directConnectionConfigured: boolean;
  supabaseConfigured: boolean;
}

type EnvReader = Record<string, string | undefined>;

function readEnv(): EnvReader {
  if (typeof process === "undefined") {
    return {};
  }

  return process.env;
}

function hasValue(value: string | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

export function getDatabaseRuntime(env: EnvReader = readEnv()): DatabaseRuntime {
  const databaseConfigured = hasValue(env.DATABASE_URL);
  const directConnectionConfigured = hasValue(env.DIRECT_URL);
  const supabaseConfigured = hasValue(env.SUPABASE_URL) && hasValue(env.SUPABASE_SERVICE_ROLE_KEY);

  return {
    mode: databaseConfigured ? "supabase-postgres" : "demo",
    databaseConfigured,
    directConnectionConfigured,
    supabaseConfigured,
  };
}

export function isDatabaseConfigured(env: EnvReader = readEnv()) {
  return getDatabaseRuntime(env).databaseConfigured;
}

export function createPronusPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export type PronusPrismaClient = ReturnType<typeof createPronusPrismaClient>;

export { PrismaClient };
