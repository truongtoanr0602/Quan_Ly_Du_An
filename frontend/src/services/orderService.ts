import { apiClient } from './apiClient'
import type { CheckoutRequest, OrderDetail, OrderDto, PagedAdminOrders, PagedOrders } from '../types/order'

export const orderService = {
  checkout: (request: CheckoutRequest): Promise<OrderDetail> => apiClient<OrderDetail>('/orders', {
    method: 'POST',
    body: JSON.stringify(request),
  }),
  list: (pageNumber = 1, pageSize = 10): Promise<PagedOrders> =>
    apiClient<PagedOrders>('/orders?pageNumber=' + pageNumber + '&pageSize=' + pageSize),
  get: (orderID: number): Promise<OrderDetail> => apiClient<OrderDetail>('/orders/' + orderID),
  getAllOrders: (pageNumber = 1, pageSize = 10, status?: string): Promise<PagedAdminOrders> => {
    const params = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) })
    if (status) params.set('status', status)
    return apiClient<PagedAdminOrders>('/admin/orders?' + params.toString())
  },
  getOrderByIdAdmin: (orderID: number): Promise<OrderDto> =>
    apiClient<OrderDto>('/admin/orders/' + orderID),
  updateOrderStatus: (orderID: number, newStatus: string, note?: string): Promise<OrderDto> =>
    apiClient<OrderDto>('/admin/orders/' + orderID + '/status', {
      method: 'PUT',
      body: JSON.stringify({ newStatus, note }),
    }),
}
