# Multi‑Seller Orders Backend Integration

## Overview
Enable the order creation endpoint to split a single customer checkout into multiple store‑specific orders while keeping a single parent order identity and consistent payment linkage. The frontend already sends normalized store and product information, plus a `stores` list and `store_allocations` summary; the backend should consume these to persist each seller’s portion accurately and make them visible in the admin UI.

## Endpoints To Modify
- POST `/order/`  – primary change (create order)
- GET `/order/getall` – admin/global listing (return parent orders with multi‑seller hints)
- GET `/order/store/{storeId}` – seller listing/detail (accept `orderId` filter to return store‑scoped slice)

Optional:
- GET `/order/{orderId}` – admin detail (return parent + children with per‑store breakdown)

## Request Contract (from Frontend)
The frontend posts a single payload to `/order` that may represent one or multiple stores.

```json
{
  "user_id": 123,
  "address": {
    "id": 456,
    "full_name": "Jane Doe",
    "phone_no": "08012345678",
    "country_code": "+234",
    "full_address": "No. 1 Street, Lagos",
    "city": "Lagos",
    "state": "Lagos",
    "state_id": 25,
    "country": "Nigeria",
    "country_id": 1,
    "landmark": "Near X",
    "address_type": "home"
  },
  "charges": {
    "token": "DELIVERY_TOKEN",
    "totalCharge": 2500
  },
  "payment": {
    "ref": "ORDER_1700000000_ABC123",
    "type": "Pay Online",
    "status": "success",
    "amount": 1202500,
    "gateway_response": "Approved",
    "is_multi_seller": true
  },
  "cart": [
    {
      "product_id": 10079,
      "store_id": 6,
      "name": "Samsung S23",
      "variantId": 1,
      "combination": "256GB Black",
      "quantity": 2,
      "unit_price": 450000,
      "totalPrice": 900000,
      "weight": 0.5,
      "image": "https://example.com/images/s23.jpg"
    },
    {
      "product_id": 10080,
      "store_id": 15,
      "name": "Charger",
      "quantity": 1,
      "unit_price": 300000,
      "totalPrice": 300000,
      "weight": 0.2
    }
  ],
  "is_multi_seller": true,
  "stores": [6, 15],
  "store_allocations": [
    { "store_id": 6, "product_amount": 900000, "item_count": 1 },
    { "store_id": 15, "product_amount": 300000, "item_count": 1 }
  ],
  "metadata": {
    "order_notes": "",
    "preferred_delivery_time": "afternoon",
    "source": "web_app",
    "device_id": "browser_chrome_mac"
  }
}
```

Notes:
- `cart[].store_id` and `cart[].product_id` are always present and numeric.
- `is_multi_seller = true` and `stores[]` list are explicit.
- `store_allocations` summarizes each store’s `product_amount` (sum of item `totalPrice` for that store) and `item_count`.

## Validation Rules
- Require non‑empty `cart`.
- Each cart item must have:
  - `product_id > 0`
  - `store_id > 0`
  - `quantity >= 1`
  - `totalPrice >= 0`
- When `is_multi_seller = true`:
  - `stores` must match the unique set of `store_id` from `cart`.
  - `store_allocations` must cover every store present in `cart`.
  - Sum of `store_allocations.product_amount` must equal sum of `cart.totalPrice`.
- `payment.ref` is an idempotency key and must be unique across creates.

## Creation Algorithm
1. Group items by `store_id`.
2. Compute per‑store subtotals:
   - `product_subtotal_store = sum(item.totalPrice)`
   - `item_count_store = items.length`
3. Distribute `charges.totalCharge` (delivery):
   - Option A (recommended): Keep delivery charge on the parent only. Store orders’ `grandTotal = product_subtotal_store`; parent `grandTotal = sum(product_subtotals) + deliveryCharge`.
   - Option B (if required by UI): Prorate delivery by product amount ratio. `delivery_share_store = round(totalCharge * (product_subtotal_store / product_subtotal_total))`.
4. Persist:
   - Parent order:
     - `order_id` (shared external ref), `user_id`, `is_multi_seller=true`, `payment_ref`, `charges.totalCharge`, `grandTotal`, `stores[]`, metadata
   - Store orders (one per store):
     - `parent_order_id` (or `order_id` reference), `store_id`
     - `items[]` for that store
     - `grandTotal_store` (per step 3)
     - `deliveryCharge_store` (0 for Option A; prorated for Option B)
     - `itemCount`, `status`, `createdAt`
5. Idempotency (by `payment.ref`):
   - If parent exists and all children exist → return existing.
   - If parent exists but a child is missing → create missing child only and return full set.
6. Response (example):
```json
{
  "status": true,
  "message": "Created 2 order(s) for 2 seller(s)",
  "data": [
    {
      "id": 1111,
      "order_id": "ORD-ABC123",
      "status": "pending",
      "storeId": 6,
      "grandTotal": 900000,
      "deliveryCharge": 0,
      "totalItems": 1,
      "is_multi_seller": true,
      "payment_reference": "ORDER_1700000000_ABC123",
      "createdAt": "2026-02-14T10:30:00.000Z"
    },
    {
      "id": 2222,
      "order_id": "ORD-ABC123",
      "status": "pending",
      "storeId": 15,
      "grandTotal": 300000,
      "deliveryCharge": 0,
      "totalItems": 1,
      "is_multi_seller": true,
      "payment_reference": "ORDER_1700000000_ABC123",
      "createdAt": "2026-02-14T10:30:00.000Z"
    }
  ]
}
```

## Listing Endpoints (Read Path)
- GET `/order/getall` (admin/global)
  - Return parent orders and, for multi‑seller, include:
    - `is_multi_seller: boolean`
    - `stores: number[]`
    - `totalItems` across all stores
    - `grandTotal` per chosen delivery distribution rule
  - Optional condensed children summary: `[{ storeId, itemCount, subtotal }]`
- GET `/order/store/{storeId}`
  - Accept optional query `orderId` to filter for a specific parent order identity.
  - Return the store‑scoped record with `items[]` for that seller.

## Data Model Suggestions
**orders (parent)**
- `id`, `order_id` (external ref), `user_id`, `is_multi_seller`, `payment_ref`, `charges_total`, `grand_total`, `stores (json)`, `status`, `created_at`

**store_orders (child)**
- `id`, `parent_order_id`, `order_id` (copy of parent), `store_id`
- `grand_total_store`, `delivery_charge_store`, `item_count`, `status`, `created_at`

**order_items**
- `id`, `store_order_id`, `product_id`, `name`, `variant_id`, `quantity`, `unit_price`, `total_price`, `image`, `weight`

**Indexes**
- `unique(payment_ref)`
- `store_orders(store_id)`
- `order_items(store_order_id)`
- `orders(order_id)`

## Admin Panel Expectations
- List expects each child record to include:
  - `order_id`, `status`, `storeId`, `grandTotal`, `deliveryCharge`, `totalItems`, `is_multi_seller`, `payment_reference`, `createdAt`
- Detail uses `orderId` and `storeId` to fetch the store‑scoped data.

## Backwards Compatibility
- If `is_multi_seller` is absent, derive grouping from `cart[].store_id` and treat as multi‑seller when >1 store present.
- If `store_allocations` is absent, compute internally from cart totals.

## Error Handling
- 400 for invalid/missing `product_id` or `store_id` in any item.
- 409 for duplicate `payment_ref` with conflicting payload (non‑idempotent changes).
- 500 for unexpected storage errors; keep idempotent logs.

## Minimal Acceptance Tests
- Single seller: one store group, one `store_order`, parent `is_multi_seller=false`.
- Two sellers: two `store_orders` with correct items and subtotals, parent `is_multi_seller=true` and `stores=[…]`.
- Idempotency: same `payment_ref` twice creates no duplicates.
- Admin list shows both store orders; detail filters by `storeId` and `orderId` correctly.

## Summary
- Modify `POST /order/` to split `cart` into store‑scoped children, compute per‑store totals, attach parent metadata, and return an array of created `store_orders`.
- Ensure `GET /order/getall` and `GET /order/store/{storeId}` surface multi‑seller orders predictably using `order_id` and `storeId` so the admin UI can display each seller’s portion.

