import { faker } from "@faker-js/faker";
import { pool } from "./db";

const STATUSES = ["pending", "paid", "shipped", "delivered"];

async function seedCustomers(count: number): Promise<number[]> {
  const ids: number[] = [];
  for (let i = 0; i < count; i++) {
    const result = await pool.query(
      "INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING id",
      [faker.person.fullName(), faker.internet.email()]
    );
    ids.push(result.rows[0].id);
  }
  return ids;
}

async function seedOrders(count: number, customerIds: number[]): Promise<number[]> {
  const ids: number[] = [];
  for (let i = 0; i < count; i++) {
    const customerId = faker.helpers.arrayElement(customerIds);
    const status = faker.helpers.arrayElement(STATUSES);
    const result = await pool.query(
      "INSERT INTO orders (customer_id, status, total_cents) VALUES ($1, $2, $3) RETURNING id",
      [customerId, status, 0]
    );
    ids.push(result.rows[0].id);
  }
  return ids;
}

async function seedOrderItems(orderIds: number[]) {
  for (const orderId of orderIds) {
    const itemCount = faker.number.int({ min: 1, max: 3 });
    let totalCents = 0;
    for (let i = 0; i < itemCount; i++) {
      const quantity = faker.number.int({ min: 1, max: 5 });
      const unitPriceCents = faker.number.int({ min: 500, max: 20000 });
      totalCents += quantity * unitPriceCents;
      await pool.query(
        "INSERT INTO order_items (order_id, product_name, quantity, unit_price_cents) VALUES ($1, $2, $3, $4)",
        [orderId, faker.commerce.productName(), quantity, unitPriceCents]
      );
    }
    await pool.query("UPDATE orders SET total_cents = $1 WHERE id = $2", [totalCents, orderId]);
  }
}

async function main() {
  const customerIds = await seedCustomers(10);
  console.log(`Seeded ${customerIds.length} customers`);

  const orderIds = await seedOrders(30, customerIds);
  console.log(`Seeded ${orderIds.length} orders`);

  await seedOrderItems(orderIds);
  console.log(`Seeded order_items for ${orderIds.length} orders`);

  await pool.end();
}

main();
