"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import {
  Stethoscope,
  Lock,
  Mail,
  AlertCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados de erro visual
  const [clientErrors, setClientErrors] = useState<{ username?: string; password?: string }>({});
  const [apiError, setApiError] = useState<{ message: string; type: "auth" | "rate_limit" | "generic" } | null>(null);

  const validate = (): boolean => {
    const errors: { username?: string; password?: string } = {};

    // Validacao basica de formato
    if (!username.trim()) {
      errors.username = "Informe seu email ou CRO.";
    } else if (username.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username.trim())) {
      errors.username = "Formato de email invalido.";
    }

    if (!password) {
      errors.password = "A senha e obrigatoria.";
    } else if (password.length < 6) {
      errors.password = "A senha deve conter no minimo 6 caracteres.";
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setApiError({
            message: "Credenciais invalidas ou profissional inativo. Verifique email/CRO e senha.",
            type: "auth",
          });
        } else if (err.status === 429) {
          setApiError({
            message: "Muitas tentativas detectadas. Por seguranca, aguarde 1 minuto para tentar novamente.",
            type: "rate_limit",
          });
        } else {
          setApiError({
            message: err.message || "Falha ao processar autenticacao.",
            type: "generic",
          });
        }
      } else {
        setApiError({
          message: "Nao foi possivel conectar ao servidor. Verifique sua conexao.",
          type: "generic",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Container Centralizado com Ergonomia Clinica */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-700 text-white shadow-md mb-3">
          <Stethoscope className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          OdontoSys Pro
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Acesso Seguro ao Prontuario Eletronico & Odontograma FDI
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xs border border-slate-200 rounded-2xl sm:px-10">
          {/* Alertas de Erro da API */}
          {apiError && (
            <div
              className={`mb-6 p-4 rounded-xl border text-xs flex items-start gap-3 transition-all ${
                apiError.type === "rate_limit"
                  ? "bg-amber-50 border-amber-200 text-amber-900"
                  : "bg-red-50 border-red-200 text-red-900"
              }`}
              role="alert"
            >
              {apiError.type === "rate_limit" ? (
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold block">
                  {apiError.type === "rate_limit" ? "Limite de Tentativas Atingido" : "Falha de Autenticacao"}
                </span>
                <span className="mt-0.5 block leading-relaxed">{apiError.message}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Campo Identificador (Email ou CRO) */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Email Profissional ou CRO
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  disabled={loading}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (clientErrors.username) setClientErrors({ ...clientErrors, username: undefined });
                  }}
                  placeholder="ex: ana.silva@clinica.com ou CRO-SP-12345"
                  className={`block w-full pl-10 pr-3 py-2.5 sm:text-xs rounded-xl border focus:outline-none transition-colors ${
                    clientErrors.username
                      ? "border-red-400 focus:ring-2 focus:ring-red-200 text-red-900"
                      : "border-slate-200 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 text-slate-900"
                  }`}
                />
              </div>
              {clientErrors.username && (
                <p className="mt-1.5 text-[11px] text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {clientErrors.username}
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Senha de Acesso
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (clientErrors.password) setClientErrors({ ...clientErrors, password: undefined });
                  }}
                  placeholder="Minimo de 6 caracteres"
                  className={`block w-full pl-10 pr-10 py-2.5 sm:text-xs rounded-xl border focus:outline-none transition-colors ${
                    clientErrors.password
                      ? "border-red-400 focus:ring-2 focus:ring-red-200 text-red-900"
                      : "border-slate-200 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 text-slate-900"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {clientErrors.password && (
                <p className="mt-1.5 text-[11px] text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {clientErrors.password}
                </p>
              )}
            </div>

            {/* Botao de Submissao com Alvo de Clique Minimo de 44px */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Dica para Desenvolvimento e Demonstracao */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 block mb-1">
              Ambiente Seguro com Criptografia Argon2id e Rate Limiting Ativo
            </span>
            <div className="inline-flex items-center gap-1.5 text-[10px] text-teal-700 font-semibold bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Acesso restrito a profissionais cadastrados no CFO/CRO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
