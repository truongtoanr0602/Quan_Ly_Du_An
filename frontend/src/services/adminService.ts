import { apiClient } from './apiClient';
import type { PagedUserResult, DashboardSummaryDto, RevenueSummaryDto, TopProductDto, InventoryDto, InventoryTransactionDto, PagedAdminOrderResult, AdminOrderDto } from '../types/admin';

export const adminService = {
  getOrders: (pageNumber = 1, pageSize = 10, status?: string): Promise<PagedAdminOrderResult> => {
    const params = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) });
    if (status) params.set('status', status);
    return apiClient<PagedAdminOrderResult>(`/admin/orders?${params.toString()}`);
  },

  getOrder: (orderId: number): Promise<AdminOrderDto> =>
    apiClient<AdminOrderDto>(`/admin/orders/${orderId}`),

  updateOrderStatus: (orderId: number, newStatus: string, note?: string): Promise<AdminOrderDto> =>
    apiClient<AdminOrderDto>(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ newStatus, note }),
    }),

  // Users
  getUsers: (pageNumber = 1, pageSize = 10, keyword?: string): Promise<PagedUserResult> => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    if (keyword) params.append('keyword', keyword);
    return apiClient<PagedUserResult>(`/admin/users?${params.toString()}`);
  },

  // Reports
  getDashboardSummary: (): Promise<DashboardSummaryDto> =>
    apiClient<DashboardSummaryDto>('/reports/summary'),

  getRevenue: (from?: string, to?: string): Promise<RevenueSummaryDto> => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    return apiClient<RevenueSummaryDto>(`/reports/revenue?${params.toString()}`);
  },

  getTopProducts: (count = 10): Promise<TopProductDto[]> =>
    apiClient<TopProductDto[]>(`/reports/top-products?count=${count}`),

  // Inventory
  getInventory: (keyword?: string): Promise<InventoryDto[]> => {
    const params = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
    return apiClient<InventoryDto[]>(`/inventory${params}`);
  },

  updateStock: (productId: number, data: { quantity: number; transactionType: string; note?: string }): Promise<InventoryDto> =>
    apiClient<InventoryDto>(`/inventory/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getTransactions: (productId: number): Promise<InventoryTransactionDto[]> =>
    apiClient<InventoryTransactionDto[]>(`/inventory/${productId}/transactions`),
};
