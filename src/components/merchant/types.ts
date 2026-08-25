export interface MerchantProduct {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  stock: number;
  imageUrl?: string;
  isActive?: boolean;
}

export interface ProductStatsData {
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
  totalCatalogValue: number;
}
