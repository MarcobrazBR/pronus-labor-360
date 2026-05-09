"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  getApiUrl,
  isClinicalProfile,
  responseMessage,
  sessionStorageKey,
  toClinicianSession,
  type PronusAccessProfile,
} from "../clinician-access";

export default function ClinicianLoginPage() {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const rawSession = window.localStorage.getItem(sessionStorageKey);

    if (rawSession !== null) {
      window.location.href = "/";
    }
  }, []);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (cpf.trim().length === 0 || password.length === 0) {
      setMessage("Informe CPF e senha para acessar.");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${getApiUrl()}/pronus-access/login`, {
        body: JSON.stringify({ cpf, password }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as PronusAccessProfile | { message?: string };

      if (!response.ok) {
        setMessage(responseMessage(payload, "CPF ou senha invalidos."));
        return;
      }

      const profile = payload as PronusAccessProfile;

      if (!isClinicalProfile(profile)) {
        setMessage("Acesso exclusivo para profissionais de saude da PRONUS.");
        return;
      }

      window.localStorage.setItem(sessionStorageKey, JSON.stringify(toClinicianSession(profile)));
      window.location.href = "/";
    } catch {
      setMessage("Nao foi possivel conectar a API local.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-pronus-background px-5 py-10 text-pronus-text">
      <section className="w-full max-w-md rounded-lg border border-white/70 bg-white p-6 shadow-sm">
        <img alt="Pronus Labor" className="mx-auto h-20 w-auto" src="/brand/pronus-logo.png" />
        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-pronus-primary">
          Portal Profissional de Saude
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal">Acesso clinico</h1>

        <form className="mt-6 grid gap-4" onSubmit={(event) => void submitLogin(event)}>
          <label className="text-xs font-semibold uppercase text-slate-500">
            CPF
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal normal-case text-slate-900 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
              inputMode="numeric"
              placeholder="Digite seu CPF"
              value={cpf}
              onChange={(event) => setCpf(event.target.value)}
            />
          </label>
          <label className="text-xs font-semibold uppercase text-slate-500">
            Senha
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal normal-case text-slate-900 outline-none focus:border-pronus-primary focus:ring-2 focus:ring-pronus-primary/20"
              placeholder="Digite sua senha"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {message !== null && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
              {message}
            </div>
          )}

          <button
            className="rounded-md bg-pronus-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pronus-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Acessando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
