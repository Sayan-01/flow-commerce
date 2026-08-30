export interface AuditMetricData {
  totalGrossRevenue: number;
  aiAttributedUpsellRevenue: number;
  baselineRevenue: number;
  aiRevenueLiftPercentage: number;
  totalPaidOrdersCount: number;
  paidUpsellItemsCount: number;
  totalRecommendations: number;
  acceptedRecommendations: number;
  recommendationConversionRate: number;
  guardrailBlocks: number;
  totalAuditEvents: number;
}

export interface AuditLogRow {
  id: string;
  merchantId?: string | null;
  actor: "USER" | "AGENT" | "SYSTEM" | "MERCHANT";
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  payload?: any;
  status: string;
  reason?: string | null;
  createdAt: string | Date;
}

export interface MerchantOrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  isUpsell: boolean;
  reason?: string | null;
  product?: {
    id: string;
    name: string;
    price: number;
    category: string;
    imageUrl?: string | null;
  };
}

export interface MerchantOrderRow {
  id: string;
  userId?: string | null;
  merchantId: string;
  cartId?: string | null;
  status: "PROPOSED" | "AWAITING_PAYMENT" | "PAID" | "FAILED" | "CANCELLED";
  totalAmount: number;
  subtotal: number;
  discount: number;
  currency: string;
  customerNote?: string | null;
  razorpayOrderId?: string | null;
  createdAt: string | Date;
  items: MerchantOrderItem[];
  merchant?: {
    id: string;
    name: string;
    storeName: string;
  };
  payments?: Array<{
    id: string;
    status: string;
    razorpayPaymentId?: string | null;
    amount: number;
  }>;
}
