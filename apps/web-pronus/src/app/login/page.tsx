"use client";

import { useState } from "react";

interface PronusLoginResult {
  id: string;
  fullName: string;
  cpf: string;
  email: string;
  department: string;
  jobPosition: string;
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
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
}

function responseMessage(payload: unknown, fallback: string) {
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

export default function PronusLoginPage() {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function login() {
    if (cpf.trim().length === 0 || password.length === 0) {
      setMessage("Informe CPF e senha para acessar.");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${getApiUrl()}/pronus-access/login`, {
        body: JSON.stringify({ cpf, password }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as PronusLoginResult | { message?: string };

      if (!response.ok) {
        setMessage(responseMessage(payload, "CPF ou senha invalidos."));
        return;
      }

      window.localStorage.setItem("pronus:operator-session", JSON.stringify(payload));
      window.location.href = "/";
    } catch {
      setMessage("Nao foi possivel conectar a API local.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-pronus-background px-5 py-8 text-pronus-text">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <div>
          <img alt="Pronus Labor" className="h-24 w-auto" src="/brand/pronus-logo.png" />
          <h1 className="mt-8 max-w-2xl text-3xl font-semibold tracking-normal">
            Acesso operacional PRONUS
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Entrada segura para equipe administrativa e corpo clinico. No primeiro acesso, use os 6
            primeiros digitos do CPF e atualize a senha antes de continuar.
          </p>
        </div>

        <div className="rounded-lg border border-white/70 bg-white p-5 shadow-sm">
          <div className="mb-5 border-b border-slate-200 pb-4">
            <h2 className="text-lg font-semibold">Entrar no portal</h2>
            <p className="mt-1 text-sm text-slate-500">Use CPF e senha de acesso.</p>
          </div>

          <div className="space-y-3">
            <Field label="CPF" value={cpf} onChange={setCpf} placeholder="000.000.000-00" />
            <Field label="Senha" type="password" value={password} onChange={setPassword} />
            <button
              className="w-full rounded-md bg-pronus-primary px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              type="button"
              onClick={() => void login()}
            >
              Acessar
            </button>
          </div>

          {message !== null && (
            <div className="mt-4 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-800">
              {message}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: Readonly<{
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  value: string;
}>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
