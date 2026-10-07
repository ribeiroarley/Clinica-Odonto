"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  Search,
  Filter,
} from "lucide-react";

interface BillingItem {
  id: number;
  paciente: string;
  procedimento: string;
  dentista: string;
  valor: number;
  formaPagamento: "PIX" | "CARTAO_CREDITO" | "CONVENIO" | "BOLETO";
  status: "PAGO" | "PENDENTE" | "PARCELADO";
  data: string;
}

const MOCK_BILLINGS: BillingItem[] = [
  {
    id: 1,
    paciente: "João Mendes",
    procedimento: "Restauração Resina (Dente 16)",
    dentista: "Dra. Ana Beatriz Silva",
    valor: 180.0,
    formaPagamento: "PIX",
    status: "PAGO",
    data: "07/10/2026",
  },
  {
    id: 2,
    paciente: "Mariana Souza",
    procedimento: "Tratamento de Canal (Dente 46)",
    dentista: "Dr. Roberto Carlos",
    valor: 800.0,
    formaPagamento: "CARTAO_CREDITO",
    status: "PARCELADO",
    data: "06/10/2026",
  },
  {
    id: 3,
    paciente: "Carlos Alberto",
    procedimento: "Consulta Inicial / Avaliação",
    dentista: "Dra. Ana Beatriz Silva",
    valor: 150.0,
    formaPagamento: "PIX",
    status: "PAGO",
    data: "05/10/2026",
  },
  {
    id: 4,
    paciente: "Fernanda Lima",
    procedimento: "Restauração Estética (Dente 21)",
    dentista: "Dr. Roberto Carlos",
    valor: 250.0,
    formaPagamento: "CONVENIO",
    status: "PENDENTE",
    data: "04/10/2026",
  },
  {
    id: 5,
    paciente: "Lucas Oliveira",
    procedimento: "Manutenção de Aparelho Ortodôntico",
    dentista: "Dra. Ana Beatriz Silva",
    valor: 160.0,
    formaPagamento: "PIX",
    status: "PAGO",
    data: "03/10/2026",
  },
];

export default function FinanceiroPage() {
  const { user } = useAuth();
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [busca, setBusca] = useState("");

  const filtered = MOCK_BILLINGS.filter((b) => {
    const matchStatus = filtroStatus === "TODOS" || b.status === filtroStatus;
    const matchBusca =
      b.paciente.toLowerCase().includes(busca.toLowerCase()) ||
      b.procedimento.toLowerCase().includes(busca.toLowerCase()) ||
      b.dentista.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const getStatusBadge = (status: BillingItem["status"]) => {
    switch (status) {
      case "PAGO":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PARCELADO":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PENDENTE":
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getPaymentBadge = (method: BillingItem["formaPagamento"]) => {
    switch (method) {
      case "PIX":
        return "PIX";
      case "CARTAO_CREDITO":
        return "Cartão Crédito";
      case "CONVENIO":
        return "Convênio Odonto";
      case "BOLETO":
        return "Boleto Bancário";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header da Secao */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-teal-700" />
            Gestão Financeira & Cobranças de Procedimentos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrativo de honorários odontológicos, cobranças efetuadas e conciliações
          </p>
        </div>

        <button
          onClick={() => alert("Relatório financeiro gerado com sucesso.")}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Exportar Relatório</span>
        </button>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">
            Faturamento Mensal
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            R$ 18.450,00
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs. mês anterior
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">
            Valores a Receber
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            R$ 3.200,00
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-2 block">
            8 faturamentos pendentes
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">
            Procedimentos Faturados
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            42 itens
          </span>
          <span className="text-[11px] text-teal-700 font-medium mt-2 block">
            Odontologia especializada
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">
            Ticket Médio / Procedimento
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            R$ 439,28
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-2 block">
            Base: Outubro / 2026
          </span>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por paciente, dentista ou procedimento..."
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
            <option value="PAGO">Pagos</option>
            <option value="PARCELADO">Parcelados</option>
            <option value="PENDENTE">Pendentes</option>
          </select>
        </div>

        <span className="text-xs text-slate-500">
          {filtered.length} cobrança(s) encontrada(s)
        </span>
      </div>

      {/* Tabela de Cobrancas */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Paciente</th>
                <th className="px-6 py-3">Procedimento</th>
                <th className="px-6 py-3">Profissional</th>
                <th className="px-6 py-3">Forma Pagto</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Valor</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {item.paciente}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {item.procedimento}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {item.dentista}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {getPaymentBadge(item.formaPagamento)}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {item.data}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    {item.valor.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
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
