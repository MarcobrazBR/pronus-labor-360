import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

type DatabaseRuntimeMode = "demo" | "supabase-postgres";

interface DatabaseRuntime {
  mode: DatabaseRuntimeMode;
  databaseConfigured: boolean;
  directConnectionConfigured: boolean;
  supabaseConfigured: boolean;
}

export interface DatabaseConnectionStatus extends DatabaseRuntime {
  status: "connected" | "demo" | "unavailable";
  checkedAt: string;
  message: string;
}

function hasValue(value: string | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function getDatabaseRuntime(): DatabaseRuntime {
  const databaseConfigured = hasValue(process.env.DATABASE_URL);
  const directConnectionConfigured = hasValue(process.env.DIRECT_URL);
  const supabaseConfigured =
    hasValue(process.env.SUPABASE_URL) && hasValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return {
    databaseConfigured,
    directConnectionConfigured,
    mode: databaseConfigured ? "supabase-postgres" : "demo",
    supabaseConfigured,
  };
}

@Injectable()
export class DatabaseService {
  private readonly runtime = getDatabaseRuntime();
  private readonly prismaClient: PrismaClient | null = this.runtime.databaseConfigured
    ? new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      })
    : null;

  getRuntime() {
    return this.runtime;
  }

  getClient() {
    if (this.prismaClient === null) {
      throw new ServiceUnavailableException(
        "Banco real nao configurado. Defina DATABASE_URL para ativar Prisma/Supabase.",
      );
    }

    return this.prismaClient;
  }

  async getConnectionStatus(): Promise<DatabaseConnectionStatus> {
    if (this.prismaClient === null) {
      return {
        ...this.runtime,
        checkedAt: new Date().toISOString(),
        message: "API em modo demonstrativo, usando dados-semente e persistencia local temporaria.",
        status: "demo",
      };
    }

    try {
      await this.prismaClient.$queryRaw`SELECT 1`;

      return {
        ...this.runtime,
        checkedAt: new Date().toISOString(),
        message: "Conexao Prisma/Supabase ativa.",
        status: "connected",
      };
    } catch {
      return {
        ...this.runtime,
        checkedAt: new Date().toISOString(),
        message: "DATABASE_URL configurada, mas a API nao conseguiu validar a conexao.",
        status: "unavailable",
      };
    }
  }
}
