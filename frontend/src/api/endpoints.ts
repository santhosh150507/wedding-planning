import { apiClient } from './client';
import { Enquiry, EnquiryNote, Consultation, DashboardOverview, User } from '../types';

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await apiClient.post<{ access_token: string; user: User }>('/auth/login', credentials);
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
  getPlanners: async () => {
    const response = await apiClient.get<User[]>('/auth/planners');
    return response.data;
  },
};

export const enquiryApi = {
  submitPublic: async (data: any) => {
    const response = await apiClient.post<{ enquiry_number: string; message: string; submitted_at: string }>(
      '/enquiries/public',
      data
    );
    return response.data;
  },
  list: async (params?: {
    search?: string;
    status?: string;
    destination?: string;
    assigned_planner_id?: string;
    only_inactive?: boolean;
    page?: number;
    page_size?: number;
  }) => {
    const response = await apiClient.get<Enquiry[]>('/enquiries', { params });
    return response.data;
  },
  get: async (id: string) => {
    const response = await apiClient.get<Enquiry>(`/enquiries/${id}`);
    return response.data;
  },
  createInternal: async (data: any) => {
    const response = await apiClient.post<Enquiry>('/enquiries', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Enquiry>) => {
    const response = await apiClient.patch<Enquiry>(`/enquiries/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/enquiries/${id}`);
    return response.data;
  },
  addNote: async (id: string, content: string) => {
    const response = await apiClient.post<EnquiryNote>(`/enquiries/${id}/notes`, { content });
    return response.data;
  },
  getNotes: async (id: string) => {
    const response = await apiClient.get<EnquiryNote[]>(`/enquiries/${id}/notes`);
    return response.data;
  },
  scheduleConsultation: async (id: string, data: { scheduled_at: string; meeting_type: string; notes?: string }) => {
    const response = await apiClient.post<Consultation>(`/enquiries/${id}/consultations`, data);
    return response.data;
  },
  getConsultations: async (id: string) => {
    const response = await apiClient.get<Consultation[]>(`/enquiries/${id}/consultations`);
    return response.data;
  },
};

export const dashboardApi = {
  getOverview: async () => {
    const response = await apiClient.get<DashboardOverview>('/dashboard/overview');
    return response.data;
  },
};
