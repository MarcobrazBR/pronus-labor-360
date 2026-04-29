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

function passwordValidation(value: string) {
  return {
    hasLetter: /[A-Za-z]/.test(value),
    hasNumber: /\d/.test(value),
    hasSixCharacters: value.length === 6,
    hasSpecial: /[^A-Za-z0-9]/.test(value),
  };
}

function passwordValidationMessage(value: string, confirmation: string) {
  const validation = passwordValidation(value);

  if (!validation.hasSixCharacters) {
    return "A senha precisa ter exatamente 6 caracteres.";
  }

  if (!validation.hasLetter) {
    return "Inclua pelo menos uma letra na senha.";
  }

  if (!validation.hasNumber) {
    return "Inclua pelo menos um numero na senha.";
  }

  if (!validation.hasSpecial) {
    return "Inclua pelo menos um caractere especial, como @, # ou !.";
  }

  if (value !== confirmation) {
    return "A confirmacao precisa ser igual a nova senha.";
  }

  return null;
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

  const canSubmit = !isSaving;
  const validationMessage = passwordValidationMessage(password, confirmation);

  async function submitPassword() {
    if (session === null) {
      return;
    }

    if (validationMessage !== null) {
      setError(validationMessage);
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
        <PasswordChecklist password={password} confirmation={confirmation} />
        {error !== null && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
        <button
          className="mt-5 w-full rounded-md bg-pronus-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          disabled={!canSubmit}
          type="button"
          onClick={() => void submitPassword()}
        >
          {isSaving ? "Salvando..." : "Salvar nova senha"}
        </button>
      </section>
    </div>
  );
}

function PasswordChecklist({
  confirmation,
  password,
}: Readonly<{ confirmation: string; password: string }>) {
  const validation = passwordValidation(password);
  const items = [
    { done: validation.hasSixCharacters, label: "Exatamente 6 caracteres" },
    { done: validation.hasLetter, label: "Pelo menos uma letra" },
    { done: validation.hasNumber, label: "Pelo menos um numero" },
    { done: validation.hasSpecial, label: "Pelo menos um caractere especial" },
    {
      done: password.length > 0 && password === confirmation,
      label: "Confirmacao igual a nova senha",
    },
  ];

  return (
    <ul className="mt-4 grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
              item.done ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-400"
            }`}
          >
            {item.done ? "OK" : "-"}
          </span>
          <span className={item.done ? "font-semibold text-emerald-700" : undefined}>
            {item.label}
          </span>
        </li>
      ))}
    </ul>
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
