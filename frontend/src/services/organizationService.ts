import api from './api';
import { User, Department, ChecklistTemplate, OrgTreeNode } from '../types';

// Organization Service
export const organizationService = {
  async getOrgTree(): Promise<OrgTreeNode[]> {
    const response = await api.get<{ tree: OrgTreeNode[] }>('/api/organization/tree');
    return response.data.tree;
  },

  async getDepartments(): Promise<Department[]> {
    const response = await api.get<{ departments: Department[] }>('/api/departments');
    return response.data.departments;
  },

  async createDepartment(data: Partial<Department>): Promise<Department> {
    const response = await api.post<{ department: Department }>('/api/departments', data);
    return response.data.department;
  },

  async updateDepartment(id: number, data: Partial<Department>): Promise<Department> {
    const response = await api.put<{ department: Department }>(`/api/departments/${id}`, data);
    return response.data.department;
  },

  async deleteDepartment(id: number): Promise<void> {
    await api.delete(`/api/departments/${id}`);
  },

  async getUsers(params?: { role?: string; department_id?: number }): Promise<User[]> {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.append('role', params.role);
    if (params?.department_id) searchParams.append('department_id', params.department_id.toString());
    
    const response = await api.get<{ users: User[] }>(`/api/users?${searchParams}`);
    return response.data.users;
  },

  async createUser(data: Partial<User> & { password: string }): Promise<User> {
    const response = await api.post<{ user: User }>('/api/users', data);
    return response.data.user;
  },

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const response = await api.put<{ user: User }>(`/api/users/${id}`, data);
    return response.data.user;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/api/users/${id}`);
  },

  // Template methods
  async getTemplates(): Promise<ChecklistTemplate[]> {
    const response = await api.get<{ templates: ChecklistTemplate[] }>('/api/templates');
    return response.data.templates;
  },

  async createTemplate(data: Partial<ChecklistTemplate>): Promise<ChecklistTemplate> {
    const response = await api.post<{ template: ChecklistTemplate }>('/api/templates', data);
    return response.data.template;
  },

  async updateTemplate(id: number, data: Partial<ChecklistTemplate>): Promise<ChecklistTemplate> {
    const response = await api.put<{ template: ChecklistTemplate }>(`/api/templates/${id}`, data);
    return response.data.template;
  },

  async deleteTemplate(id: number): Promise<void> {
    await api.delete(`/api/templates/${id}`);
  },
};

// Template Service (deprecated - use organizationService.getTemplates etc.)
export const templateService = {
  async getTemplates(): Promise<ChecklistTemplate[]> {
    return organizationService.getTemplates();
  },

  async createTemplate(data: Partial<ChecklistTemplate>): Promise<ChecklistTemplate> {
    return organizationService.createTemplate(data);
  },

  async updateTemplate(id: number, data: Partial<ChecklistTemplate>): Promise<ChecklistTemplate> {
    return organizationService.updateTemplate(id, data);
  },

  async deleteTemplate(id: number): Promise<void> {
    return organizationService.deleteTemplate(id);
  },
};
