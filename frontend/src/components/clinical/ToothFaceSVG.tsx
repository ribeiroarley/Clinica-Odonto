"use client";

import React from "react";
import { ToothFace, FaceState, ToothGeneralStatus, ToothFaceProcedure } from "@/lib/types";

interface ToothFaceSVGProps {
  toothNumber: number;
  generalStatus: ToothGeneralStatus;
  procedures: ToothFaceProcedure[];
  isUpperArch: boolean;
  selectedFace?: ToothFace;
  onFaceClick?: (toothNumber: number, face: ToothFace) => void;
  onToothClick?: (toothNumber: number) => void;
}

export const ToothFaceSVG: React.FC<ToothFaceSVGProps> = ({
  toothNumber,
  generalStatus,
  procedures,
  isUpperArch,
  selectedFace,
  onFaceClick,
  onToothClick,
}) => {
  // Mapeamento anatomico das faces superior vs inferior
  // Na arcada superior (Maxila): topo e Vestibular (V), base e Palatina/Lingual (L/P)
  // Na arcada inferior (Mandibula): topo e Lingual (L), base e Vestibular (V)
  const topFace: ToothFace = isUpperArch ? "V" : "L";
  const bottomFace: ToothFace = isUpperArch ? "L" : "V";
  const centerFace: ToothFace = "O"; // Oclusal / Incisal

  // Determinacao de Mesial (M) e Distal (D) segundo a linha media sagital
  // Quadrante 1 (18..11) e Quadrante 4 (48..41): dentes a direita do diagrama (olhando para a arcada)
  // Onde dentes 11 e 41 estao proximos ao centro (Mesial para a esquerda do dente no diagrama).
  const isRightQuadrant =
    (toothNumber >= 11 && toothNumber <= 18) || (toothNumber >= 41 && toothNumber <= 48);
  const leftFace: ToothFace = isRightQuadrant ? "D" : "M";
  const rightFace: ToothFace = isRightQuadrant ? "M" : "D";

  // Identifica o estado mais recente aplicado a uma face
  const getFaceState = (face: ToothFace): FaceState | null => {
    const proc = procedures.find((p) => p.face_dente === face || p.face_dente === "GERAL");
    return proc ? proc.estado_face : null;
  };

  const getFaceFillColor = (face: ToothFace): string => {
    if (generalStatus === "AUSENTE") return "#cbd5e1"; // Cinza atenuado
    const state = getFaceState(face);
    switch (state) {
      case "CARIE":
        return "#ef4444"; // Vermelho clinico
      case "RESTAURADO":
        return "#3b82f6"; // Azul medico
      case "CANAL":
        return "#f59e0b"; // Ambar / Endodontia
      case "FRATURA":
        return "#f97316"; // Laranja
      case "SELADO":
        return "#06b6d4"; // Ciano
      default:
        return "#ffffff"; // Higido / Neutro
    }
  };

  const handleFaceClick = (e: React.MouseEvent, face: ToothFace) => {
    e.stopPropagation();
    if (onFaceClick) onFaceClick(toothNumber, face);
  };

  const handleKeyDown = (e: React.KeyboardEvent, face: ToothFace) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (onFaceClick) onFaceClick(toothNumber, face);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-1.5 transition-all select-none group cursor-pointer"
      onClick={() => onToothClick && onToothClick(toothNumber)}
      title={`Dente ${toothNumber} - Status: ${generalStatus}`}
    >
      {/* Numero do Dente FDI */}
      <span
        className={`text-xs font-bold mb-1 transition-colors ${
          generalStatus !== "HIGIDO" ? "text-clinical-primary" : "text-slate-600"
        }`}
      >
        {toothNumber}
      </span>

      {/* Container SVG do Dente */}
      <div className="relative w-12 h-12 md:w-14 md:h-14 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm transition-transform group-hover:scale-105"
        >
          {/* FACE TOPO */}
          <polygon
            points="15,15 85,15 68,32 32,32"
            fill={getFaceFillColor(topFace)}
            stroke="#94a3b8"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className={`cursor-pointer transition-colors hover:brightness-95 focus:outline-none ${
              selectedFace === topFace ? "stroke-teal-600 stroke-[3]" : ""
            }`}
            onClick={(e) => handleFaceClick(e, topFace)}
            onKeyDown={(e) => handleKeyDown(e, topFace)}
            tabIndex={0}
            role="button"
            aria-label={`Dente ${toothNumber}, Face ${topFace}`}
          />

          {/* FACE ESQUERDA */}
          <polygon
            points="15,15 32,32 32,68 15,85"
            fill={getFaceFillColor(leftFace)}
            stroke="#94a3b8"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className={`cursor-pointer transition-colors hover:brightness-95 focus:outline-none ${
              selectedFace === leftFace ? "stroke-teal-600 stroke-[3]" : ""
            }`}
            onClick={(e) => handleFaceClick(e, leftFace)}
            onKeyDown={(e) => handleKeyDown(e, leftFace)}
            tabIndex={0}
            role="button"
            aria-label={`Dente ${toothNumber}, Face ${leftFace}`}
          />

          {/* FACE DIREITA */}
          <polygon
            points="85,15 68,32 68,68 85,85"
            fill={getFaceFillColor(rightFace)}
            stroke="#94a3b8"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className={`cursor-pointer transition-colors hover:brightness-95 focus:outline-none ${
              selectedFace === rightFace ? "stroke-teal-600 stroke-[3]" : ""
            }`}
            onClick={(e) => handleFaceClick(e, rightFace)}
            onKeyDown={(e) => handleKeyDown(e, rightFace)}
            tabIndex={0}
            role="button"
            aria-label={`Dente ${toothNumber}, Face ${rightFace}`}
          />

          {/* FACE FUNDO */}
          <polygon
            points="32,68 68,68 85,85 15,85"
            fill={getFaceFillColor(bottomFace)}
            stroke="#94a3b8"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className={`cursor-pointer transition-colors hover:brightness-95 focus:outline-none ${
              selectedFace === bottomFace ? "stroke-teal-600 stroke-[3]" : ""
            }`}
            onClick={(e) => handleFaceClick(e, bottomFace)}
            onKeyDown={(e) => handleKeyDown(e, bottomFace)}
            tabIndex={0}
            role="button"
            aria-label={`Dente ${toothNumber}, Face ${bottomFace}`}
          />

          {/* FACE CENTRO (Oclusal / Incisal) */}
          <polygon
            points="32,32 68,32 68,68 32,68"
            fill={getFaceFillColor(centerFace)}
            stroke="#94a3b8"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className={`cursor-pointer transition-colors hover:brightness-95 focus:outline-none ${
              selectedFace === centerFace ? "stroke-teal-600 stroke-[3]" : ""
            }`}
            onClick={(e) => handleFaceClick(e, centerFace)}
            onKeyDown={(e) => handleKeyDown(e, centerFace)}
            tabIndex={0}
            role="button"
            aria-label={`Dente ${toothNumber}, Face Central ${centerFace}`}
          />

          {/* MARCADOR DE DENTE AUSENTE / EXTRAIDO (X cinza) */}
          {generalStatus === "AUSENTE" && (
            <g stroke="#475569" strokeWidth="4" strokeLinecap="round">
              <line x1="18" y1="18" x2="82" y2="82" />
              <line x1="82" y1="18" x2="18" y2="82" />
            </g>
          )}

          {/* MARCADOR DE IMPLANTE (Icone de pino/parafuso) */}
          {generalStatus === "IMPLANTE" && (
            <g stroke="#059669" strokeWidth="3" fill="none">
              <circle cx="50" cy="50" r="14" fill="#10b981" fillOpacity="0.4" />
              <line x1="50" y1="36" x2="50" y2="64" />
              <line x1="42" y1="44" x2="58" y2="44" />
              <line x1="44" y1="52" x2="56" y2="52" />
              <line x1="46" y1="60" x2="54" y2="60" />
            </g>
          )}

          {/* MARCADOR DE TRATAMENTO DE CANAL / ENDODONTIA */}
          {generalStatus === "ENDODONTIA" && (
            <g stroke="#d97706" strokeWidth="3.5" strokeLinecap="round">
              <line x1="50" y1="15" x2="50" y2="85" strokeDasharray="3 2" />
            </g>
          )}
        </svg>
      </div>

      {/* Indicador de Status Geral */}
      <span
        className={`text-[9px] font-medium mt-1 uppercase px-1.5 py-0.5 rounded ${
          generalStatus === "HIGIDO"
            ? "text-slate-400 bg-slate-50"
            : generalStatus === "AUSENTE"
            ? "text-slate-600 bg-slate-200"
            : generalStatus === "IMPLANTE"
            ? "text-emerald-700 bg-emerald-100"
            : generalStatus === "ENDODONTIA"
            ? "text-amber-700 bg-amber-100"
            : "text-blue-700 bg-blue-100"
        }`}
      >
        {generalStatus === "HIGIDO" ? "Sadio" : generalStatus}
      </span>
    </div>
  );
};
