"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigationItems = [
  { href: "/", label: "PAINEL" },
  { href: "/clientes", label: "CLIENTES" },
  { href: "/divergencias", label: "DIVERGÊNCIAS" },
  { href: "/documentos", label: "DOCUMENTOS" },
  { href: "/riscos", label: "RISCO OCUPACIONAL" },
  { href: "/psicossocial", label: "PSICOSSOCIAL" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ClientShell({
  children,
  companyName,
}: Readonly<{ children: ReactNode; companyName: string }>) {
  const pathname = usePathname();

  if (pathname.startsWith("/login")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-pronus-background text-pronus-text">
      <div className="mx-auto flex min-h-screen max-w-[1500px] gap-7 px-5 py-5 lg:px-8">
        <aside className="hidden w-72 shrink-0 xl:block">
          <div className="sticky top-5 rounded-lg border border-white/70 bg-white/95 p-4 shadow-sm">
            <div className="mb-7">
              <img alt="Pronus Labor" className="h-16 w-auto" src="/brand/pronus-logo.png" />
              <h1 className="mt-4 text-lg font-semibold uppercase tracking-wide">PORTAL RH</h1>
            </div>
            <div className="mb-5 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-slate-700" title={companyName}>
                {companyName}
              </p>
            </div>
            <nav
              aria-label="Menu principal"
              className="space-y-2 text-sm font-semibold uppercase tracking-wide text-slate-600"
            >
              {navigationItems.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    aria-current={active ? "page" : undefined}
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
              <img alt="Pronus Labor" className="h-12 w-auto" src="/brand/pronus-logo.png" />
              <h1 className="mt-2 text-lg font-semibold uppercase tracking-wide">PORTAL RH</h1>
              <p className="mt-1 truncate text-sm font-semibold text-slate-600" title={companyName}>
                {companyName}
              </p>
            </div>
            <nav
              aria-label="Menu principal"
              className="grid grid-cols-2 gap-2 text-sm font-semibold uppercase tracking-wide sm:grid-cols-3"
            >
              {navigationItems.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-10 items-center rounded-md px-3 py-2 ${
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

          <main className="pb-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
