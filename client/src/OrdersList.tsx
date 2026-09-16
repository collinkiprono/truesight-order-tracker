import { useEffect, useState } from "react";
import { fetchOrders, updateOrderStatus, type Order } from "./api";

const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered"];
const STATUSES = ["", ...ORDER_STATUSES];
const PAGE_SIZE = 10;

export function OrdersList({
  token,
  onSelectOrder,
}: {
  token: string;
  onSelectOrder: (id: number) => void;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders(token, { status, page, limit: PAGE_SIZE })
      .then(setOrders)
      .catch(() => setError("Failed to load orders"));
  }, [token, status, page]);

  async function handleStatusChange(orderId: number, newStatus: string) {
    try {
      const updated = await updateOrderStatus(token, orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o))
      );
    } catch {
      setError("Failed to update status");
    }
  }

  return (
    <div>
      <h2>Orders</h2>
      <label>
        Status:{" "}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s || "All"}
            </option>
          ))}
        </select>
      </label>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer ID</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={() => onSelectOrder(order.id)}
              style={{ cursor: "pointer" }}
            >
              <td>{order.id}</td>
              <td>{order.customer_id}</td>
              <td onClick={(e) => e.stopPropagation()}>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
              <td>${(order.total_cents / 100).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        <span> Page {page} </span>
        <button
          disabled={orders.length < PAGE_SIZE}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
