"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Users,
  Search,
  UserPlus,
  Activity,
  FileText,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  MoreVertical,
} from "lucide-react";

interface PatientRecord {
  id: number;
  nome: string;
  cpf: string;
  idade: number;
  telefone: string;
  email: string;
  dentistaResponsavel: string;
  status: "ATIVO" | "EM_TRATAMENTO" | "ALTA";
  ultimaConsulta: string;
}

const MOCK_PACIENTES: PatientRecord[] = [
  {
    id: 1,
    nome: "João Mendes",
    cpf: "123.456.789-01",
    idade: 34,
    telefone: "(11) 97777-6666",
    email: "joao.mendes@email.com",
    dentistaResponsavel: "Dra. Ana Beatriz Silva",
    status: "EM_TRATAMENTO",
    ultimaConsulta: "06/10/2026",
  },
  {
    id: 2,
    nome: "Mariana Souza",
    cpf: "234.567.890-12",
    idade: 28,
    telefone: "(11) 98888-5555",
    email: "mariana.souza@email.com",
    dentistaResponsavel: "Dr. Roberto Carlos",
    status: "EM_TRATAMENTO",
    ultimaConsulta: "01/10/2026",
  },
  {
    id: 3,
    nome: "Carlos Alberto",
    cpf: "345.678.901-23",
    idade: 45,
    telefone: "(11) 99999-4444",
    email: "carlos.alberto@email.com",
    dentistaResponsavel: "Dra. Ana Beatriz Silva",
    status: "ATIVO",
    ultimaConsulta: "28/09/2026",
  },
  {
    id: 4,
    nome: "Fernanda Lima",
    cpf: "456.789.012-34",
    idade: 31,
    telefone: "(11) 96666-3333",
    email: "fernanda.lima@email.com",
    dentistaResponsavel: "Dr. Roberto Carlos",
    status: "ATIVO",
    ultimaConsulta: "15/09/2026",
  },
  {
    id: 5,
    nome: "Lucas Oliveira",
    cpf: "567.890.123-45",
    idade: 22,
    telefone: "(11) 95555-2222",
    email: "lucas.oliveira@email.com",
    dentistaResponsavel: "Dra. Ana Beatriz Silva",
    status: "ALTA",
    ultimaConsulta: "10/08/2026",
  },
];

export default function PacientesPage() {
  const { user } = useAuth();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");

  const userRole = user?.role || "DENTISTA";
  const canAccessOdontogram = userRole === "DENTISTA" || userRole === "ADMIN";

  const filtered = MOCK_PACIENTES.filter((p) => {
    const matchStatus = filtroStatus === "TODOS" || p.status === filtroStatus;
    const matchBusca =
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.cpf.includes(busca) ||
      p.telefone.includes(busca);
    return matchStatus && matchBusca;
  });

  const getStatusBadge = (status: PatientRecord["status"]) => {
    switch (status) {
      case "EM_TRATAMENTO":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "ATIVO":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "ALTA":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header da Secao */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-700" />
            Gestão de Pacientes & Prontuários Clínicos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastro de pacientes, histórico de anamnese e fichas de acompanhamento
          </p>
        </div>

        <button
          onClick={() => alert("Formulário de cadastro em desenvolvimento.")}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Paciente</span>
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou telefone..."
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
            <option value="ATIVO">Ativos</option>
            <option value="EM_TRATAMENTO">Em Tratamento</option>
            <option value="ALTA">Com Alta Clínica</option>
          </select>
        </div>

        <span className="text-xs text-slate-500">
          {filtered.length} paciente(s) listado(s)
        </span>
      </div>

      {/* Tabela de Pacientes */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Paciente</th>
                <th className="px-6 py-3">CPF</th>
                <th className="px-6 py-3">Contato</th>
                <th className="px-6 py-3">Dentista Responsável</th>
                <th className="px-6 py-3">Última Consulta</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((paciente) => (
                <tr key={paciente.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                        {paciente.nome.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block leading-tight">
                          {paciente.nome}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {paciente.idade} anos
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-700">
                    {paciente.cpf}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div>{paciente.telefone}</div>
                    <div className="text-[11px] text-slate-400">{paciente.email}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">
                    {paciente.dentistaResponsavel}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {paciente.ultimaConsulta}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(
                        paciente.status
                      )}`}
                    >
                      {paciente.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canAccessOdontogram && (
                        <Link
                          href="/odontograma"
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors flex items-center gap-1"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          <span>Odontograma</span>
                        </Link>
                      )}
                    </div>
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
