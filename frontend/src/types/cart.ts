export interface CartItem {
  productID: number
  productName: string
  sku: string
  unitPrice: number
  quantity: number
  stockQuantity: number
  imageURL?: string
  lineTotal: number
}

export interface Cart {
  items: CartItem[]
  totalItems: number
  totalAmount: number
}
