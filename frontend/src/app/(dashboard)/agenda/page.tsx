"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Calendar as CalendarIcon,
  Clock,
  Search,
  Filter,
  User,
  Phone,
  Stethoscope,
  CheckCircle,
} from "lucide-react";

interface AppointmentItem {
  id: number;
  horario: string;
  paciente: string;
  telefone: string;
  dentista: string;
  procedimento: string;
  status: "AGENDADO" | "CONFIRMADO" | "REALIZADO" | "CANCELADO";
}

const MOCK_AGENDA: AppointmentItem[] = [
  {
    id: 1,
    horario: "09:00 - 09:30",
    paciente: "João Mendes",
    telefone: "(11) 97777-6666",
    dentista: "Dra. Ana Beatriz Silva",
    procedimento: "Manutenção de Aparelho",
    status: "CONFIRMADO",
  },
  {
    id: 2,
    horario: "10:00 - 10:45",
    paciente: "Mariana Souza",
    telefone: "(11) 98888-5555",
    dentista: "Dr. Roberto Carlos",
    procedimento: "Tratamento de Canal",
    status: "AGENDADO",
  },
  {
    id: 3,
    horario: "11:30 - 12:00",
    paciente: "Carlos Alberto",
    telefone: "(11) 99999-4444",
    dentista: "Dra. Ana Beatriz Silva",
    procedimento: "Consulta Inicial / Avaliação",
    status: "REALIZADO",
  },
  {
    id: 4,
    horario: "14:00 - 14:30",
    paciente: "Fernanda Lima",
    telefone: "(11) 96666-3333",
    dentista: "Dr. Roberto Carlos",
    procedimento: "Restauração Estética",
    status: "CANCELADO",
  },
  {
    id: 5,
    horario: "15:30 - 16:15",
    paciente: "Lucas Oliveira",
    telefone: "(11) 95555-2222",
    dentista: "Dra. Ana Beatriz Silva",
    procedimento: "Profilaxia e Raspagem",
    status: "CONFIRMADO",
  },
];

export default function AgendaPage() {
  const { user } = useAuth();
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [busca, setBusca] = useState("");

  const filtered = MOCK_AGENDA.filter((item) => {
    const matchStatus = filtroStatus === "TODOS" || item.status === filtroStatus;
    const matchBusca =
      item.paciente.toLowerCase().includes(busca.toLowerCase()) ||
      item.dentista.toLowerCase().includes(busca.toLowerCase()) ||
      item.procedimento.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const getStatusBadge = (status: AppointmentItem["status"]) => {
    switch (status) {
      case "CONFIRMADO":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "AGENDADO":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "CANCELADO":
        return "bg-red-50 text-red-700 border-red-200 line-through opacity-75";
      case "REALIZADO":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner de Secao */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-teal-700" />
            Central de Agendamentos & Grade do Dia
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerenciamento de horários, confirmações e recepção de pacientes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
            {filtered.length} agendamento(s)
          </span>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar paciente, dentista ou procedimento..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs border border-slate-200 text-slate-700 bg-white focus:outline-none focus:border-teal-600"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="AGENDADO">Agendados</option>
            <option value="CONFIRMADO">Confirmados</option>
            <option value="REALIZADO">Realizados</option>
            <option value="CANCELADO">Cancelados</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Hoje: {new Date().toLocaleDateString("pt-BR")}
          </span>
        </div>
      </div>

      {/* Tabela de Consultas */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Grade Horária do Turno
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Janela padrão: 30 a 45 minutos por procedimento
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Horário</th>
                <th className="px-6 py-3">Paciente</th>
                <th className="px-6 py-3">Telefone</th>
                <th className="px-6 py-3">Dentista Responsável</th>
                <th className="px-6 py-3">Procedimento</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    {item.horario}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {item.paciente}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{item.telefone}</td>
                  <td className="px-6 py-4 text-slate-700">{item.dentista}</td>
                  <td className="px-6 py-4 text-slate-600">{item.procedimento}</td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
