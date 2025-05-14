import apiClient from './client';
import type { JSONAPIResponse, UserAttributes, APIError } from './types';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  userId: number;
}

export const authService = {
  async register(email: string, password: string): Promise<JSONAPIResponse<UserAttributes>> {
    try {
      const response = await apiClient.post<JSONAPIResponse<UserAttributes>>('/users', {
        email,
        password,
      });

      if (!response.data || typeof response.data !== 'object' || !('data' in response.data)) {
        throw {
          status: '500',
          title: 'ResponseError',
          detail: 'Resposta do servidor inválida.',
        } as APIError;
      }

      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data: { errors?: APIError[] } } };
      if (apiError.response?.data.errors) {
        throw apiError.response.data.errors[0];
      }
      throw {
        status: '500',
        title: 'UnexpectedError',
        detail: 'Erro ao cadastrar usuário.',
      } as APIError;
    }
  },

  async login(email: string, password: string): Promise<string> {
    try {
      const response = await apiClient.post<{
        data: {
          type: 'auth';
          attributes: { token: string };
          links?: { self: string };
        };
        errors?: APIError[];
      }>('/login', {
        email,
        password,
      });

      const token = response.data.data.attributes.token;
     
      document.cookie = `auth_token=${token}; path=/; max-age=3600; SameSite=Strict`;
      return token;
    } catch (error: unknown) {
      const apiError = error as { response?: { data: { errors?: APIError[] } } };
      if (apiError.response?.data.errors) {
        throw apiError.response.data.errors[0];
      }
      throw {
        status: '500',
        title: 'UnexpectedError',
        detail: 'Erro ao fazer login.',
      } as APIError;
    }
  },

  async getProfile(userId: string): Promise<JSONAPIResponse<UserAttributes>> {
    try {
      const response = await apiClient.get<JSONAPIResponse<UserAttributes>>(`/users/${userId}`);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data: { errors?: APIError[] } } };
      if (apiError.response?.data.errors) {
        throw apiError.response.data.errors[0];
      }
      throw {
        status: '500',
        title: 'UnexpectedError',
        detail: 'Erro ao buscar perfil.',
      } as APIError;
    }
  },

  isAuthenticated(): boolean {
    const token = this.getTokenFromCookie();
    return !!token;
  },

  logout(): void {
    document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Strict';
  },

  getUserIdFromToken(token?: string): string | null {
    try {
      const tokenToDecode = token || this.getTokenFromCookie();
      if (!tokenToDecode) return null;

      const decoded: DecodedToken = jwtDecode(tokenToDecode);
      return decoded.userId.toString();
    } catch (error) {
      return null;
    }
  },

  getTokenFromCookie(): string | null {
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth_token='));
    return cookie ? cookie.split('=')[1] : null;
  },

  clearToken(): void {
    this.logout();
  },
};