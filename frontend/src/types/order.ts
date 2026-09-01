export interface OrderItem {
  productID: number
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface OrderDetail {
  orderID: number
  userID: number
  receiverName: string
  receiverPhone: string
  province?: string
  district?: string
  ward?: string
  shippingAddress: string
  subTotal: number
  shippingFee: number
  totalAmount: number
  paymentMethod: 'COD'
  paymentStatus: string
  orderStatus: string
  note?: string
  createdAt: string
  items: OrderItem[]
}

export interface CheckoutRequest {
  addressID: number
  paymentMethod: 'COD'
  note?: string
}
export interface OrderSummary {
  orderID: number
  totalAmount: number
  paymentMethod: 'COD'
  paymentStatus: string
  orderStatus: string
  createdAt: string
  totalItems: number
}

export interface PagedOrders {
  items: OrderSummary[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}
