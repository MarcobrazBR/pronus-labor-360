"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { PronusPasswordGuard } from "./pronus-password-guard";

const navigationItems = [
  { label: "PAINEL", href: "/" },
  { label: "EMPRESAS", href: "/empresas" },
  { label: "COLABORADORES", href: "/colaboradores" },
  { label: "CONFIGURAÇÕES", href: "/configuracoes" },
  { label: "RISCO OCUPACIONAL", href: "/nr01-pgr" },
  { label: "PSICOSSOCIAL", href: "/psicossocial" },
  { label: "DOCUMENTOS", href: "/documentos" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PronusShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/login")) {
      return;
    }

    const updateSessionState = () => {
      setHasSession(window.localStorage.getItem("pronus:operator-session") !== null);
    };

    updateSessionState();
    window.addEventListener("pronus-session-updated", updateSessionState);

    return () => window.removeEventListener("pronus-session-updated", updateSessionState);
  }, [pathname]);

  if (pathname.startsWith("/login")) {
    return <>{children}</>;
  }

  if (hasSession === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pronus-background px-5 text-sm text-slate-600">
        Carregando acesso PRONUS...
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pronus-background px-5 text-center">
        <section className="w-full max-w-md rounded-lg border border-white/70 bg-white p-6 shadow-sm">
          <img alt="Pronus Labor" className="mx-auto h-20 w-auto" src="/brand/pronus-logo.png" />
          <h1 className="mt-5 text-xl font-semibold text-slate-950">Portal PRONUS</h1>
          <p className="mt-2 text-sm text-slate-600">Entre com seu CPF para acessar a operação.</p>
          <Link
            className="mt-5 inline-flex rounded-md bg-pronus-primary px-4 py-2.5 text-sm font-semibold text-white"
            href="/login"
          >
            Ir para login
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pronus-background text-pronus-text">
      <div className="mx-auto flex min-h-screen max-w-[1500px] gap-7 px-5 py-5 lg:px-8">
        <aside className="hidden w-72 shrink-0 xl:block">
          <div className="sticky top-5 rounded-lg border border-white/70 bg-white/95 p-4 shadow-sm">
            <div className="mb-7">
              <img alt="Pronus Labor" className="h-20 w-auto" src="/brand/pronus-logo.png" />
              <h1 className="mt-4 text-lg font-semibold uppercase tracking-wide">PORTAL PRONUS</h1>
            </div>
            <div className="mb-5 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                OPERAÇÕES
              </p>
            </div>
            <nav
              className="space-y-2 text-sm font-semibold uppercase tracking-wide text-slate-600"
              aria-label="Menu principal"
            >
              {navigationItems.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    className={`group flex items-center justify-between rounded-md border px-3 py-3 transition ${
                      active
                        ? "border-pronus-primary bg-pronus-primary text-white shadow-sm"
                        : "border-slate-200 bg-white hover:border-pronus-primary/40 hover:bg-slate-50 hover:text-pronus-text"
                    }`}
                    href={item.href}
                  >
                    {item.label}
                    <span
                      className={`h-2 w-2 rounded-full transition ${
                        active ? "bg-white" : "bg-slate-200 group-hover:bg-pronus-primary/50"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 rounded-lg border border-white/70 bg-white/90 p-4 shadow-sm xl:hidden">
            <div className="mb-4">
              <img alt="Pronus Labor" className="h-14 w-auto" src="/brand/pronus-logo.png" />
              <h1 className="mt-2 text-lg font-semibold uppercase tracking-wide">PORTAL PRONUS</h1>
            </div>
            <nav
              className="flex gap-2 overflow-x-auto pb-1 text-sm font-semibold uppercase tracking-wide"
              aria-label="Menu principal"
            >
              {navigationItems.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    className={`whitespace-nowrap rounded-md px-3 py-2 ${
                      active
                        ? "bg-pronus-primary text-white"
                        : "border border-slate-200 bg-white text-slate-700"
                    }`}
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <main className="pb-8">
            <PronusPasswordGuard />
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
