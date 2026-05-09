"use client";

import { useEffect, useState, type FormEvent } from "react";

type ClinicianSession = {
  cpf: string;
  email: string;
  fullName: string;
  id: string;
  license: string;
  mustChangePassword: boolean;
  specialty: string;
};

const demoClinician: Omit<ClinicianSession, "mustChangePassword"> = {
  cpf: "654.987.321-11",
  email: "carlos.nunes@pronus.com.br",
  fullName: "Carlos Henrique Nunes",
  id: "pronus-dr-carlos",
  license: "CRM-SP 123456",
  specialty: "Medico do Trabalho",
};

const passwordStorageKey = "pronus:clinician-passwords";
const sessionStorageKey = "pronus:clinician-session";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function standardPassword(cpf: string) {
  return onlyDigits(cpf).slice(0, 6);
}

function readPasswords(): Record<string, string> {
  const raw = window.localStorage.getItem(passwordStorageKey);

  if (raw === null) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export default function ClinicianLoginPage() {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const rawSession = window.localStorage.getItem(sessionStorageKey);

    if (rawSession !== null) {
      window.location.href = "/";
    }
  }, []);

  function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedCpf = onlyDigits(cpf);
    const expectedCpf = onlyDigits(demoClinician.cpf);

    if (normalizedCpf !== expectedCpf) {
      setMessage("CPF nao encontrado para o portal profissional.");
      return;
    }

    const savedPassword = readPasswords()[expectedCpf] ?? standardPassword(expectedCpf);

    if (password !== savedPassword) {
      setMessage("CPF ou senha invalidos.");
      return;
    }

    const mustChangePassword = password === standardPassword(expectedCpf);
    const session: ClinicianSession = {
      ...demoClinician,
      cpf: demoClinician.cpf,
      mustChangePassword,
    };

    window.localStorage.setItem(sessionStorageKey, JSON.stringify(session));
    window.location.href = "/";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-pronus-background px-5 py-10 text-pronus-text">
      <section className="w-full max-w-md rounded-lg border border-white/70 bg-white p-6 shadow-sm">
        <img alt="Pronus Labor" className="mx-auto h-20 w-auto" src="/brand/pronus-logo.png" />
        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-pronus-primary">
          Portal Profissional de Saude
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal">Acesso clinico</h1>

        <form className="mt-6 grid gap-4" onSubmit={submitLogin}>
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
            className="rounded-md bg-pronus-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pronus-primary/90"
            type="submit"
          >
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
