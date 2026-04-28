"use client";

import { useState } from "react";
import { PsychosocialQuestionnairePanel } from "./psychosocial-questionnaire-panel";

type StructuralStatus = "active" | "pending_validation" | "blocked" | "inactive";

interface EmployeeAccessProfile {
  employeeId: string;
  companyTradeName: string;
  fullName: string;
  cpf: string;
  department: string;
  jobPosition: string;
  email?: string;
  phone?: string;
  registrationStatus: StructuralStatus;
}

interface DivergenceResult {
  id: string;
  status: "pending" | "approved" | "rejected";
  changes: Array<{
    field: string;
    currentValue: string;
    submittedValue: string;
  }>;
}

const statusLabels: Record<StructuralStatus, string> = {
  active: "Ativo",
  pending_validation: "Validacao pendente",
  blocked: "Bloqueado para conferencia",
  inactive: "Inativo",
};

export function FirstAccessPanel() {
  const [cpf, setCpf] = useState("98765432100");
  const [profile, setProfile] = useState<EmployeeAccessProfile | null>(null);
  const [form, setForm] = useState({
    email: "",
    phone: "",
    department: "",
    jobPosition: "",
  });
  const [result, setResult] = useState<DivergenceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function lookupCpf() {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
      const response = await fetch(`${apiUrl}/employee-access/lookup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cpf }),
      });
      const payload = (await response.json()) as EmployeeAccessProfile | { message?: string };

      if (!response.ok) {
        setProfile(null);
        setError("message" in payload && payload.message ? payload.message : "CPF nao localizado");
        return;
      }

      const employeeProfile = payload as EmployeeAccessProfile;
      setProfile(employeeProfile);
      setForm({
        email: employeeProfile.email ?? "",
        phone: employeeProfile.phone ?? "",
        department: employeeProfile.department,
        jobPosition: employeeProfile.jobPosition,
      });
    } catch {
      setError("Nao foi possivel conectar a API local.");
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function submitDivergence() {
    if (profile === null) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
      const response = await fetch(`${apiUrl}/employee-access/divergences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: profile.employeeId,
          submittedData: form,
        }),
      });
      const payload = (await response.json()) as DivergenceResult | { message?: string };

      if (!response.ok) {
        setError(
          "message" in payload && payload.message
            ? payload.message
            : "Nao foi possivel enviar divergencia",
        );
        return;
      }

      setResult(payload as DivergenceResult);
    } catch {
      setError("Nao foi possivel conectar a API local.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="w-full max-w-6xl rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-6 p-5 lg:grid-cols-[0.8fr_1.2fr] lg:p-6">
        <div>
          <img alt="Pronus Labor" className="h-12 w-auto" src="/brand/pronus-logo.png" />
          <h1 className="mt-2 text-2xl font-semibold">Portal Colaborador</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Confirme seu cadastro antes de acessar questionarios, termos e demais etapas da jornada
            ocupacional.
          </p>

          <label className="mt-6 block">
            <span className="text-xs font-semibold uppercase text-slate-500">CPF</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-3 text-sm text-slate-900"
              inputMode="numeric"
              placeholder="Digite somente numeros"
              value={cpf}
              onChange={(event) => setCpf(event.target.value)}
            />
          </label>

          <button
            className="mt-3 w-full rounded-md bg-pronus-primary px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
            type="button"
            onClick={() => void lookupCpf()}
          >
            Consultar cadastro
          </button>

          {error !== null && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          {profile === null ? (
            <div className="flex min-h-72 items-center justify-center text-center text-sm text-slate-500">
              Informe o CPF para localizar o cadastro previamente enviado pelo RH.
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{profile.fullName}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {profile.companyTradeName} / {profile.cpf}
                  </p>
                </div>
                <span className="h-fit rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                  {statusLabels[profile.registrationStatus]}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field
                  label="E-mail"
                  value={form.email}
                  onChange={(value) => setForm((current) => ({ ...current, email: value }))}
                />
                <Field
                  label="Telefone/WhatsApp"
                  value={form.phone}
                  onChange={(value) => setForm((current) => ({ ...current, phone: value }))}
                />
                <Field
                  label="Setor"
                  value={form.department}
                  onChange={(value) => setForm((current) => ({ ...current, department: value }))}
                />
                <Field
                  label="Cargo"
                  value={form.jobPosition}
                  onChange={(value) => setForm((current) => ({ ...current, jobPosition: value }))}
                />
              </div>

              <button
                className="mt-4 rounded-md bg-pronus-primary px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading}
                type="button"
                onClick={() => void submitDivergence()}
              >
                Enviar conferencia
              </button>

              {result !== null && (
                <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  Divergencia enviada para analise do RH. Campos sinalizados:{" "}
                  {result.changes.length}.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {profile !== null && <PsychosocialQuestionnairePanel profile={profile} />}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
