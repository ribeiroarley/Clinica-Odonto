"use client";

import React, { useState } from "react";
import {
  ToothFace,
  FaceState,
  ToothGeneralStatus,
  ToothState,
  PatientOdontogram,
} from "@/lib/types";
import { ToothFaceSVG } from "./ToothFaceSVG";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  PlusCircle,
  X,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

interface OdontogramGridProps {
  odontogram: PatientOdontogram;
  onSaveProcedure: (payload: {
    numero_dente: number;
    face_dente: ToothFace;
    estado_face: FaceState;
    id_procedimento: number;
    valor_aplicado?: number;
    status_geral_novo?: ToothGeneralStatus;
    observacoes?: string;
  }) => Promise<void>;
}

// Numeração FDI padrão dos 4 quadrantes
const QUADRANT_1 = [18, 17, 16, 15, 14, 13, 12, 11]; // Superior Direito do paciente
const QUADRANT_2 = [21, 22, 23, 24, 25, 26, 27, 28]; // Superior Esquerdo do paciente
const QUADRANT_4 = [48, 47, 46, 45, 44, 43, 42, 41]; // Inferior Direito do paciente
const QUADRANT_3 = [31, 32, 33, 34, 35, 36, 37, 38]; // Inferior Esquerdo do paciente

type ActiveTool = FaceState | "AUSENTE" | "IMPLANTE" | "HIGIDO";

export const OdontogramGrid: React.FC<OdontogramGridProps> = ({
  odontogram,
  onSaveProcedure,
}) => {
  const [activeTool, setActiveTool] = useState<ActiveTool>("CARIE");
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Mapeia dentes por numero
  const teethMap = new Map<number, ToothState>();
  odontogram.dentes.forEach((d) => teethMap.set(d.numero_dente, d));

  const getToothData = (num: number): ToothState => {
    return (
      teethMap.get(num) || {
        id_odontograma: 0,
        id_paciente: odontogram.id_paciente,
        numero_dente: num,
        status_geral: "HIGIDO",
        data_atualizacao: new Date().toISOString(),
        procedimentos: [],
      }
    );
  };

  const handleFaceClick = async (toothNumber: number, face: ToothFace) => {
    setIsSubmitting(true);
    setFeedbackMsg(null);
    try {
      if (activeTool === "AUSENTE" || activeTool === "IMPLANTE" || activeTool === "HIGIDO") {
        await onSaveProcedure({
          numero_dente: toothNumber,
          face_dente: "GERAL",
          estado_face: "RESTAURADO", // fallback estado
          id_procedimento: 1,
          status_geral_novo: activeTool,
        });
      } else {
        await onSaveProcedure({
          numero_dente: toothNumber,
          face_dente: face,
          estado_face: activeTool,
          id_procedimento: activeTool === "CANAL" ? 2 : 1,
          status_geral_novo: activeTool === "CANAL" ? "ENDODONTIA" : "EM_TRATAMENTO",
        });
      }
      setFeedbackMsg(`Dente ${toothNumber} atualizado com sucesso!`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      setFeedbackMsg(`Erro ao salvar: ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeToothData = selectedTooth ? getToothData(selectedTooth) : null;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Barra de Ferramentas / Seletor de Estado Clinico */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Ferramenta Ativa de Marcação Rápida
            </h3>
            <p className="text-xs text-slate-500">
              Selecione uma condição e clique diretamente na face do dente para registrar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* CARIE */}
            <button
              onClick={() => setActiveTool("CARIE")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTool === "CARIE"
                  ? "bg-red-600 text-white shadow-md ring-2 ring-red-400 ring-offset-1"
                  : "bg-red-50 text-red-700 hover:bg-red-100"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
              Cárie Ativa
            </button>

            {/* RESTAURADO */}
            <button
              onClick={() => setActiveTool("RESTAURADO")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTool === "RESTAURADO"
                  ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-400 ring-offset-1"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              Restauração
            </button>

            {/* CANAL */}
            <button
              onClick={() => setActiveTool("CANAL")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTool === "CANAL"
                  ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-400 ring-offset-1"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Canal (Endo)
            </button>

            {/* FRATURA */}
            <button
              onClick={() => setActiveTool("FRATURA")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTool === "FRATURA"
                  ? "bg-orange-600 text-white shadow-md ring-2 ring-orange-400 ring-offset-1"
                  : "bg-orange-50 text-orange-700 hover:bg-orange-100"
              }`}
            >
              Fratura
            </button>

            {/* AUSENTE */}
            <button
              onClick={() => setActiveTool("AUSENTE")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTool === "AUSENTE"
                  ? "bg-slate-700 text-white shadow-md ring-2 ring-slate-400 ring-offset-1"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Ausente / Extraído
            </button>

            {/* IMPLANTE */}
            <button
              onClick={() => setActiveTool("IMPLANTE")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTool === "IMPLANTE"
                  ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400 ring-offset-1"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              Implante
            </button>

            {/* HIGIDO */}
            <button
              onClick={() => setActiveTool("HIGIDO")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTool === "HIGIDO"
                  ? "bg-slate-200 text-slate-800 shadow-md ring-2 ring-slate-300 ring-offset-1"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Hígido (Limpar)
            </button>
          </div>
        </div>

        {feedbackMsg && (
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-teal-800 bg-teal-50 px-3 py-2 rounded-lg border border-teal-200">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            {feedbackMsg}
          </div>
        )}
      </div>

      {/* Grade Anatômica FDI do Odontograma */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-8">
        {/* ARCADA SUPERIOR (MAXILA) */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Arcada Superior (Maxila)
            </span>
            <span className="text-xs text-slate-400">
              Vestibular (Topo) • Palatina (Base)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-8">
            {/* Quadrante 1 (Direito do Paciente) */}
            <div className="flex justify-end gap-1 sm:gap-2">
              {QUADRANT_1.map((num) => {
                const tooth = getToothData(num);
                return (
                  <ToothFaceSVG
                    key={num}
                    toothNumber={num}
                    generalStatus={tooth.status_geral}
                    procedures={tooth.procedimentos}
                    isUpperArch={true}
                    onFaceClick={handleFaceClick}
                    onToothClick={(n) => setSelectedTooth(n)}
                  />
                );
              })}
            </div>

            {/* Divisoria Central da Linha Media */}
            {/* Quadrante 2 (Esquerdo do Paciente) */}
            <div className="flex justify-start gap-1 sm:gap-2 border-l-2 border-dashed border-teal-300 pl-4 md:pl-8">
              {QUADRANT_2.map((num) => {
                const tooth = getToothData(num);
                return (
                  <ToothFaceSVG
                    key={num}
                    toothNumber={num}
                    generalStatus={tooth.status_geral}
                    procedures={tooth.procedimentos}
                    isUpperArch={true}
                    onFaceClick={handleFaceClick}
                    onToothClick={(n) => setSelectedTooth(n)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* ARCADA INFERIOR (MANDÍBULA) */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Arcada Inferior (Mandíbula)
            </span>
            <span className="text-xs text-slate-400">
              Lingual (Topo) • Vestibular (Base)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-8">
            {/* Quadrante 4 (Direito do Paciente) */}
            <div className="flex justify-end gap-1 sm:gap-2">
              {QUADRANT_4.map((num) => {
                const tooth = getToothData(num);
                return (
                  <ToothFaceSVG
                    key={num}
                    toothNumber={num}
                    generalStatus={tooth.status_geral}
                    procedures={tooth.procedimentos}
                    isUpperArch={false}
                    onFaceClick={handleFaceClick}
                    onToothClick={(n) => setSelectedTooth(n)}
                  />
                );
              })}
            </div>

            {/* Divisoria Central da Linha Media */}
            {/* Quadrante 3 (Esquerdo do Paciente) */}
            <div className="flex justify-start gap-1 sm:gap-2 border-l-2 border-dashed border-teal-300 pl-4 md:pl-8">
              {QUADRANT_3.map((num) => {
                const tooth = getToothData(num);
                return (
                  <ToothFaceSVG
                    key={num}
                    toothNumber={num}
                    generalStatus={tooth.status_geral}
                    procedures={tooth.procedimentos}
                    isUpperArch={false}
                    onFaceClick={handleFaceClick}
                    onToothClick={(n) => setSelectedTooth(n)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Legenda Médica de Cores */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-white border border-slate-300" />
            <span>Hígido</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-500" />
            <span>Cárie</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-500" />
            <span>Restauração</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500" />
            <span>Endodontia (Canal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-slate-500" />
            <span>Ausente (X)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span>Implante</span>
          </div>
        </div>
      </div>

      {/* Modal / Painel de Detalhes do Dente Selecionado */}
      {selectedTooth && activeToothData && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Prontuário do Dente #{selectedTooth}
                </h4>
                <p className="text-xs text-slate-500">
                  Status Atual:{" "}
                  <span className="font-semibold text-clinical-primary">
                    {activeToothData.status_geral}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedTooth(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Histórico de Intervenções por Face
                </h5>
                {activeToothData.procedimentos.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    Nenhum procedimento registrado neste dente até o momento.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {activeToothData.procedimentos.map((p) => (
                      <div
                        key={p.id_odonto_proc}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">
                            Face: {p.face_dente} • Estado: {p.estado_face}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {p.nome_procedimento || "Procedimento Odontológico"}
                          </span>
                        </div>
                        <div className="text-right">
                          {p.valor_aplicado && (
                            <span className="font-bold text-teal-700">
                              R$ {p.valor_aplicado.toFixed(2)}
                            </span>
                          )}
                          <span className="block text-[10px] text-slate-400">
                            {new Date(p.data_registro).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedTooth(null)}
                className="px-4 py-2 bg-clinical-primary hover:bg-clinical-primaryHover text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
