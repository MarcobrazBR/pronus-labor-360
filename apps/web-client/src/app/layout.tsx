import "./globals.css";
import type { Metadata } from "next";
import { ClientShell } from "./client-shell";

export const metadata: Metadata = {
  title: "Portal RH Cliente | Pronus Labor 360",
  description: "Indicadores, documentos e pendencias ocupacionais.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
