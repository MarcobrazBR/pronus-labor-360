"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ImportCompanyOption {
  id: string;
  tradeName: string;
  cnpj: string;
}

interface ImportIssue {
  rowNumber: number;
  message: string;
}

interface ImportResult {
  dryRun: boolean;
  totalRows: number;
  validRows: number;
  createdRows: number;
  skippedRows: number;
  errorRows: number;
  skipped: ImportIssue[];
  errors: ImportIssue[];
}

interface EmployeeImportPanelProps {
  companies: ImportCompanyOption[];
  title?: string;
}

const sampleCsv =
  "cnpj;nome;cpf;setor;cargo;email;telefone\n12.345.678/0001-90;Maria Silva;12345678909;Producao;Operadora;nome@empresa.com;11999990000";

export function EmployeeImportPanel({
  companies,
  title = "Importacao de clientes",
}: EmployeeImportPanelProps) {
  const router = useRouter();
  const [content, setContent] = useState(sampleCsv);
  const [defaultCompanyId, setDefaultCompanyId] = useState("");
  const [delimiter, setDelimiter] = useState<"," | ";">(";");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function readFile(file: File | undefined) {
    if (file === undefined) {
      return;
    }

    setContent(await file.text());
    setResult(null);
    setError(null);
  }

  async function submitImport(dryRun: boolean) {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
      const response = await fetch(`${apiUrl}/structural/employees/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          delimiter,
          dryRun,
          defaultCompanyId: defaultCompanyId || undefined,
        }),
      });

      const payload = (await response.json()) as ImportResult | { message?: string };

      if (!response.ok) {
        setError("message" in payload && payload.message ? payload.message : "Falha na importacao");
        setResult(null);
        return;
      }

      setResult(payload as ImportResult);

      if (!dryRun) {
        router.refresh();
      }
    } catch {
      setError("Nao foi possivel conectar a API local.");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white">
      <div className="grid gap-5 px-5 py-4 xl:grid-cols-[0.85fr_1.15fr]">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">Empresa padrao</span>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                value={defaultCompanyId}
                onChange={(event) => setDefaultCompanyId(event.target.value)}
              >
                <option value="">Usar CNPJ da planilha</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.tradeName} - {company.cnpj}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">Separador</span>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                value={delimiter}
                onChange={(event) => setDelimiter(event.target.value as "," | ";")}
              >
                <option value=";">Ponto e virgula</option>
                <option value=",">Virgula</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">Arquivo CSV</span>
              <input
                accept=".csv,text/csv"
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                type="file"
                onChange={(event) => void readFile(event.target.files?.[0])}
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              type="button"
              onClick={() => void submitImport(true)}
            >
              Simular
            </button>
            <button
              className="rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              type="button"
              onClick={() => void submitImport(false)}
            >
              Importar
            </button>
          </div>
        </div>

        <div>
          <textarea
            className="min-h-48 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800"
            spellCheck={false}
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              setResult(null);
              setError(null);
            }}
          />

          {error !== null && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {result !== null && (
            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              <Metric label="Linhas" value={result.totalRows} />
              <Metric label="Validas" value={result.validRows} />
              <Metric label="Criadas" value={result.createdRows} />
              <Metric label="Erros" value={result.errorRows + result.skippedRows} />
            </div>
          )}

          {result !== null && (result.errors.length > 0 || result.skipped.length > 0) && (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {[...result.errors, ...result.skipped].slice(0, 3).map((issue) => (
                <p key={`${issue.rowNumber}-${issue.message}`}>
                  Linha {issue.rowNumber}: {issue.message}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div className="rounded-md bg-slate-100 px-3 py-2">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <strong className="mt-1 block text-lg font-semibold text-slate-900">{value}</strong>
    </div>
  );
}
