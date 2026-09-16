import { useEffect, useState } from "react";
import { fetchOrder, updateOrderStatus, type OrderDetail as OrderDetailType } from "./api";

const STATUSES = ["pending", "paid", "shipped", "delivered"];

export function OrderDetail({
  token,
  orderId,
  onBack,
}: {
  token: string;
  orderId: number;
  onBack: () => void;
}) {
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder(token, orderId)
      .then(setOrder)
      .catch(() => setError("Failed to load order"));
  }, [token, orderId]);

  async function handleStatusChange(status: string) {
    try {
      const updated = await updateOrderStatus(token, orderId, status);
      setOrder((prev) => (prev ? { ...prev, status: updated.status } : prev));
    } catch {
      setError("Failed to update status");
    }
  }

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!order) return <p>Loading...</p>;

  return (
    <div>
      <button onClick={onBack}>&larr; Back to orders</button>
      <h2>Order #{order.id}</h2>

      <label>
        Status:{" "}
        <select value={order.status} onChange={(e) => handleStatusChange(e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <h3>Customer</h3>
      <p>
        {order.customer_name} ({order.customer_email})
      </p>

      <h3>Items</h3>
      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Unit Price</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td>{item.product_name}</td>
              <td>{item.quantity}</td>
              <td>${(item.unit_price_cents / 100).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>Total: ${(order.total_cents / 100).toFixed(2)}</p>
    </div>
  );
}
