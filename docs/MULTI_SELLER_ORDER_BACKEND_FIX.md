# Multi-Seller Order Backend Fix Required

## Issue

When customers add products from multiple sellers to their cart and checkout, all items appear as a single order in the admin panel instead of being split into separate orders per seller.

## Current Frontend Behavior (Already Implemented ✅)

The frontend sends the following data structure when creating orders:

### Order Payload for Multi-Seller Orders

```json
{
  "is_multi_seller": true,
  "cart": [
    {
      "productId": "123",
      "name": "Product A",
      "quantity": 2,
      "totalPrice": 5000,
      "storeId": 1,
      "store_id": 1
    },
    {
      "productId": "456",
      "name": "Product B",
      "quantity": 1,
      "totalPrice": 3000,
      "storeId": 2,
      "store_id": 2
    }
  ],
  "payment": {
    "ref": "PAY_123456",
    "type": "Pay Online",
    "status": "success",
    "is_multi_seller": true
  },
  "address": { ... },
  "charges": { "token": "..." },
  "user_id": 123
}
```

### Guest Order Payload (`/order/guest`)

```json
{
  "is_multi_seller": true,
  "cart_items": [
    {
      "product_id": 123,
      "product_name": "Product A",
      "quantity": 2,
      "store_id": 1
    },
    {
      "product_id": 456,
      "product_name": "Product B",
      "quantity": 1,
      "store_id": 2
    }
  ],
  "guest_info": { ... },
  "delivery_address": { ... },
  "delivery": { "delivery_token": "..." },
  "payment": { ... }
}
```

## Required Backend Changes

### 1. Order Creation Endpoint (`POST /order/`)

The backend must check if `is_multi_seller: true` and split the order by store:

```javascript
async function createOrder(req, res) {
  const { cart, payment, address, charges, user_id, is_multi_seller } =
    req.body;

  // Group cart items by store_id
  const storeGroups = {};
  cart.forEach((item) => {
    const storeId = item.storeId || item.store_id;
    if (!storeGroups[storeId]) {
      storeGroups[storeId] = [];
    }
    storeGroups[storeId].push(item);
  });

  const orders = [];

  // Create separate order for each store
  for (const [storeId, items] of Object.entries(storeGroups)) {
    const storeTotal = items.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0,
    );

    // Calculate per-store delivery charge (can be split equally or by weight)
    const perStoreDelivery =
      charges.totalCharge / Object.keys(storeGroups).length;

    const order = await Order.create({
      store_id: storeId,
      user_id: user_id,
      total: storeTotal,
      delivery_charge: perStoreDelivery,
      grand_total: storeTotal + perStoreDelivery,
      payment_reference: payment.ref,
      payment_type: payment.type,
      payment_status: payment.status,
      status: "Confirmed",
      is_multi_seller: is_multi_seller,
      // ... address fields
    });

    // Create order items
    for (const item of items) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.productId || item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        total_price: item.totalPrice,
        store_id: storeId,
      });
    }

    orders.push({
      orderId: order.id,
      storeId: storeId,
      newOrder: {
        status: "Confirmed",
        total: storeTotal,
        grandTotal: order.grand_total,
        deliveryCharge: perStoreDelivery,
      },
      orderItems: items,
    });
  }

  // Return array of orders
  return res.json({
    status: true,
    data: orders,
    message: `Created ${orders.length} orders for ${Object.keys(storeGroups).length} sellers`,
  });
}
```

### 2. Guest Order Endpoint (`POST /order/guest`)

Same logic but using `cart_items` instead of `cart`:

```javascript
// Group by store_id from cart_items
const storeGroups = {};
cart_items.forEach((item) => {
  const storeId = item.store_id;
  if (!storeGroups[storeId]) {
    storeGroups[storeId] = [];
  }
  storeGroups[storeId].push(item);
});

// ... same order creation logic as above
```

### 3. Admin Orders List

Ensure the admin orders page shows ALL orders including those split from multi-seller carts. Each store's portion should appear as a separate order with:

- Same `payment_reference` (to link related orders)
- Different `store_id`
- `is_multi_seller: true` flag

### 4. Database Schema (if not present)

Ensure these fields exist in the `orders` table:

```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_multi_seller BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255);

-- Index for finding related multi-seller orders
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON orders(payment_reference);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_is_multi_seller ON orders(is_multi_seller);
```

## Expected Response Format

### Single Seller Order

```json
{
  "status": true,
  "data": [{
    "orderId": 1,
    "storeId": 123,
    "newOrder": {
      "status": "Confirmed",
      "total": 5000,
      "grandTotal": 7500,
      "deliveryCharge": 2500
    },
    "orderItems": [...]
  }]
}
```

### Multi-Seller Order (2 stores)

```json
{
  "status": true,
  "data": [
    {
      "orderId": 1,
      "storeId": 123,
      "newOrder": {
        "status": "Confirmed",
        "total": 5000,
        "grandTotal": 6250,
        "deliveryCharge": 1250
      },
      "orderItems": [...]
    },
    {
      "orderId": 2,
      "storeId": 456,
      "newOrder": {
        "status": "Confirmed",
        "total": 3000,
        "grandTotal": 4250,
        "deliveryCharge": 1250
      },
      "orderItems": [...]
    }
  ]
}
```

## Frontend Already Handles

✅ Sending `is_multi_seller` flag
✅ Including `store_id` on each cart item
✅ Handling array response with multiple orders
✅ Displaying all order items in success page
✅ Calculating totals across multiple orders

## Testing Checklist

1. [ ] Add products from Store A to cart
2. [ ] Add products from Store B to cart
3. [ ] Complete checkout
4. [ ] Verify 2 separate orders appear in admin panel
5. [ ] Each order should have correct `store_id`
6. [ ] Payment reference should be the same for linked orders
7. [ ] Total amounts should match the items in each order
