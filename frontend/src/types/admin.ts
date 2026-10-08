export interface UserListDto {
  userId: number;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
}

export interface PagedUserResult {
  items: UserListDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface ProfileDto {
  userId: number;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
}

export interface DashboardSummaryDto {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
}

export interface RevenueByDateDto {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface RevenueSummaryDto {
  dailyRevenue: RevenueByDateDto[];
  totalRevenue: number;
  totalOrders: number;
}

export interface TopProductDto {
  productId: number;
  productName: string;
  imageUrl?: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface InventoryDto {
  productId: number;
  productName: string;
  sku: string;
  stockQuantity: number;
  categoryName: string;
  brandName: string;
  isActive: boolean;
}

export interface InventoryTransactionDto {
  transactionId: number;
  productId: number;
  productName: string;
  transactionType: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  note?: string;
  createdByName?: string;
  createdAt: string;
}
