import {
  PatientListResponse,
  PatientOdontogram,
  OdontogramProcedureCreatePayload,
  OdontogramProcedureResponse,
  LoginPayload,
  LoginResponse,
  UserSession,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  // Token demo/fallback para ambiente de desenvolvimento local se nao definido no localStorage
  const token =
    typeof window !== "undefined" ? localStorage.getItem("odonto_auth_token") : null;
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: options.credentials || "include", // Suporte a cookies seguros HttpOnly e SameSite=Lax
    });

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      const message =
        (errorData as { message?: string })?.message ||
        `Erro HTTP ${response.status}: ${response.statusText}`;
      throw new ApiError(response.status, message, errorData);
    }

    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, `Falha de conexao com a API: ${(err as Error).message}`);
  }
}

export const apiClient = {
  /**
   * Lista pacientes com paginacao e busca
   */
  async getPatients(page = 1, pageSize = 10, query?: string): Promise<PatientListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (query) params.append("q", query);
    return request<PatientListResponse>(`/patients?${params.toString()}`);
  },

  /**
   * Consulta a ficha odontologica completa do paciente (todos os dentes e procedimentos)
   */
  async getPatientOdontogram(patientId: number): Promise<PatientOdontogram> {
    return request<PatientOdontogram>(`/odontogram/patient/${patientId}`);
  },

  /**
   * Autentica o usuario no backend FastAPI e recebe o token JWT
   */
  async login(payload: LoginPayload): Promise<LoginResponse> {
    return request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Consulta os dados do usuario autenticado
   */
  async getMe(): Promise<UserSession> {
    return request<UserSession>("/auth/me");
  },

  /**
   * Registra procedimento ou patologia em uma face/dente do odontograma
   */
  async saveToothProcedure(
    payload: OdontogramProcedureCreatePayload
  ): Promise<OdontogramProcedureResponse> {
    return request<OdontogramProcedureResponse>("/odontogram/procedure", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
