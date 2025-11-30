import api from './api';
import { User, LoginFormData, RegisterFormData } from '../types';

interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export const authService = {
  async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterFormData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data.user;
  },

  async updateProfile(data: { first_name: string; last_name: string }): Promise<User> {
    const response = await api.put<{ user: User }>('/auth/profile', data);
    return response.data.user;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  async googleLogin(token: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/google', { token });
    return response.data;
  },

  async refreshToken(): Promise<{ token: string; user: User }> {
    const response = await api.post<{ token: string; user: User }>('/auth/refresh');
    return response.data;
  },
};
