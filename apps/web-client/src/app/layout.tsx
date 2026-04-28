import "./globals.css";
import type { Metadata } from "next";
import { loadClientPortalData } from "./client-data";
import { ClientShell } from "./client-shell";

export const metadata: Metadata = {
  title: "Portal RH Cliente | Pronus Labor 360",
  description: "Indicadores, documentos e pendencias ocupacionais.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const data = await loadClientPortalData();

  return (
    <html lang="pt-BR">
      <body>
        <ClientShell companyName={data.activeCompany.tradeName}>{children}</ClientShell>
      </body>
    </html>
  );
}
