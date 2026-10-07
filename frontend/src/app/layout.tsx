import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Clínica Odontológica - Sistema de Gestão & Odontograma FDI",
  description: "Plataforma clínica profissional para prontuário eletrônico, agendamento e odontograma interativo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
