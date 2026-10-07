"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Activity,
  CreditCard,
  ShieldCheck,
  LogOut,
  Plus,
  Stethoscope,
  Menu,
  X,
  Database,
  ChevronRight,
  Clock,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: Array<"ADMIN" | "DENTISTA" | "RECEPCAO">;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Geral",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["ADMIN", "DENTISTA", "RECEPCAO"],
      },
      {
        name: "Agenda",
        href: "/agenda",
        icon: Calendar,
        roles: ["ADMIN", "DENTISTA", "RECEPCAO"],
      },
    ],
  },
  {
    title: "Clínica",
    items: [
      {
        name: "Pacientes",
        href: "/pacientes",
        icon: Users,
        roles: ["ADMIN", "DENTISTA", "RECEPCAO"],
      },
      {
        name: "Odontograma FDI",
        href: "/odontograma",
        icon: Activity,
        roles: ["ADMIN", "DENTISTA"], // Oculto para Recepção por compliance LGPD
      },
    ],
  },
  {
    title: "Gestão",
    items: [
      {
        name: "Procedimentos & Financeiro",
        href: "/financeiro",
        icon: CreditCard,
        roles: ["ADMIN", "DENTISTA", "RECEPCAO"],
      },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Formata a data atual por extenso em portugues
  const currentDateFormatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  // Capitaliza a primeira letra do dia da semana
  const capitalizedDate =
    currentDateFormatted.charAt(0).toUpperCase() + currentDateFormatted.slice(1);

  const userRole = user?.role || "DENTISTA";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Lateral */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header da Sidebar / Marca */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-xs">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-sm tracking-tight leading-none">
                  OdontoSys Pro
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  23ai
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Sistema Clínico Integrado
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badge de Compliance e Seguranca */}
        <div className="px-5 py-2.5 bg-emerald-50/70 border-b border-emerald-100/60 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="text-[11px] font-medium text-emerald-800">
            LGPD Ativa • Sessão Criptografada
          </span>
        </div>

        {/* Itens de Navegacao */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {NAV_SECTIONS.map((section) => {
            // Filtra os itens permitidos para a role atual
            const visibleItems = section.items.filter((item) =>
              item.roles.includes(userRole)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1.5">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href === "/dashboard" && pathname === "/");
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? "bg-teal-700 text-white shadow-xs font-bold"
                            : "text-slate-600 hover:text-teal-800 hover:bg-slate-100/80"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 ${
                              isActive ? "text-white" : "text-slate-500"
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-200" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Rodape da Sidebar com Perfil e Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-800 font-bold text-xs shrink-0 uppercase">
                {user?.name ? user.name.slice(0, 2) : "US"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {user?.name || "Profissional Clínico"}
                </p>
                <p className="text-[10px] font-semibold text-teal-700 uppercase tracking-tight mt-0.5">
                  {user?.role || "DENTISTA"}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Encerrar Sessão"
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
              aria-label="Sair do sistema"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Area Central de Conteudo */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Superior Corporativo */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                aria-label="Abrir menu lateral"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <h2 className="text-xs font-semibold text-slate-800 capitalize sm:text-sm">
                  {capitalizedDate}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <Database className="w-3 h-3 text-emerald-600" />
                    Oracle 23ai Free Conectado
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/agenda"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Agendamento</span>
                <span className="sm:hidden">Novo</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Conteudo Principal Renderizado pela Rota */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
