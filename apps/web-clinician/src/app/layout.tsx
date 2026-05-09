import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal Profissional de Saude | Pronus Labor 360",
  description: "Atendimento clinico, videochamada e anamnese do profissional de saude.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
