export type ToothFace = "V" | "L" | "P" | "M" | "D" | "O" | "I" | "GERAL";

export type FaceState = "CARIE" | "RESTAURADO" | "FRATURA" | "SELADO" | "CANAL";

export type ToothGeneralStatus =
  | "HIGIDO"
  | "AUSENTE"
  | "IMPLANTE"
  | "PROTESE"
  | "ENDODONTIA"
  | "EM_TRATAMENTO";

export type RoleType = "ADMIN" | "DENTISTA" | "RECEPCAO";

export interface UserSession {
  user_id: number;
  name: string;
  email: string;
  role: RoleType;
  cro?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_id: number;
  name: string;
  role: RoleType;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface Patient {
  id_paciente: number;
  nome: string;
  cpf: string;
  data_nascimento: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  data_cadastro: string;
  status: string;
  idade?: number;
}

export interface PatientListResponse {
  total: number;
  page: number;
  page_size: number;
  items: Patient[];
}

export interface ToothFaceProcedure {
  id_odonto_proc: number;
  id_prontuario?: number;
  id_procedimento: number;
  nome_procedimento?: string;
  face_dente?: ToothFace;
  estado_face: FaceState;
  valor_aplicado?: number;
  data_registro: string;
}

export interface ToothState {
  id_odontograma: number;
  id_paciente: number;
  numero_dente: number;
  status_geral: ToothGeneralStatus;
  observacoes?: string;
  data_atualizacao: string;
  procedimentos: ToothFaceProcedure[];
}

export interface PatientOdontogram {
  id_paciente: number;
  nome_paciente: string;
  total_dentes_registrados: number;
  dentes: ToothState[];
}

export interface OdontogramProcedureCreatePayload {
  id_paciente: number;
  numero_dente: number;
  id_procedimento: number;
  id_prontuario?: number;
  face_dente?: ToothFace;
  estado_face: FaceState;
  valor_aplicado?: number;
  status_geral_novo?: ToothGeneralStatus;
  observacoes?: string;
}

export interface OdontogramProcedureResponse {
  id_odonto_proc: number;
  id_odontograma: number;
  id_paciente: number;
  numero_dente: number;
  face_dente?: string;
  estado_face: string;
  valor_aplicado?: number;
  data_registro: string;
  mensagem: string;
}

export interface ToothProcedureSuggestion {
  numero_dente: number;
  face_dente: ToothFace;
  estado_face: FaceState;
  id_procedimento: number;
  nome_procedimento: string;
  evidencia_texto: string;
  valor_estimado?: number;
}

export interface AICopilotRequest {
  id_paciente: number;
  relato_clinico: string;
  historico_anamnese?: string;
}

export interface AICopilotResponse {
  id_auditoria_ia: number;
  sugestoes: ToothProcedureSuggestion[];
  alertas_anamnese: string[];
  confianca_geral: number;
  nome_modelo: string;
  versao_modelo: string;
  disclaimer: string;
}

export interface AuditDecisionPayload {
  id_auditoria_ia: number;
  id_paciente: number;
  status_decisao_humana: "ACEITO" | "MODIFICADO" | "REJEITADO";
  justificativa_rejeicao?: string;
  procedimentos_confirmados?: ToothProcedureSuggestion[];
}

export interface AuditDecisionResponse {
  sucesso: boolean;
  mensagem: string;
  id_auditoria_ia: number;
  status_registrado: string;
}

