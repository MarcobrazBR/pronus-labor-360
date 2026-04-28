"use client";

import { useState } from "react";

const defaultPassword = "pronu123";

export default function PronusLoginPage() {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function login() {
    if (cpf.trim().length === 0 || password.length === 0) {
      setMessage("Informe CPF e senha para acessar.");
      return;
    }

    if (password === defaultPassword) {
      setMustChangePassword(true);
      setMessage("Primeiro acesso identificado. Troque a senha para continuar.");
      return;
    }

    setMessage("Credenciais recebidas. A autenticacao real sera ligada ao banco de usuarios.");
  }

  function changePassword() {
    if (newPassword.length < 8) {
      setMessage("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmation) {
      setMessage("A confirmacao precisa ser igual a nova senha.");
      return;
    }

    setMessage("Senha alterada. O usuario pode acessar o Portal PRONUS.");
    setMustChangePassword(false);
    setPassword("");
    setNewPassword("");
    setConfirmation("");
  }

  return (
    <main className="min-h-screen bg-pronus-background px-5 py-8 text-pronus-text">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <div>
          <img alt="Pronus Labor" className="h-20 w-auto" src="/brand/pronus-logo.png" />
          <h1 className="mt-8 max-w-2xl text-3xl font-semibold tracking-normal">
            Acesso administrativo PRONUS
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Login por CPF para equipe administrativa e corpo clinico. No primeiro acesso com senha
            padrao, a troca de senha e obrigatoria antes de entrar no sistema.
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
              className="w-full rounded-md bg-pronus-primary px-4 py-2.5 text-sm font-semibold text-white"
              type="button"
              onClick={login}
            >
              Acessar
            </button>
          </div>

          {mustChangePassword && (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-900">Troca obrigatoria de senha</h3>
              <div className="mt-3 space-y-3">
                <Field
                  label="Nova senha"
                  type="password"
                  value={newPassword}
                  onChange={setNewPassword}
                />
                <Field
                  label="Confirmar senha"
                  type="password"
                  value={confirmation}
                  onChange={setConfirmation}
                />
                <button
                  className="w-full rounded-md bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white"
                  type="button"
                  onClick={changePassword}
                >
                  Alterar senha
                </button>
              </div>
            </div>
          )}

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
