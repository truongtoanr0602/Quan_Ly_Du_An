export interface AddressDto {
  addressId: number;
  receiverName: string;
  receiverPhone: string;
  province?: string;
  district?: string;
  ward?: string;
  fullAddress: string;
  isDefault: boolean;
}

export interface AddressCreateRequest {
  receiverName: string;
  receiverPhone: string;
  province?: string;
  district?: string;
  ward?: string;
  fullAddress: string;
  isDefault: boolean;
}

export interface AddressUpdateRequest extends AddressCreateRequest {}
