"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigationItems = [
  { label: "Painel", href: "/" },
  { label: "Empresas", href: "/empresas" },
  { label: "Colaboradores", href: "/colaboradores" },
  { label: "NR-01/PGR", href: "/nr01-pgr" },
  { label: "Psicossocial", href: "/psicossocial" },
  { label: "Documentos", href: "/documentos" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PronusShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-8 px-5 py-5 lg:px-8">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 pr-6 xl:block">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-pronus-primary">
              Pronus Labor 360
            </p>
            <h1 className="mt-1 text-xl font-semibold">Portal PRONUS</h1>
          </div>

          <nav className="space-y-1 text-sm font-medium text-slate-600" aria-label="Menu principal">
            {navigationItems.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  className={`block rounded-md px-3 py-2 ${
                    active
                      ? "bg-pronus-primary text-white"
                      : "hover:bg-white hover:text-pronus-text"
                  }`}
                  href={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 xl:hidden">
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-pronus-primary">
                Pronus Labor 360
              </p>
              <h1 className="mt-1 text-xl font-semibold">Portal PRONUS</h1>
            </div>
            <nav
              className="flex gap-2 overflow-x-auto pb-1 text-sm font-medium"
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

          {children}
        </div>
      </div>
    </div>
  );
}
