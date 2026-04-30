"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { StructuralCompany } from "../client-data";

interface ImportIssue {
  field?: string;
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

function issueLabel(issue: ImportIssue) {
  return `Linha ${issue.rowNumber}${issue.field ? ` / coluna ${issue.field}` : ""}: ${
    issue.message
  }`;
}

export function ClientEmployeeImportPanel({ company }: Readonly<{ company: StructuralCompany }>) {
  const router = useRouter();
  const templateCsv = useMemo(() => buildTemplate(company), [company]);
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [successResult, setSuccessResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canSubmit = content.trim().length > 0 && !isLoading;

  async function readFile(file: File | undefined) {
    if (file === undefined) {
      return;
    }

    setContent(await file.text());
    setFileName(file.name);
    setResult(null);
    setSuccessResult(null);
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
    if (content.trim().length === 0) {
      setError("Selecione um arquivo CSV preenchido com o modelo antes de continuar.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessResult(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
      const response = await fetch(`${apiUrl}/structural/employees/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          delimiter: ";",
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

      const nextResult = payload as ImportResult;
      setResult(nextResult);

      if (!dryRun) {
        setSuccessResult(nextResult);
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
          <h3 className="text-base font-semibold">Importacao de clientes</h3>
          <button
            className="rounded-md border border-pronus-primary/30 bg-pronus-primary/5 px-3 py-2 text-sm font-semibold text-pronus-primary"
            type="button"
            onClick={downloadTemplate}
          >
            Baixar modelo CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-500">Empresa</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
              readOnly
              value={`${company.tradeName} - ${company.cnpj}`}
            />
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

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <button
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canSubmit}
            type="button"
            onClick={() => void submitImport(true)}
          >
            Simular planilha
          </button>
          <button
            className="rounded-md bg-pronus-primary px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canSubmit}
            type="button"
            onClick={() => void submitImport(false)}
          >
            Importar clientes
          </button>
        </div>
      </div>

      {(fileName !== "" || error !== null || result !== null) && (
        <div className="border-t border-slate-100 px-5 py-4">
          {fileName !== "" && (
            <p className="mb-3 text-sm font-medium text-slate-600">
              Arquivo selecionado: {fileName}
            </p>
          )}

          {error !== null && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {result !== null && <ImportResultPanel result={result} />}
        </div>
      )}

      {successResult !== null && (
        <ImportSuccessModal result={successResult} onClose={() => setSuccessResult(null)} />
      )}
    </section>
  );
}

function ImportResultPanel({ result }: Readonly<{ result: ImportResult }>) {
  const issues = [...result.errors, ...result.skipped];

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-4">
        <Metric label="Linhas" value={result.totalRows} />
        <Metric label="Validas" value={result.validRows} />
        <Metric label="Criadas" value={result.createdRows} />
        <Metric label="Ajustar" value={result.errorRows + result.skippedRows} />
      </div>

      {issues.length > 0 && (
        <div className="max-h-40 overflow-y-auto rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {issues.map((issue) => (
            <p key={`${issue.rowNumber}-${issue.field ?? "linha"}-${issue.message}`}>
              {issueLabel(issue)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function ImportSuccessModal({
  onClose,
  result,
}: Readonly<{ onClose: () => void; result: ImportResult }>) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 text-center shadow-xl">
        <h3 className="text-lg font-semibold text-slate-950">Importacao concluida</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Processo realizado com sucesso. {result.createdRows} cliente(s) importado(s).
        </p>
        <button
          className="mt-5 rounded-md bg-pronus-primary px-5 py-2.5 text-sm font-semibold text-white"
          type="button"
          onClick={onClose}
        >
          Fechar
        </button>
      </section>
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
