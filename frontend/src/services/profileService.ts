import { apiClient } from './apiClient';
import type { ProfileDto } from '../types/admin';

export const profileService = {
  getProfile: (): Promise<ProfileDto> => apiClient<ProfileDto>('/profile'),

  updateProfile: (data: { fullName: string; phone?: string; avatarUrl?: string }): Promise<ProfileDto> =>
    apiClient<ProfileDto>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> =>
    apiClient<{ message: string }>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  forgotPassword: (email: string): Promise<{ message: string; resetToken: string }> =>
    apiClient<{ message: string; resetToken: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string): Promise<{ message: string }> =>
    apiClient<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),
};
