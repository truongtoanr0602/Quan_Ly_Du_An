import { apiClient } from './apiClient'
import type { CheckoutRequest, OrderDetail } from '../types/order'

export const orderService = {
  checkout: (request: CheckoutRequest): Promise<OrderDetail> => apiClient<OrderDetail>('/orders', {
    method: 'POST',
    body: JSON.stringify(request),
  }),
}
