import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal PRONUS | Pronus Labor 360",
  description: "Operacao administrativa, SST, NR-01/PGR e risco psicossocial.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
