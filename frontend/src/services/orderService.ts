import { apiClient } from './apiClient';
import type { OrderDto, CreateOrderRequest, PagedOrderResult } from '../types/order';

export const orderService = {
  createOrder: (data: CreateOrderRequest): Promise<OrderDto> =>
    apiClient<OrderDto>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyOrders: (): Promise<OrderDto[]> => apiClient<OrderDto[]>('/orders'),

  getOrderById: (id: number): Promise<OrderDto> => apiClient<OrderDto>(`/orders/${id}`),

  cancelOrder: (id: number): Promise<OrderDto> =>
    apiClient<OrderDto>(`/orders/${id}/cancel`, { method: 'PUT' }),

  // Admin endpoints
  getAllOrders: (pageNumber = 1, pageSize = 10, status?: string): Promise<PagedOrderResult> => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    if (status) params.append('status', status);
    return apiClient<PagedOrderResult>(`/orders/admin?${params.toString()}`);
  },

  getOrderByIdAdmin: (id: number): Promise<OrderDto> =>
    apiClient<OrderDto>(`/orders/admin/${id}`),

  updateOrderStatus: (id: number, newStatus: string, note?: string): Promise<OrderDto> =>
    apiClient<OrderDto>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ newStatus, note }),
    }),
};
