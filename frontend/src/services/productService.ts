import { apiClient } from './apiClient';

export interface Product {
  productID: number;
  categoryID: number;
  categoryName: string;
  productName: string;
  sku: string;
  description?: string;
  price: number;
  brandID: number;
  brandName?: string;
  imageUrl?: string;
  stockQuantity: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface ProductSearchRequest {
  keyword?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  pageNumber: number;
  pageSize: number;
}

export interface ProductCreateRequest {
  categoryID: number;
  productName: string;
  sku: string;
  description?: string;
  price: number;
  brandID?: number;
  stockQuantity: number;
  imageUrl?: string;
}

export interface ProductUpdateRequest extends ProductCreateRequest {
  isActive: boolean;
}

export const productService = {
  searchProducts: (params: ProductSearchRequest): Promise<PagedResult<Product>> => {
    const searchParams = new URLSearchParams();
    if (params.keyword) searchParams.append('Keyword', params.keyword);
    if (params.categoryId) searchParams.append('CategoryId', params.categoryId.toString());
    if (params.minPrice) searchParams.append('MinPrice', params.minPrice.toString());
    if (params.maxPrice) searchParams.append('MaxPrice', params.maxPrice.toString());
    if (params.brand) searchParams.append('Brand', params.brand);
    searchParams.append('PageNumber', params.pageNumber.toString());
    searchParams.append('PageSize', params.pageSize.toString());

    return apiClient<PagedResult<Product>>(`/products?${searchParams.toString()}`);
  },

  getProductById: (id: number): Promise<Product> => {
    return apiClient<Product>(`/products/${id}`);
  },

  createProduct: (data: ProductCreateRequest): Promise<Product> => {
    return apiClient<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateProduct: (id: number, data: ProductUpdateRequest): Promise<Product> => {
    return apiClient<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteProduct: (id: number): Promise<void> => {
    return apiClient<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  }
};
