import apiClient from './client';
import type { JSONAPIResponse, UserAttributes, APIError } from './types';
import { jwtDecode } from 'jwt-decode';
import { cookies } from 'next/headers';

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
      const cookieStore = await cookies();
      cookieStore.set('auth_token', token, {
        path: '/',
        maxAge: 3600, 
        sameSite: 'strict',
        httpOnly: false, 
      });

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

  async isAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    return !!token;
  },

  async logout(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
  },

  async getUserIdFromToken(token?: string): Promise<string | null> {
    try {
      const tokenToDecode = token || (await this.getTokenFromCookie());
      if (!tokenToDecode) return null;

      const decoded: DecodedToken = jwtDecode(tokenToDecode);
      return decoded.userId.toString();
    } catch (error) {
      return null;
    }
  },

  async getTokenFromCookie(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get('auth_token')?.value || null;
  },

  async clearToken(): Promise<void> {
    await this.logout();
  },
};