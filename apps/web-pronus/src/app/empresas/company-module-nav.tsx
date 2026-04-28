"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/empresas/busca", label: "Busca Empresa" },
  { href: "/empresas/cargos", label: "Cargos" },
  { href: "/empresas/setores", label: "Setores" },
  { href: "/empresas/clientes", label: "Clientes" },
];

export function CompanyModuleNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-5 flex flex-wrap gap-2 text-sm font-semibold" aria-label="Submenu Empresas">
      {items.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            className={`rounded-md px-3 py-2 ${
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
  );
}
