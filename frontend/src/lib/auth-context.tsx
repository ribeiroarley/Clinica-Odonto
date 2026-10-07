"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiClient, ApiError } from "./api-client";
import { UserSession, RoleType } from "./types";

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "odonto_auth_token";
const USER_KEY = "odonto_user_session";

// Helper para setar cookies acessiveis pelo Middleware do Next.js
function setCookie(name: string, value: string, days = 1) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Restaurar sessao do localStorage no carregamento inicial
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedToken && savedUser) {
        setUser(JSON.parse(savedUser) as UserSession);
      }
    } catch (e) {
      console.warn("Falha ao restaurar sessao:", e);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.login({ username, password });
      
      const sessionUser: UserSession = {
        user_id: response.user_id,
        name: response.name,
        email: username,
        role: response.role,
      };

      // Armazenamento no localStorage (cliente)
      localStorage.setItem(TOKEN_KEY, response.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));

      // Armazenamento em Cookie para deteccao no Middleware
      setCookie("odonto_session_token", response.access_token);
      setCookie("odonto_user_role", response.role);

      setUser(sessionUser);

      // Regra de Redirecionamento de acordo com o papel do profissional (RBAC)
      if (response.role === "RECEPCAO") {
        router.push("/agenda");
      } else {
        // DENTISTA ou ADMIN acessam a bancada clinica
        router.push("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    deleteCookie("odonto_session_token");
    deleteCookie("odonto_user_role");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }
  return context;
};
