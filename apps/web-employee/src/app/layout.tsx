import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal Colaborador | Pronus Labor 360",
  description: "Acesso do colaborador para cadastro, consentimentos e questionarios.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
