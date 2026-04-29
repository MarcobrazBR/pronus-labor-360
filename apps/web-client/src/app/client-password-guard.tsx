"use client";

import { useEffect, useState } from "react";

interface ClientAccessProfile {
  companyId: string;
  companyTradeName: string;
  cnpj: string;
  mustChangePassword: boolean;
}

const clientSessionKey = "pronus:client-session";

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

function passwordIsValid(value: string) {
  return (
    value.length === 6 && /[A-Za-z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value)
  );
}

function readSession(): ClientAccessProfile | null {
  const raw = window.localStorage.getItem(clientSessionKey);

  if (raw === null) {
    return null;
  }

  try {
    return JSON.parse(raw) as ClientAccessProfile;
  } catch {
    return null;
  }
}

export function ClientPasswordGuard() {
  const [session, setSession] = useState<ClientAccessProfile | null>(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSession(readSession());
  }, []);

  if (session === null || !session.mustChangePassword) {
    return null;
  }

  const canSubmit = passwordIsValid(password) && password === confirmation && !isSaving;

  async function submitPassword() {
    if (session === null || !canSubmit) {
      setError("Use uma senha de 6 caracteres com letra, numero e caractere especial.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`${getApiUrl()}/client-access/password`, {
        body: JSON.stringify({ companyId: session.companyId, newPassword: password }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const payload = (await response.json()) as ClientAccessProfile | { message?: string };

      if (!response.ok) {
        setError(responseMessage(payload, "Nao foi possivel atualizar a senha."));
        return;
      }

      const nextSession = payload as ClientAccessProfile;
      window.localStorage.setItem(clientSessionKey, JSON.stringify(nextSession));
      setSession(nextSession);
      window.dispatchEvent(new Event("pronus-client-session-updated"));
    } catch {
      setError("Nao foi possivel conectar a API local.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
      <section className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-950">Atualize a senha do Portal RH</h2>
        <p className="mt-2 text-sm text-slate-600">
          Para proteger o acesso da empresa, escolha uma senha de 6 caracteres com letra, numero e
          caractere especial.
        </p>
        <div className="mt-4 space-y-3">
          <PasswordField label="Nova senha" value={password} onChange={setPassword} />
          <PasswordField label="Confirmar senha" value={confirmation} onChange={setConfirmation} />
        </div>
        {error !== null && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
        <button
          className="mt-5 w-full rounded-md bg-pronus-primary px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!canSubmit}
          type="button"
          onClick={() => void submitPassword()}
        >
          Salvar nova senha
        </button>
      </section>
    </div>
  );
}

function PasswordField({
  label,
  onChange,
  value,
}: Readonly<{ label: string; onChange: (value: string) => void; value: string }>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
