export interface Product {
  sku: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  attributes?: Record<string, unknown>;
  tags?: string[];
  image_url?: string;
  score?: number;
  signal?: number;
  in_stock?: boolean;
  inventory?: { qty_on_hand: number; aisle?: string; reorder_level?: number } | null;
}

export interface OrderItem {
  sku: string;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  order_id: string;
  user_id: string;
  status: string;
  created_at: string;
  items: OrderItem[];
  subtotal?: number;
  discount?: number;
  discount_code?: string | null;
  total: number;
  shipping_address?: string;
  refund?: { amount: number; reason: string; processed: boolean } | null;
}

export interface Promotion {
  code: string;
  description: string;
  type: "percent" | "fixed";
  value: number;
  applies_to?: string[];
}
