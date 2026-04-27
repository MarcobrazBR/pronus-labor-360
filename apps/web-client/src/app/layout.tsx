import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal RH Cliente | Pronus Labor 360",
  description: "Indicadores, documentos e pendencias ocupacionais.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
