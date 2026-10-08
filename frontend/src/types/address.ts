export interface Address {
  addressID: number
  receiverName: string
  receiverPhone: string
  province?: string
  district?: string
  ward?: string
  fullAddress: string
  isDefault: boolean
}

export type AddressWriteRequest = Omit<Address, 'addressID'>
