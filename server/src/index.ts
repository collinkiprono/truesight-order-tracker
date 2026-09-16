import express from "express";
import cors from "cors";
import { pool } from "./db";

const ALLOWED_STATUSES = ["pending", "paid", "shipped", "delivered"];

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("OK");
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    res.json({ token: process.env.ADMIN_TOKEN });
    return;
  }

  res.status(401).json({ error: "Invalid credentials" });
});

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.header("Authorization")?.replace(/^Bearer\s+/i, "");

  if (!token || token !== process.env.ADMIN_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}

app.use("/api/orders", requireAuth);

app.get("/api/orders", async (req, res) => {
  const { status } = req.query;
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
  const limit = Math.max(1, parseInt(String(req.query.limit ?? "10"), 10) || 10);
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  values.push(limit);
  const limitParam = `$${values.length}`;
  values.push(offset);
  const offsetParam = `$${values.length}`;

  const result = await pool.query(
    `SELECT * FROM orders ${whereClause} ORDER BY id LIMIT ${limitParam} OFFSET ${offsetParam}`,
    values
  );

  res.json(result.rows);
});

app.get("/api/orders/:id", async (req, res) => {
  const orderResult = await pool.query(
    `SELECT orders.*, customers.name AS customer_name, customers.email AS customer_email
     FROM orders
     JOIN customers ON orders.customer_id = customers.id
     WHERE orders.id = $1`,
    [req.params.id]
  );

  const order = orderResult.rows[0];
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const itemsResult = await pool.query(
    "SELECT id, product_name, quantity, unit_price_cents FROM order_items WHERE order_id = $1",
    [req.params.id]
  );

  res.json({ ...order, items: itemsResult.rows });
});

app.patch("/api/orders/:id/status", async (req, res) => {
  const { status } = req.body;

  if (!ALLOWED_STATUSES.includes(status)) {
    res.status(400).json({ error: `status must be one of: ${ALLOWED_STATUSES.join(", ")}` });
    return;
  }

  const result = await pool.query(
    "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
    [status, req.params.id]
  );

  if (!result.rows[0]) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(result.rows[0]);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
