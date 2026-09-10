export interface OrderDetailDto {
  orderDetailId: number;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDto {
  orderId: number;
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  subTotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  note?: string;
  createdAt: string;
  updatedAt?: string;
  items: OrderDetailDto[];
}

export interface CreateOrderRequest {
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  province?: string;
  district?: string;
  ward?: string;
  paymentMethod: string;
  note?: string;
}

export interface PagedOrderResult {
  items: OrderDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}
