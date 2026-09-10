import { apiClient } from './apiClient';
import type { AddressDto, AddressCreateRequest, AddressUpdateRequest } from '../types/address';

export const addressService = {
  getAddresses: (): Promise<AddressDto[]> => apiClient<AddressDto[]>('/addresses'),

  getAddressById: (id: number): Promise<AddressDto> =>
    apiClient<AddressDto>(`/addresses/${id}`),

  createAddress: (data: AddressCreateRequest): Promise<AddressDto> =>
    apiClient<AddressDto>('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAddress: (id: number, data: AddressUpdateRequest): Promise<AddressDto> =>
    apiClient<AddressDto>(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAddress: (id: number): Promise<void> =>
    apiClient<void>(`/addresses/${id}`, { method: 'DELETE' }),
};
