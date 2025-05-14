'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { authService } from '@/app/lib/api/authService.client';
import { APIError } from '@/app/lib/api/types';
import { useRouter } from 'next/navigation';

interface AuthState {
  user: { id: string; email: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window === 'undefined') return;

      try {
        const storedToken = authService.getTokenFromCookie();
        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        setToken(storedToken);
        const userId = authService.getUserIdFromToken(storedToken);
        if (!userId) throw new Error('Token inválido');

        const response = await authService.getProfile(userId);
        const userData = Array.isArray(response.data) ? response.data[0] : response.data;

        if ('attributes' in userData && userData.attributes) {
          setUser({
            id: userId,
            email: userData.attributes.email,
          });
          if (window.location.pathname !== '/dashboard') {
            window.location.href = '/dashboard';
          }
        } else {
          throw new Error('Resposta do perfil inválida: atributos ausentes');
        }
      } catch (err) {
        const apiError = err as APIError;
        setError(apiError.detail || 'Erro ao carregar perfil');
        authService.clearToken();
        setToken(null);
        
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      authService.clearToken();
      setToken(null);
      setUser(null);

      const newToken = await authService.login(email, password);
      setToken(newToken);
      const userId = authService.getUserIdFromToken(newToken);
      if (!userId) throw new Error('Token inválido');

      const response = await authService.getProfile(userId);
      const userData = Array.isArray(response.data) ? response.data[0] : response.data;

      if ('attributes' in userData && userData.attributes) {
        setUser({
          id: userId,
          email: userData.attributes.email,
        });
        setError(null);
        window.location.href = '/dashboard';
      } else {
        throw new Error('Resposta do perfil inválida: atributos ausentes');
      }
    } catch (err) {
      const apiError = err as APIError;
      authService.clearToken();
      setToken(null);
      setUser(null);
      throw new Error(apiError.detail || 'Erro ao fazer login');
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await authService.register(email, password);
      setError(null);
    
    } catch (err) {
      const apiError = err as APIError;
      throw new Error(apiError.detail || 'Erro ao criar conta');
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setError(null);
    window.location.href = '/';
  };

  const refreshProfile = async () => {
    if (!user?.id) return;

    try {
      const response = await authService.getProfile(user.id);
      const userData = Array.isArray(response.data) ? response.data[0] : response.data;

      if ('attributes' in userData && userData.attributes) {
        setUser({
          id: user.id,
          email: userData.attributes.email,
        });
        setError(null);
      } else {
        throw new Error('Resposta do perfil inválida: atributos ausentes');
      }
    } catch (err) {
      const apiError = err as APIError;
      setError(apiError.detail || 'Erro ao atualizar perfil');
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!user && !!token,
      isLoading,
      error,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, token, isLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('Erro no AuthProvider');
  }
  return context;
}