export interface ToolExecution {
  id: string;
  name: string;
  args: Record<string, any>;
  result: any;
}

export interface ChatMessageItem {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  toolExecutions?: ToolExecution[];
  createdAt?: string | Date;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  stock: number;
  category: string;
  imageUrl?: string | null;
  isUpsell?: boolean;
}

export interface RecommendationItem {
  id: string;
  productId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string | null;
  type: "UPSELL" | "CROSS_SELL" | "ALTERNATIVE";
  reason: string;
  accepted?: boolean;
}

export interface CartState {
  id: string;
  status: string;
  itemCount: number;
  subtotal: number;
  discount: number;
  totalAmount: number;
  items: CartItem[];
  recommendations?: RecommendationItem[];
}

