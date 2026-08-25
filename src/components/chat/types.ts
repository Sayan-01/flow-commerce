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
}

export interface CartState {
  id: string;
  status: string;
  itemCount: number;
  totalAmount: number;
  items: CartItem[];
}
