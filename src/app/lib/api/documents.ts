import apiClient from './client';
import type { JSONAPIResponse, DocumentAttributes, JSONAPIPaginatedResponse } from './types';

export const documentService = {
  async uploadFile(formData: FormData): Promise<JSONAPIResponse<DocumentAttributes>> {
    const response = await apiClient.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getDocument(id: string): Promise<JSONAPIResponse<DocumentAttributes>> {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data;
  },

  async getUserDocuments(userId: string): Promise<JSONAPIPaginatedResponse<DocumentAttributes>> {
    const response = await apiClient.get(`/documents/user/${userId}`);
    return response.data;
  },

  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`);
  },
};