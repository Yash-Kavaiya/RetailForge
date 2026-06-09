import type { Order, Product } from "./types";

// Server-side base URL for the storefront read API.
const READ_API_URL = process.env.READ_API_URL || "http://localhost:8001";

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${READ_API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Read API ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchProducts(category?: string): Promise<Product[]> {
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  const data = await getJSON<{ products: Product[] }>(`/api/products${qs}`);
  return data.products;
}

export async function fetchProduct(sku: string): Promise<Product> {
  return getJSON<Product>(`/api/products/${encodeURIComponent(sku)}`);
}

export async function fetchCategories(): Promise<string[]> {
  const data = await getJSON<{ categories: string[] }>(`/api/categories`);
  return data.categories;
}

export async function fetchOrders(userId = "USER-1001"): Promise<Order[]> {
  const data = await getJSON<{ orders: Order[] }>(`/api/orders?user_id=${encodeURIComponent(userId)}`);
  return data.orders;
}

export function formatPrice(value: number | undefined): string {
  if (value === undefined || value === null) return "—";
  return `$${value.toFixed(2)}`;
}
