import { apiClient } from './apiClient'
import type { CheckoutRequest, MockPayment, OrderDetail, PagedOrders } from '../types/order'

export const orderService = {
  checkout: (request: CheckoutRequest): Promise<OrderDetail> => apiClient<OrderDetail>('/orders', {
    method: 'POST',
    body: JSON.stringify(request),
  }),
  list: (pageNumber = 1, pageSize = 10): Promise<PagedOrders> =>
    apiClient<PagedOrders>('/orders?pageNumber=' + pageNumber + '&pageSize=' + pageSize),
  get: (orderID: number): Promise<OrderDetail> => apiClient<OrderDetail>('/orders/' + orderID),
  getMockPayment: (orderID: number): Promise<MockPayment> =>
    apiClient<MockPayment>('/orders/' + orderID + '/mock-payment'),
  confirmMockPayment: (orderID: number): Promise<MockPayment> =>
    apiClient<MockPayment>('/orders/' + orderID + '/mock-payment/confirm', { method: 'POST' }),
}
