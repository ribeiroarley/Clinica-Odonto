"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { PatientOdontogram, ToothFace, FaceState, ToothGeneralStatus } from "@/lib/types";
import { OdontogramGrid } from "@/components/clinical/OdontogramGrid";
import { useAuth } from "@/lib/auth-context";
import {
  Activity,
  Calendar,
  Clock,
  FileText,
  Heart,
  RefreshCw,
  User,
  ShieldCheck,
  Stethoscope,
  AlertTriangle,
} from "lucide-react";

export default function OdontogramPage() {
  const { user } = useAuth();
  const [patientId] = useState<number>(1);
  const [odontogram, setOdontogram] = useState<PatientOdontogram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega o odontograma do paciente
  const fetchOdontogram = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getPatientOdontogram(patientId);
      setOdontogram(data);
    } catch (err) {
      console.warn("API indisponivel ou offline, instanciando dados demonstrativos para visualizacao:", err);
      // Estado de fallback resiliente para demonstracao e prototipagem
      setOdontogram({
        id_paciente: 1,
        nome_paciente: "João Mendes",
        total_dentes_registrados: 3,
        dentes: [
          {
            id_odontograma: 101,
            id_paciente: 1,
            numero_dente: 16,
            status_geral: "EM_TRATAMENTO",
            data_atualizacao: new Date().toISOString(),
            procedimentos: [
              {
                id_odonto_proc: 1,
                id_procedimento: 1,
                nome_procedimento: "Restauração Resina",
                face_dente: "O",
                estado_face: "CARIE",
                valor_aplicado: 180,
                data_registro: new Date().toISOString(),
              },
            ],
          },
          {
            id_odontograma: 102,
            id_paciente: 1,
            numero_dente: 21,
            status_geral: "EM_TRATAMENTO",
            data_atualizacao: new Date().toISOString(),
            procedimentos: [
              {
                id_odonto_proc: 2,
                id_procedimento: 1,
                nome_procedimento: "Restauração Estética",
                face_dente: "V",
                estado_face: "RESTAURADO",
                valor_aplicado: 250,
                data_registro: new Date().toISOString(),
              },
            ],
          },
          {
            id_odontograma: 103,
            id_paciente: 1,
            numero_dente: 46,
            status_geral: "ENDODONTIA",
            data_atualizacao: new Date().toISOString(),
            procedimentos: [
              {
                id_odonto_proc: 3,
                id_procedimento: 2,
                nome_procedimento: "Tratamento de Canal",
                face_dente: "GERAL",
                estado_face: "CANAL",
                valor_aplicado: 800,
                data_registro: new Date().toISOString(),
              },
            ],
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOdontogram();
  }, [patientId]);

  const handleSaveProcedure = async (payload: {
    numero_dente: number;
    face_dente: ToothFace;
    estado_face: FaceState;
    id_procedimento: number;
    valor_aplicado?: number;
    status_geral_novo?: ToothGeneralStatus;
    observacoes?: string;
  }) => {
    try {
      await apiClient.saveToothProcedure({
        id_paciente: patientId,
        ...payload,
      });
      await fetchOdontogram();
    } catch {
      // Atualizacao otimista no estado local caso a API esteja sem o container ativo
      setOdontogram((prev) => {
        if (!prev) return prev;
        const existingTooth = prev.dentes.find((d) => d.numero_dente === payload.numero_dente);
        const updatedDentes = [...prev.dentes];

        const newProc = {
          id_odonto_proc: Date.now(),
          id_procedimento: payload.id_procedimento,
          nome_procedimento: payload.estado_face === "CANAL" ? "Tratamento Endodôntico" : "Procedimento Clínico",
          face_dente: payload.face_dente,
          estado_face: payload.estado_face,
          valor_aplicado: payload.valor_aplicado || 150,
          data_registro: new Date().toISOString(),
        };

        if (existingTooth) {
          existingTooth.status_geral = payload.status_geral_novo || existingTooth.status_geral;
          existingTooth.procedimentos = [newProc, ...existingTooth.procedimentos];
        } else {
          updatedDentes.push({
            id_odontograma: Date.now(),
            id_paciente: patientId,
            numero_dente: payload.numero_dente,
            status_geral: payload.status_geral_novo || "EM_TRATAMENTO",
            data_atualizacao: new Date().toISOString(),
            procedimentos: [newProc],
          });
        }

        return {
          ...prev,
          total_dentes_registrados: updatedDentes.length,
          dentes: updatedDentes,
        };
      });
    }
  };

  // Contadores estatísticos
  const totalCaries =
    odontogram?.dentes.reduce(
      (acc, d) => acc + d.procedimentos.filter((p) => p.estado_face === "CARIE").length,
      0
    ) || 0;

  const totalRestaurados =
    odontogram?.dentes.reduce(
      (acc, d) => acc + d.procedimentos.filter((p) => p.estado_face === "RESTAURADO").length,
      0
    ) || 0;

  const totalCanais =
    odontogram?.dentes.reduce(
      (acc, d) =>
        acc +
        (d.status_geral === "ENDODONTIA" ||
        d.procedimentos.some((p) => p.estado_face === "CANAL")
          ? 1
          : 0),
      0
    ) || 0;

  return (
    <div className="space-y-6">
      {/* Patient Summary Header Card */}
      <section className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-xl">
              JM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {odontogram?.nome_paciente || "João Mendes"}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  Ativo
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-100 text-teal-800">
                  Prontuário #001
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                <span>CPF: 123.456.789-01</span>
                <span>•</span>
                <span>Idade: 34 anos</span>
                <span>•</span>
                <span>Telefone: (11) 97777-6666</span>
                <span>•</span>
                <span>Dentista Resp.: {user?.name || "Dra. Ana Beatriz Silva"}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Refresh */}
          <div className="flex items-center gap-3">
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center">
              <span className="block text-lg font-bold text-red-700 leading-none">
                {totalCaries}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-red-600">
                Cáries Ativas
              </span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-center">
              <span className="block text-lg font-bold text-emerald-700 leading-none">
                {totalRestaurados}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                Restaurados
              </span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-center">
              <span className="block text-lg font-bold text-blue-700 leading-none">
                {totalCanais}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                Endodontia
              </span>
            </div>

            <button
              onClick={fetchOdontogram}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Recarregar</span>
            </button>
          </div>
        </div>
      </section>

      {/* Grid Interativo do Odontograma */}
      <section className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-700" />
              Mapeamento Dental Anatômico (Padrão FDI)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Clique em qualquer dente ou face (Vestibular, Lingual, Oclusal, Mesial, Distal) para lançar procedimentos.
            </p>
          </div>
        </div>

        <OdontogramGrid
          odontogram={
            odontogram || {
              id_paciente: patientId,
              nome_paciente: "João Mendes",
              total_dentes_registrados: 0,
              dentes: [],
            }
          }
          onSaveProcedure={handleSaveProcedure}
        />
      </section>
    </div>
  );
}
