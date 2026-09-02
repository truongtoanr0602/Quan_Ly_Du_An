import { apiClient } from './apiClient'

export interface Profile {
  userID: number
  email: string
  fullName: string
  phone?: string
  avatarURL?: string
}

export interface UpdateProfileRequest {
  fullName: string
  phone?: string
  avatarURL?: string
}

export const profileService = {
  get: (): Promise<Profile> => apiClient<Profile>('/profile'),
  update: (request: UpdateProfileRequest): Promise<Profile> => apiClient<Profile>('/profile', {
    method: 'PUT',
    body: JSON.stringify(request),
  }),
}
