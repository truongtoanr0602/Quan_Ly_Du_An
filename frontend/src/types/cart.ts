export interface CartItemDto {
  cartItemId: number;
  productId: number;
  productName: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  stockQuantity: number;
  subTotal: number;
}

export interface CartDto {
  cartId: number;
  items: CartItemDto[];
  totalPrice: number;
  totalItems: number;
}

export interface AddCartItemRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
