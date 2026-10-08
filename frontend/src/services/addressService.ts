import { apiClient } from './apiClient'
import type { Address, AddressWriteRequest } from '../types/address'

export const addressService = {
  list: (): Promise<Address[]> => apiClient<Address[]>('/addresses'),
  create: (request: AddressWriteRequest): Promise<Address> => apiClient<Address>('/addresses', {
    method: 'POST',
    body: JSON.stringify(request),
  }),
  update: (addressID: number, request: AddressWriteRequest): Promise<Address> =>
    apiClient<Address>(`/addresses/${addressID}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    }),
  remove: (addressID: number): Promise<void> => apiClient<void>(`/addresses/${addressID}`, {
    method: 'DELETE',
  }),
}
