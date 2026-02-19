# Order Duplication — Backend Fixes Required

---

## Endpoint → Fix Map

| Fix | Endpoint(s) | What it fixes |
|---|---|---|
| Fix 1 | `GET order/getall` · `GET order/store/:storeId` | Row fanout — each order appears N times (once per order item) |
| Fix 2 | `POST order/` · `POST order/guest` | Missing `parent_order_id` — sub-orders from the same checkout are not linked |
| Fix 3 | `GET order/getall` · `GET order/store/:storeId` | `meta.itemCount` is inflated — counts raw rows, not checkout sessions |
| Fix 4 | `POST order/` · `POST order/guest` | Multi-seller orders fail — backend rejects the same `payment.ref` on the 2nd sub-order |

---

## Problem Summary

| Bug | Affected endpoint(s) | Root cause |
|---|---|---|
| Each order appears **N times** (once per order item) | `GET order/getall`, `GET order/store/:storeId` | Query JOINs on `orderItems` without grouping |
| A multi-seller checkout shows as **2 separate orders** instead of 1 | `GET order/getall`, `GET order/store/:storeId` | No shared `parent_order_id` column links sub-orders |
| Multi-seller order creation **fails on sub-order 2** | `POST order/`, `POST order/guest` | Unique constraint on `payment.ref` blocks the 2nd sub-order |
| `meta.itemCount` shows inflated count | `GET order/getall`, `GET order/store/:storeId` | Counts raw rows, not distinct checkout sessions |

---

## Required Changes

### Fix 1 — `GET order/getall` · `GET order/store/:storeId` — Remove the `orderItems` JOIN from the list query

The list endpoint should **not** join on order items. Item details are only
needed on the detail endpoint (`order/get_one/admin/:id`).

Instead, return a pre-computed `totalItems` count column.

**Before (causes N-row fanout):**
```sql
SELECT o.*, oi.*
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE ...
```

**After:**
```sql
SELECT
  o.id,
  o.order_id,
  o.parent_order_id,        -- see Fix 2
  o.user_id,
  o.store_id,
  o.grand_total,
  o.delivery_charge,
  o.status,
  o.created_at,
  o.is_guest_order,
  o.is_multi_seller,
  o.image,
  u.name,
  COUNT(oi.id) AS total_items   -- pre-computed count, no fanout
FROM orders o
LEFT JOIN users u ON u.id = o.user_id
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE ...
GROUP BY o.id
ORDER BY o.created_at DESC
```

---

### Fix 2 — `POST order/` · `POST order/guest` — Add `parent_order_id` to every sub-order

When a customer checks out with items from multiple stores, the backend
creates one sub-order per store. These sub-orders must share a common
`parent_order_id` so the frontend can group them into a single list entry.

**`parent_order_id` should be the Paystack payment reference** (e.g.
`ORDER_1700054400000_AB123C`) — it is already sent by the frontend in the
order creation payload under `payment.ref`.

**Migration:**
```sql
ALTER TABLE orders ADD COLUMN parent_order_id VARCHAR(255) NULL;
CREATE INDEX idx_orders_parent_order_id ON orders(parent_order_id);
```

**On order creation**, when the backend creates sub-orders per store, set
`parent_order_id = payment.ref` on **all** of them:

```js
// Example — order creation handler (pseudo-code)
const parentOrderId = payload.payment.ref; // e.g. "ORDER_1700054400000_AB123C"

for (const storeGroup of groupedByStore) {
  await Order.create({
    ...storeGroup,
    parent_order_id: parentOrderId,  // same value for every sub-order
  });
}
```

---

### Fix 3 — `GET order/getall` · `GET order/store/:storeId` — Fix `meta.itemCount` to count checkout sessions, not raw rows

Currently `meta.itemCount` reflects the raw row count (inflated by the JOIN
fanout). After Fix 1, it will reflect sub-order count. After Fix 2, it
should reflect the number of distinct **checkout sessions** so pagination
totals are accurate.

```sql
-- itemCount should be:
SELECT COUNT(DISTINCT COALESCE(parent_order_id, CAST(id AS VARCHAR))) AS itemCount
FROM orders
WHERE ...
```

---

### Fix 4 — `POST order/` · `POST order/guest` — Allow the same `payment.ref` across all sub-orders of the same checkout ⚠️ CRITICAL

**Observed bug (confirmed in production):**

When a multi-seller checkout is submitted to `POST /order`, the backend creates
sub-orders one at a time per store. The current code marks `payment.ref` as a
unique constraint the moment the **first** sub-order is inserted. When it then
tries to create the **second** sub-order with the same `payment.ref`, it throws:

```
"The REF You've choosed is Already Used (ORDER_xxx). Please Select another One"
```

Both sub-orders end up with `status: "failed"` even though Paystack already
charged the customer.

**Frontend payload structure (for reference):**

```json
{
  "payment": { "ref": "ORDER_1771517479393_F0QEG4", ... },
  "parent_order_id": "ORDER_1771517479393_F0QEG4",
  "cart": [ ...items from 2 stores... ],
  "stores": [3203, 3223],
  "is_multi_seller": true,
  "store_allocations": [
    { "store_id": 3203, "product_amount": 150, "item_count": 2 },
    { "store_id": 3223, "product_amount": 100, "item_count": 1 }
  ]
}
```

The frontend now sends **`parent_order_id`** as a dedicated top-level field
(same value as `payment.ref`). Use this field for grouping sub-orders — NOT
`payment.ref` for the uniqueness/duplicate-payment check.

**Required backend changes:**

1. **Do not enforce uniqueness on `payment.ref` per sub-order for multi-seller orders.**
   All sub-orders that share the same `parent_order_id` must be allowed to
   carry the same `payment.ref`. The payment already happened once; the ref is
   the Paystack reference for the whole checkout session, not per store.

2. **Use `parent_order_id` (from `req.body.parent_order_id`) for sub-order grouping.**
   Store it on every sub-order row as described in Fix 2.

3. **Only reject a `payment.ref` as "already used" if a *successful* order with that ref already exists.**
   Failed orders should not block re-attempts with the same reference.

```js
// Pseudo-code — order creation handler
const parentOrderId = payload.parent_order_id || payload.payment?.ref;

// Check for SUCCESSFUL duplicate, not any duplicate
const existingSuccessful = await Order.findOne({
  where: { payment_reference: parentOrderId, status: { not: 'failed' } },
});
if (existingSuccessful) {
  throw new Error('Order already completed for this reference.');
}

// Create one sub-order per store — all share the same parent_order_id
for (const storeGroup of groupedByStore) {
  await Order.create({
    ...storeGroup,
    parent_order_id: parentOrderId,  // Fix 2 field
    payment_reference: parentOrderId, // allowed to repeat across sub-orders
  });
}
```

---

## Expected Response Format

### Envelope

```json
{
  "status": true,
  "data": [ ...orders ],
  "meta": {
    "itemCount": 87
  }
}
```

`meta.itemCount` = number of distinct checkout sessions (not raw sub-order rows).

### Each object in `data[]`

```json
{
  "order_id":        "177149539206",
  "parent_order_id": "ORDER_1700054400000_AB123C",
  "id":              42,
  "userId":          7,
  "storeId":         3,
  "name":            "John Doe",
  "createdAt":       "2024-11-15T14:30:00.000Z",
  "grandTotal":      15000,
  "deliveryCharge":  1500,
  "status":          "pending",
  "totalItems":      2,
  "image":           "https://cdn.example.com/product.jpg",
  "is_guest_order":  false,
  "is_multi_seller": false
}
```

### Field reference

| Field | Type | Required | Notes |
|---|---|---|---|
| `order_id` | `string` | Yes | Human-readable reference shown in the table |
| `parent_order_id` | `string \| null` | **Yes (new)** | Paystack ref shared across all sub-orders from the same checkout. `null` for legacy orders without it |
| `id` | `number` | Yes | DB primary key |
| `userId` | `number \| null` | Yes | `null` for guest orders |
| `storeId` | `number` | Yes | The store this sub-order belongs to |
| `name` | `string \| null` | No | Customer display name. If omitted the frontend fetches it separately |
| `createdAt` | ISO-8601 string | Yes | Full UTC timestamp |
| `grandTotal` | `number` | Yes | Total charged for this sub-order in Naira |
| `deliveryCharge` | `number` | Yes | Delivery fee in Naira |
| `status` | `string` | Yes | `pending` \| `processing` \| `packed` \| `shipped` \| `out_for_delivery` \| `delivered` \| `cancelled` \| `rejected` \| `failed` \| `substitution` |
| `totalItems` | `number` | Yes | Pre-computed item count — **do not include `orderItems` array on the list endpoint** |
| `image` | `string \| null` | No | Cover image URL shown in the avatar column |
| `is_guest_order` | `boolean` | Yes | `true` for guest checkouts |
| `is_multi_seller` | `boolean` | Yes | `true` when the checkout spanned multiple stores |

---

## How the Frontend Uses `parent_order_id`

Once `parent_order_id` is present, the frontend groups sub-orders with this
exact logic (no heuristics, no fuzzy matching):

```ts
const groupMap = new Map<string, Order>();

for (const order of ordersData) {
  const groupKey =
    order.parent_order_id ||          // exact key — all sub-orders from one checkout
    `solo::${order.order_id}`;        // fallback for legacy orders without parent_order_id

  if (!groupMap.has(groupKey)) {
    groupMap.set(groupKey, { ...order });
  } else {
    const base = groupMap.get(groupKey)!;
    base.grandTotal     += order.grandTotal;
    base.deliveryCharge += order.deliveryCharge;
    base.totalItems     += order.totalItems;
    base.is_multi_seller = true;
  }
}

const finalOrders = Array.from(groupMap.values());
```

**Multi-seller example — 2 stores, 1 checkout:**

| Row from backend | `parent_order_id` | `grandTotal` | `storeId` |
|---|---|---|---|
| Sub-order A | `ORDER_xxx` | ₦10,000 | 3 |
| Sub-order B | `ORDER_xxx` | ₦5,000 | 7 |

Frontend merges into **1 row**: `grandTotal = ₦15,000`, `is_multi_seller = true`.
The "View Details" button navigates to sub-order A's `order_id`.

---


