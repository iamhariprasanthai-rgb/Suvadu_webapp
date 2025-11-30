import api from './api';
import {
  SeparationCase,
  ChecklistItem,
  SignOff,
  HandoverSchedule,
  CreateSeparationFormData,
  CreateHandoverFormData,
  AssignSignoffFormData,
  DashboardStats,
} from '../types';

interface SeparationListResponse {
  cases: SeparationCase[];
  total: number;
  pages: number;
  current_page: number;
}

interface ChecklistResponse {
  items: ChecklistItem[];
  progress: number;
}

interface SignoffsResponse {
  signoffs: SignOff[];
  progress: number;
}

interface HandoverResponse {
  schedules: HandoverSchedule[];
}

export const separationService = {
  // Separation Cases
  async getSeparations(page = 1, perPage = 10, status?: string): Promise<SeparationListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    if (status) params.append('status', status);
    
    const response = await api.get<SeparationListResponse>(`/api/separations?${params}`);
    return response.data;
  },

  async getSeparation(id: number): Promise<SeparationCase> {
    const response = await api.get<{ case: SeparationCase }>(`/api/separations/${id}`);
    return response.data.case;
  },

  async createSeparation(data: CreateSeparationFormData): Promise<SeparationCase> {
    const response = await api.post<{ case: SeparationCase; message: string }>('/api/separations', data);
    return response.data.case;
  },

  async updateSeparation(id: number, data: Partial<SeparationCase>): Promise<SeparationCase> {
    const response = await api.put<{ case: SeparationCase }>(`/api/separations/${id}`, data);
    return response.data.case;
  },

  // Checklist
  async getChecklist(caseId: number): Promise<ChecklistResponse> {
    const response = await api.get<ChecklistResponse>(`/api/separations/${caseId}/checklist`);
    return response.data;
  },

  async updateChecklistItem(
    caseId: number,
    itemId: number,
    data: Partial<ChecklistItem>
  ): Promise<{ item: ChecklistItem; progress: number }> {
    const response = await api.put<{ item: ChecklistItem; progress: number; message: string }>(
      `/api/separations/${caseId}/checklist/${itemId}`,
      data
    );
    return response.data;
  },

  async submitChecklist(caseId: number): Promise<SeparationCase> {
    const response = await api.post<{ case: SeparationCase; message: string }>(
      `/api/separations/${caseId}/checklist/submit`
    );
    return response.data.case;
  },

  // Sign-offs
  async getSignoffs(caseId: number): Promise<SignoffsResponse> {
    const response = await api.get<SignoffsResponse>(`/api/separations/${caseId}/signoffs`);
    return response.data;
  },

  async assignSignoffManager(caseId: number, data: AssignSignoffFormData): Promise<SignOff> {
    const response = await api.post<{ signoff: SignOff; message: string }>(
      `/api/separations/${caseId}/assign-signoff-manager`,
      data
    );
    return response.data.signoff;
  },

  async processSignoff(
    caseId: number,
    signoffId: number,
    status: 'approved' | 'rejected',
    comments?: string
  ): Promise<{ signoff: SignOff; case_status: string }> {
    const response = await api.put<{ signoff: SignOff; case_status: string; message: string }>(
      `/api/separations/${caseId}/signoffs/${signoffId}`,
      { status, comments }
    );
    return response.data;
  },

  async getPendingSignoffs(): Promise<{ signoffs: SignOff[]; count: number }> {
    const response = await api.get<{ signoffs: SignOff[]; count: number }>('/api/signoffs/pending');
    return response.data;
  },

  // Handover Schedules
  async getHandoverSchedules(caseId: number): Promise<HandoverSchedule[]> {
    const response = await api.get<HandoverResponse>(`/api/separations/${caseId}/handover`);
    return response.data.schedules;
  },

  async createHandoverSchedule(caseId: number, data: CreateHandoverFormData): Promise<HandoverSchedule> {
    const response = await api.post<{ schedule: HandoverSchedule; message: string }>(
      `/api/separations/${caseId}/handover`,
      data
    );
    return response.data.schedule;
  },

  async updateHandoverSchedule(
    caseId: number,
    scheduleId: number,
    data: Partial<HandoverSchedule>
  ): Promise<HandoverSchedule> {
    const response = await api.put<{ schedule: HandoverSchedule }>(
      `/api/separations/${caseId}/handover/${scheduleId}`,
      data
    );
    return response.data.schedule;
  },

  async deleteHandoverSchedule(caseId: number, scheduleId: number): Promise<void> {
    await api.delete(`/api/separations/${caseId}/handover/${scheduleId}`);
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/api/reports/dashboard');
    return response.data;
  },
};
