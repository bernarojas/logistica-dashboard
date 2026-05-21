import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard Logístico | Análisis de Encuestas",
  description: "Panel de análisis de encuestas para parqueo de camiones y plataforma logística en Alto Hospicio, Chile.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
