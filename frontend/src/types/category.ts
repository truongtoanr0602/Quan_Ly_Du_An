export interface CategoryDto {
  categoryID: number;
  categoryName: string;
  parentID: number | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CategoryCreateDto {
  categoryName: string;
  parentID?: number | null;
  description?: string | null;
  isActive: boolean;
}

export interface CategoryUpdateDto {
  categoryName: string;
  parentID?: number | null;
  description?: string | null;
  isActive: boolean;
}
