"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Calendar,
  Users,
  Activity,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  UserPlus,
  CalendarCheck,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

export default function DashboardHomePage() {
  const { user } = useAuth();

  const userRole = user?.role || "DENTISTA";
  const isDentistOrAdmin = userRole === "DENTISTA" || userRole === "ADMIN";

  // Metricas sintetizadas da operacao clinica
  const metrics = [
    {
      title: "Consultas Hoje",
      value: "8",
      subtext: "6 confirmadas • 2 pendentes",
      icon: Calendar,
      color: "teal",
      trend: "+12% vs. ontem",
    },
    {
      title: "Novos Pacientes (Mês)",
      value: "24",
      subtext: "Total cadastrado: 142",
      icon: Users,
      color: "blue",
      trend: "+18% este mês",
    },
    {
      title: "Procedimentos em Curso",
      value: "15",
      subtext: "Ortodontia & Endodontia",
      icon: Activity,
      color: "indigo",
      trend: "Capacidade: 85%",
    },
    {
      title: "Cáries Ativas Mapeadas",
      value: "7",
      subtext: "Odontogramas em tratamento",
      icon: AlertCircle,
      color: "rose",
      trend: "4 tratadas nesta semana",
    },
  ];

  // Grade de Proximos Atendimentos
  const nextAppointments = [
    {
      horario: "09:00",
      paciente: "João Mendes",
      procedimento: "Manutenção de Aparelho",
      dentista: "Dra. Ana Beatriz Silva",
      status: "CONFIRMADO",
      statusClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      id_paciente: 1,
    },
    {
      horario: "10:00",
      paciente: "Mariana Souza",
      procedimento: "Tratamento de Canal (Dente 46)",
      dentista: "Dr. Roberto Carlos",
      status: "AGENDADO",
      statusClass: "bg-blue-50 text-blue-700 border-blue-200",
      id_paciente: 2,
    },
    {
      horario: "11:30",
      paciente: "Carlos Alberto",
      procedimento: "Consulta Inicial / Avaliação",
      dentista: "Dra. Ana Beatriz Silva",
      status: "CONFIRMADO",
      statusClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      id_paciente: 3,
    },
    {
      horario: "14:00",
      paciente: "Fernanda Lima",
      procedimento: "Restauração Resina (Dente 16)",
      dentista: "Dra. Ana Beatriz Silva",
      status: "AGENDADO",
      statusClass: "bg-blue-50 text-blue-700 border-blue-200",
      id_paciente: 4,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Banner de Boas-Vindas */}
      <section className="bg-gradient-to-r from-teal-800 to-teal-900 rounded-2xl p-6 sm:p-8 text-white shadow-xs relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-700/80 text-teal-100 border border-teal-600/50 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
            Painel Geral • Ambiente Seguro
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Olá, {user?.name || "Profissional Clínico"}! 👋
          </h1>
          <p className="text-teal-100/90 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Bem-vindo ao centro de operações da clínica. Acompanhe atendimentos em tempo real,
            agendamentos sincronizados e o prontuário odontológico anatômico dos seus pacientes.
          </p>
        </div>

        {/* Circulo decorativo sutil */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-teal-700/30 blur-2xl pointer-events-none" />
      </section>

      {/* Grid de Cards de Metricas */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.title}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-teal-200 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">
                    {m.title}
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 block">
                    {m.value}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">{m.subtext}</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  {m.trend}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Area Dupla: Linha do Tempo de Atendimentos & Atalhos Rapidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Proximos Atendimentos (2 colunas no desktop) */}
        <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-700" />
                Próximos Atendimentos do Dia
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Consultas agendadas para o turno atual
              </p>
            </div>
            <Link
              href="/agenda"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              Ver Agenda Completa
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {nextAppointments.map((app, idx) => (
              <div
                key={idx}
                className="py-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-xs text-slate-700">
                    {app.horario}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">
                      {app.paciente}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {app.procedimento} • <span className="text-slate-700">{app.dentista}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${app.statusClass}`}
                  >
                    {app.status}
                  </span>

                  {isDentistOrAdmin && (
                    <Link
                      href="/odontograma"
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
                    >
                      Odontograma
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Atalhos Rapidos e Operacoes (1 coluna no desktop) */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100">
              <CalendarCheck className="w-4 h-4 text-teal-700" />
              Ações & Atalhos Rápidos
            </h2>

            <div className="space-y-3 mt-4">
              <Link
                href="/agenda"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-teal-900">
                      Abrir Agenda do Dia
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Grade horária e confirmações
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700" />
              </Link>

              <Link
                href="/pacientes"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-teal-900">
                      Cadastrar Paciente
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Novo prontuário e ficha cadastral
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700" />
              </Link>

              {isDentistOrAdmin && (
                <Link
                  href="/odontograma"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-800 group-hover:text-teal-900">
                        Ver Odontograma FDI
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Mapeamento dental e procedimentos
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700" />
                </Link>
              )}

              <Link
                href="/financeiro"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-teal-900">
                      Financeiro & Cobranças
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Honorários e fluxo de caixa
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700" />
              </Link>
            </div>
          </div>

          <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[11px] text-slate-500 font-medium">
              Ambiente em conformidade com o CFO e LGPD
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
