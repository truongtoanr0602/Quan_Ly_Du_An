import { apiClient } from './apiClient'
import type { Cart } from '../types/cart'

export const cartService = {
  get: (): Promise<Cart> => apiClient<Cart>('/cart'),
  add: (productID: number, quantity: number): Promise<Cart> => apiClient<Cart>('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productID, quantity }),
  }),
  update: (productID: number, quantity: number): Promise<Cart> => apiClient<Cart>(`/cart/items/${productID}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  }),
  remove: (productID: number): Promise<void> => apiClient<void>(`/cart/items/${productID}`, {
    method: 'DELETE',
  }),
  clear: (): Promise<void> => apiClient<void>('/cart', { method: 'DELETE' }),
}
