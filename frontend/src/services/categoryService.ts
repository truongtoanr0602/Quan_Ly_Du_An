import { apiClient } from './apiClient';
import type { CategoryDto, CategoryCreateDto, CategoryUpdateDto } from '../types/category';

export const categoryService = {
  getAll: () => apiClient<CategoryDto[]>('/Categories'),
  
  getById: (id: number) => apiClient<CategoryDto>(`/Categories/${id}`),
  
  create: (data: CategoryCreateDto) => 
    apiClient<CategoryDto>('/Categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  update: (id: number, data: CategoryUpdateDto) =>
    apiClient<CategoryDto>(`/Categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  delete: (id: number) =>
    apiClient<void>(`/Categories/${id}`, {
      method: 'DELETE',
    }),
};
