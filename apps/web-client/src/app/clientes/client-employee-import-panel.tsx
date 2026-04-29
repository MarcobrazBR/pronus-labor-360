"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { StructuralCompany } from "../client-data";

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

function buildTemplate(company: StructuralCompany) {
  return `cnpj;nome;cpf;setor;cargo;cbo;email;telefone;data_nascimento;data_inclusao\n${company.cnpj};Maria Silva;12345678909;Producao;Operadora de Maquina;7842-05;nome@empresa.com;11999990000;1990-02-10;2026-04-28`;
}

export function ClientEmployeeImportPanel({ company }: Readonly<{ company: StructuralCompany }>) {
  const router = useRouter();
  const templateCsv = useMemo(() => buildTemplate(company), [company]);
  const [content, setContent] = useState(templateCsv);
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

  function downloadTemplate() {
    const blob = new Blob([templateCsv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `modelo-importacao-clientes-${company.tradeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
          defaultCompanyId: company.id,
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
    <section className="mb-6 rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold">Importacao de clientes</h3>
            <p className="mt-1 text-sm text-slate-500">
              CSV padrao com CPF, setor, cargo, CBO e datas cadastrais.
            </p>
          </div>
          <button
            className="rounded-md border border-pronus-primary/30 bg-pronus-primary/5 px-3 py-2 text-sm font-semibold text-pronus-primary"
            type="button"
            onClick={downloadTemplate}
          >
            Baixar modelo CSV
          </button>
        </div>
      </div>

      <div className="grid gap-5 px-5 py-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">Empresa</span>
              <input
                className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
                readOnly
                value={`${company.tradeName} - ${company.cnpj}`}
              />
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

            <label className="block sm:col-span-2 xl:col-span-1">
              <span className="text-xs font-semibold uppercase text-slate-500">Arquivo CSV</span>
              <input
                accept=".csv,text/csv"
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                type="file"
                onChange={(event) => void readFile(event.target.files?.[0])}
              />
            </label>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <Step label="Modelo" value="1" />
              <Step label="Simular" value="2" />
              <Step label="Importar" value="3" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              type="button"
              onClick={() => void submitImport(true)}
            >
              Simular planilha
            </button>
            <button
              className="rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              type="button"
              onClick={() => void submitImport(false)}
            >
              Importar clientes
            </button>
          </div>
        </div>

        <div>
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Conteudo da planilha
            </span>
            <textarea
              className="mt-1 min-h-52 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800"
              spellCheck={false}
              value={content}
              onChange={(event) => {
                setContent(event.target.value);
                setResult(null);
                setError(null);
              }}
            />
          </label>

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
              <Metric label="Ajustar" value={result.errorRows + result.skippedRows} />
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

function Step({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-md bg-white px-2 py-2 text-sm ring-1 ring-slate-200">
      <strong className="block text-pronus-primary">{value}</strong>
      <span className="text-xs font-semibold text-slate-600">{label}</span>
    </div>
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
