import apiClient from './client';
import { ResourceObject, JSONAPIResponse, LessonPlanAttributes } from './types';

export const lessonPlanService = {
  async createLessonPlan(data: {
    userId: string;
    objectives: string;
    activities: string;
    assessment: string;
    originalDocument?: File;
    generatedDocument?: File;
  }): Promise<ResourceObject<LessonPlanAttributes>> {
    const formData = new FormData();
    formData.append('userId', data.userId);
    formData.append('objectives', data.objectives);
    formData.append('activities', data.activities);
    formData.append('assessment', data.assessment);
    if (data.originalDocument) {
      formData.append('originalDocument', data.originalDocument);
    }
    if (data.generatedDocument) {
      formData.append('generatedDocument', data.generatedDocument);
    }

    const response = await apiClient.post('/lesson-plans', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async getLessonPlan(lessonPlanId: string): Promise<ResourceObject<LessonPlanAttributes>> {
    if (!lessonPlanId || typeof lessonPlanId !== 'string' || lessonPlanId.trim() === '') {
      throw new Error('ID do plano de aula inválido.');
    }

    const response = await apiClient.get(`/lesson-plans/${lessonPlanId}`);
    return response.data.data;
  },

  async getLessonPlansByUserId(userId: string): Promise<JSONAPIResponse<LessonPlanAttributes>> {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new Error('ID do usuário inválido.');
    }
    
    const response = await apiClient.get(`/lesson-plans/user/${userId}`);
    return response.data;
  },
};