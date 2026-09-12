import { apiClient } from './apiClient';
import type { CartDto, AddCartItemRequest, UpdateCartItemRequest } from '../types/cart';

export const cartService = {
  getCart: (): Promise<CartDto> => apiClient<CartDto>('/carts'),

  addItem: (data: AddCartItemRequest): Promise<CartDto> =>
    apiClient<CartDto>('/carts/items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateItemQuantity: (cartItemId: number, data: UpdateCartItemRequest): Promise<CartDto> =>
    apiClient<CartDto>(`/carts/items/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  removeItem: (cartItemId: number): Promise<void> =>
    apiClient<void>(`/carts/items/${cartItemId}`, { method: 'DELETE' }),

  clearCart: (): Promise<void> =>
    apiClient<void>('/carts', { method: 'DELETE' }),
};
