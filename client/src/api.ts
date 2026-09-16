export const API_URL = import.meta.env.VITE_API_URL;

export interface Order {
  id: number;
  customer_id: number;
  status: string;
  total_cents: number;
  created_at: string;
}

export interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price_cents: number;
}

export interface OrderDetail extends Order {
  customer_name: string;
  customer_email: string;
  items: OrderItem[];
}

export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Invalid email or password");
  }

  const data = await res.json();
  return data.token;
}

export async function fetchOrders(
  token: string,
  { status, page, limit }: { status: string; page: number; limit: number }
): Promise<Order[]> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set("status", status);

  const res = await fetch(`${API_URL}/api/orders?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }

  return res.json();
}

export async function fetchOrder(token: string, id: number): Promise<OrderDetail> {
  const res = await fetch(`${API_URL}/api/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch order");
  }

  return res.json();
}

export async function updateOrderStatus(
  token: string,
  id: number,
  status: string
): Promise<Order> {
  const res = await fetch(`${API_URL}/api/orders/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error("Failed to update status");
  }

  return res.json();
}
