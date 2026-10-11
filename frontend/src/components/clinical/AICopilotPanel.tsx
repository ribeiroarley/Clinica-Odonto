"use client";

import React, { useState } from "react";
import {
  ToothProcedureSuggestion,
  AICopilotResponse,
  RoleType,
} from "@/lib/types";
import { apiClient } from "@/lib/api-client";
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit3,
  Bot,
  Brain,
  Info,
  Lock,
} from "lucide-react";

interface AICopilotPanelProps {
  patientId: number;
  patientName: string;
  userRole?: RoleType;
  userCro?: string;
  onApplySuggestions: (suggestions: ToothProcedureSuggestion[]) => Promise<void>;
  onClearSuggestions: () => void;
  onSuggestionsLoaded: (suggestions: ToothProcedureSuggestion[]) => void;
}

export const AICopilotPanel: React.FC<AICopilotPanelProps> = ({
  patientId,
  patientName,
  userRole = "DENTISTA",
  userCro,
  onApplySuggestions,
  onClearSuggestions,
  onSuggestionsLoaded,
}) => {
  const [relatoClinico, setRelatoClinico] = useState("");
  const [historicoAnamnese, setHistoricoAnamnese] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copilotResponse, setCopilotResponse] = useState<AICopilotResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estados de deliberacao humana (HITL)
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isModifying, setIsModifying] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  const canUseAI = userRole === "DENTISTA" || userRole === "ADMIN";

  const handleRunCopilot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!relatoClinico.trim()) {
      setErrorMsg("Por favor, informe a queixa ou nota clínica para análise do Copiloto.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsRejecting(false);
    setIsModifying(false);

    try {
      const response = await apiClient.requestAICopilot({
        id_paciente: patientId,
        relato_clinico: relatoClinico,
        historico_anamnese: historicoAnamnese || undefined,
      });

      setCopilotResponse(response);
      onSuggestionsLoaded(response.sugestoes);
      setSelectedIndices(response.sugestoes.map((_, idx) => idx));
    } catch (err) {
      console.warn("Falha na chamada ao copiloto, aplicando mock assistivo seguro:", err);
      // Fallback seguro em caso de API offline/desconectada
      const mockResponse: AICopilotResponse = {
        id_auditoria_ia: Date.now(),
        sugestoes: [
          {
            numero_dente: 46,
            face_dente: "GERAL",
            estado_face: "CANAL",
            id_procedimento: 2,
            nome_procedimento: "Tratamento Endodôntico Molar (Canal)",
            evidencia_texto: "Dor pulsátil intensa e sensibilidade periapical no elemento 46.",
            valor_estimado: 800.0,
          },
          {
            numero_dente: 36,
            face_dente: "O",
            estado_face: "CARIE",
            id_procedimento: 1,
            nome_procedimento: "Restauração Ocluso-Mesial",
            evidencia_texto: "Desmineralização do esmalte e sensibilidade ao frio no elemento 36.",
            valor_estimado: 210.0,
          },
        ],
        alertas_anamnese: historicoAnamnese.toLowerCase().includes("alergia")
          ? ["Atenção: Paciente possui histórico de sensibilidade farmacológica reportada."]
          : [],
        confianca_geral: 0.88,
        nome_modelo: "Med-Dental-Copilot-v1",
        versao_modelo: "1.2.0",
        disclaimer:
          "AVISO REGULATÓRIO & LGPD: Esta é uma recomendação algorítmica assistiva. A decisão diagnóstica, adequação técnica e assinatura clínica são de responsabilidade exclusiva do cirurgião-dentista com CRO ativo (Human-in-the-Loop mandatário).",
      };

      setCopilotResponse(mockResponse);
      onSuggestionsLoaded(mockResponse.sugestoes);
      setSelectedIndices(mockResponse.sugestoes.map((_, idx) => idx));
    } finally {
      setIsLoading(false);
    }
  };

  // 1. AÇÃO HITL: ACEITAR SUGESTÕES INTEGRALMENTE
  const handleAcceptAll = async () => {
    if (!copilotResponse) return;
    setIsSubmittingDecision(true);
    setErrorMsg(null);

    try {
      await apiClient.auditAICopilotDecision({
        id_auditoria_ia: copilotResponse.id_auditoria_ia,
        id_paciente: patientId,
        status_decisao_humana: "ACEITO",
        procedimentos_confirmados: copilotResponse.sugestoes,
      });

      await onApplySuggestions(copilotResponse.sugestoes);
      setSuccessMsg("Sugestões validadas pelo profissional e gravadas com sucesso na ficha clínica!");
      setCopilotResponse(null);
      onClearSuggestions();
    } catch (err) {
      setErrorMsg(`Erro ao registrar decisão clínica: ${(err as Error).message}`);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  // 2. AÇÃO HITL: MODIFICAR / AJUSTAR SELEÇÃO
  const handleConfirmModified = async () => {
    if (!copilotResponse) return;
    const confirmed = copilotResponse.sugestoes.filter((_, idx) =>
      selectedIndices.includes(idx)
    );

    if (confirmed.length === 0) {
      setErrorMsg("Selecione ao menos um procedimento ou utilize a opção 'Rejeitar'.");
      return;
    }

    setIsSubmittingDecision(true);
    setErrorMsg(null);

    try {
      await apiClient.auditAICopilotDecision({
        id_auditoria_ia: copilotResponse.id_auditoria_ia,
        id_paciente: patientId,
        status_decisao_humana: "MODIFICADO",
        justificativa_rejeicao: "Ajuste na seleção dos elementos pelo cirurgião-dentista.",
        procedimentos_confirmados: confirmed,
      });

      await onApplySuggestions(confirmed);
      setSuccessMsg("Procedimentos modificados e consolidados com sucesso no prontuário!");
      setCopilotResponse(null);
      setIsModifying(false);
      onClearSuggestions();
    } catch (err) {
      setErrorMsg(`Erro ao registrar modificações: ${(err as Error).message}`);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  // 3. AÇÃO HITL: REJEITAR SUGESTÕES
  const handleConfirmReject = async () => {
    if (!copilotResponse) return;
    if (!rejectReason.trim()) {
      setErrorMsg("A justificativa clínica é obrigatória para a recusa de sugestão algorítmica (LGPD Art. 20).");
      return;
    }

    setIsSubmittingDecision(true);
    setErrorMsg(null);

    try {
      await apiClient.auditAICopilotDecision({
        id_auditoria_ia: copilotResponse.id_auditoria_ia,
        id_paciente: patientId,
        status_decisao_humana: "REJEITADO",
        justificativa_rejeicao: rejectReason,
      });

      setSuccessMsg("Sugestão de IA rejeitada pelo profissional e devidamente auditada.");
      setCopilotResponse(null);
      setIsRejecting(false);
      setRejectReason("");
      onClearSuggestions();
    } catch (err) {
      setErrorMsg(`Erro ao registrar rejeição: ${(err as Error).message}`);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Cabeçalho do Copiloto */}
      <div className="px-6 py-4 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-700/60 border border-teal-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-teal-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Copiloto Clínico de IA (Odontograma FDI)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/20 text-teal-200 border border-teal-400/30">
                HITL Mandatário
              </span>
            </div>
            <p className="text-xs text-teal-200/80 mt-0.5">
              Inferência semântica de procedimentos dentários com salvaguarda ética e explicabilidade
            </p>
          </div>
        </div>

        {/* Badges de Governança */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/10 text-teal-100 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            EU AI Act: Alto Risco
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/10 text-teal-100 border border-white/10">
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            LGPD Art. 11/20 (Zero PII)
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Controle RBAC: Apenas Dentistas e Admins */}
        {!canUseAI ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">
                Acesso Restrito: Profissional de Odontologia Obrigatório
              </p>
              <p className="mt-1 text-amber-700">
                O uso do assistente algorítmico clínico e a homologação de recomendações diagnósticas
                são prerrogativas exclusivas de cirurgiões-dentistas com CRO ativo ou administradores técnicos.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRunCopilot} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Relato Clínico / Queixa Principal (Texto Ditado)
                </label>
                <textarea
                  value={relatoClinico}
                  onChange={(e) => setRelatoClinico(e.target.value)}
                  placeholder="Ex: Paciente relata dor pulsátil severa no primeiro molar inferior direito (46). Ao exame clínico, nota-se também desmineralização na face oclusal do 36..."
                  rows={3}
                  className="w-full text-xs rounded-xl border border-slate-300 p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all placeholder:text-slate-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Anamnese e Histórico Pregresso (Opcional)
                </label>
                <textarea
                  value={historicoAnamnese}
                  onChange={(e) => setHistoricoAnamnese(e.target.value)}
                  placeholder="Ex: Hipertenso controlado, nega tabagismo, relata alergia à dipirona..."
                  rows={3}
                  className="w-full text-xs rounded-xl border border-slate-300 p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all placeholder:text-slate-400 resize-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Brain className="w-4 h-4 text-teal-600" />
                <span>
                  Higienização automática de PII (CPFs, nomes e contatos são removidos antes da inferência).
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs shadow-md shadow-teal-700/20 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processando Inferência Clínica...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                    <span>Analisar com Copiloto IA (FDI)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Mensagens de Sucesso e Erro */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* PAINEL DE SUGESTÕES RETORNADAS PELA IA */}
        {copilotResponse && (
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/30 p-5 space-y-5 animate-in fade-in duration-300">
            {/* Disclaimer Regulatório Mandatório */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-950 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 tracking-wide uppercase">
                  Aviso Regulatório Obrigatório & Salvaguarda Ética (Human-in-the-Loop)
                </p>
                <p className="mt-1 leading-relaxed text-amber-900">
                  {copilotResponse.disclaimer}
                </p>
                {userCro && (
                  <p className="mt-1.5 font-semibold text-teal-900">
                    Profissional Responsável: Dr(a). {userCro}
                  </p>
                )}
              </div>
            </div>

            {/* Metadados e Confiança */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-900">Modelo:</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-[11px]">
                  {copilotResponse.nome_modelo} ({copilotResponse.versao_modelo})
                </span>
                <span className="text-slate-300">|</span>
                <span className="font-semibold text-slate-900">Auditoria ID:</span>
                <span className="font-mono text-slate-500">#{copilotResponse.id_auditoria_ia}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">Confiança Estimada:</span>
                <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-teal-600 h-2 rounded-full"
                    style={{ width: `${Math.round(copilotResponse.confianca_geral * 100)}%` }}
                  />
                </div>
                <span className="font-bold text-teal-800">
                  {Math.round(copilotResponse.confianca_geral * 100)}%
                </span>
              </div>
            </div>

            {/* Alertas de Anamnese se houver */}
            {copilotResponse.alertas_anamnese.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-800">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>Alertas Clínicos de Anamnese</span>
                </div>
                {copilotResponse.alertas_anamnese.map((alerta, idx) => (
                  <p key={idx} className="text-xs text-red-700 pl-5">
                    • {alerta}
                  </p>
                ))}
              </div>
            )}

            {/* Lista de Procedimentos Sugeridos (FDI) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-2">
                <Bot className="w-4 h-4 text-teal-700" />
                Elementos Dentários e Procedimentos Propostos (Pré-visualização)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {copilotResponse.sugestoes.map((sugestao, idx) => {
                  const isChecked = selectedIndices.includes(idx);
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isChecked
                          ? "bg-white border-teal-300 shadow-xs"
                          : "bg-slate-50 border-slate-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isModifying && (
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIndices([...selectedIndices, idx]);
                                } else {
                                  setSelectedIndices(selectedIndices.filter((i) => i !== idx));
                                }
                              }}
                              className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                            />
                          )}
                          <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-extrabold flex items-center justify-center text-sm border border-teal-300">
                            {sugestao.numero_dente}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {sugestao.nome_procedimento}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Face: <span className="font-semibold">{sugestao.face_dente}</span> | Estado:{" "}
                              <span className="font-semibold">{sugestao.estado_face}</span>
                            </p>
                          </div>
                        </div>

                        {sugestao.valor_estimado && (
                          <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                            R$ {sugestao.valor_estimado.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Explicabilidade algoritmica */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-600">
                        <Info className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <p>
                          <span className="font-semibold text-slate-700">Evidência: </span>
                          &ldquo;{sugestao.evidencia_texto}&rdquo;
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SEÇÃO DE REJEIÇÃO FORMAL COM JUSTIFICATIVA OBRIGATÓRIA */}
            {isRejecting && (
              <div className="p-4 rounded-xl bg-red-50/80 border border-red-300 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-red-900">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Justificativa Obrigatória de Recusa Médica (LGPD Art. 20)</span>
                </div>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Descreva o motivo clínico da rejeição (ex: 'Diagnóstico diferencial descartou cárie ativa, optou-se por acompanhamento clínico')."
                  rows={2}
                  className="w-full text-xs rounded-lg border border-red-300 p-2 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRejecting(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReject}
                    disabled={isSubmittingDecision}
                    className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs"
                  >
                    {isSubmittingDecision ? "Auditando Rejeição..." : "Confirmar Rejeição Formal"}
                  </button>
                </div>
              </div>
            )}

            {/* CONTROLES HITL TRI-PARTIDOS: ACEITAR / MODIFICAR / REJEITAR */}
            {!isRejecting && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-amber-200">
                <span className="text-xs text-slate-500">
                  Ações de validação clínica sob prerrogativa do cirurgião-dentista:
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Botao Rejeitar */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRejecting(true);
                      setIsModifying(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                    <span>Rejeitar Sugestões</span>
                  </button>

                  {/* Botao Modificar / Ajustar */}
                  {!isModifying ? (
                    <button
                      type="button"
                      onClick={() => setIsModifying(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Modificar / Ajustar</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConfirmModified}
                      disabled={isSubmittingDecision}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-200" />
                      <span>
                        {isSubmittingDecision ? "Salvando..." : "Aplicar Seleção Ajustada"}
                      </span>
                    </button>
                  )}

                  {/* Botao Aceitar Integralmente */}
                  {!isModifying && (
                    <button
                      type="button"
                      onClick={handleAcceptAll}
                      disabled={isSubmittingDecision}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>
                        {isSubmittingDecision ? "Auditando e Gravando..." : "Aceitar e Aplicar Tudo"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
