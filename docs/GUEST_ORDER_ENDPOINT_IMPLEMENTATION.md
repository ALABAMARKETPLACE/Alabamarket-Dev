# Guest Order Endpoint Implementation Guide

This document provides the complete backend implementation required to support guest checkout on the `/order` endpoint.

---

## Overview

The frontend sends guest orders with `user_id: null` and additional guest-specific fields. The backend must handle these orders without requiring user authentication.

---

## 1. Request Payload for Guest Orders

```json
{
  "payment": {
    "ref": "ORDER_1707580800000_ABC123",
    "type": "Pay Online",
    "status": "success",
    "amount": 1500000,
    "verified": true
  },
  "cart": [
    {
      "id": 123,
      "productId": 123,
      "name": "Product Name",
      "quantity": 2,
      "totalPrice": 10000,
      "storeId": 456,
      "store_id": 456
    }
  ],
  "address": {
    "id": "guest_1707580800000",
    "full_name": "John Doe",
    "phone_no": "08012345678",
    "country_code": "+234",
    "full_address": "123 Main Street, Lagos",
    "state_id": 25,
    "country_id": 1,
    "is_guest": true
  },
  "charges": {
    "token": "DELIVERY_TOKEN_ABC123"
  },
  "user_id": null,
  "user": null,
  "is_guest": true,
  "guest_email": "guest@example.com"
}
```

### Key Differences from Authenticated Orders

| Field              | Authenticated        | Guest                          |
| ------------------ | -------------------- | ------------------------------ |
| `user_id`          | User ID (number)     | `null`                         |
| `user`             | User object          | `null`                         |
| `is_guest`         | `false` or absent    | `true`                         |
| `guest_email`      | absent               | Required email string          |
| `address.is_guest` | `false` or absent    | `true`                         |
| `address.id`       | Database address ID  | `"guest_1707580800000"` format |
| `charges.token`    | Valid delivery token | May be `"GUEST_DELIVERY_*"`    |

---

## 2. Backend Logic Implementation

### Node.js/Express Example

```javascript
// controllers/orderController.js

async function createOrder(req, res) {
  try {
    const orderData = req.body;

    // ============================================
    // STEP 1: Detect Guest Order
    // ============================================
    const isGuestOrder =
      !orderData.user_id ||
      orderData.is_guest === true ||
      orderData.address?.is_guest === true;

    console.log("Order type:", isGuestOrder ? "GUEST" : "AUTHENTICATED");

    // ============================================
    // STEP 2: Guest-Specific Validation
    // ============================================
    if (isGuestOrder) {
      // Require guest email
      if (!orderData.guest_email) {
        return res.status(400).json({
          status: false,
          message: "Guest email is required for guest orders",
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(orderData.guest_email)) {
        return res.status(400).json({
          status: false,
          message: "Invalid guest email format",
        });
      }

      // Validate guest address has required fields
      const address = orderData.address;
      if (!address?.full_name || !address?.phone_no || !address?.full_address) {
        return res.status(400).json({
          status: false,
          message:
            "Guest address missing required fields (full_name, phone_no, full_address)",
        });
      }

      // Handle guest delivery token
      const isGuestDeliveryToken =
        orderData.charges?.token?.startsWith("GUEST_DELIVERY_");
      if (isGuestDeliveryToken) {
        // Option 1: Accept the token and use provided delivery charge
        console.log("Guest delivery token detected, using provided charges");

        // Option 2: Recalculate delivery charge server-side
        // const recalculatedCharge = await calculateDelivery(orderData.address, orderData.cart);
        // orderData.charges.details = { totalCharge: recalculatedCharge };
      }
    }

    // ============================================
    // STEP 3: Payment Verification
    // ============================================
    if (orderData.payment?.type === "Pay Online" && orderData.payment?.ref) {
      // Verify payment using reference only (works for both guest and authenticated)
      const paymentVerified = await verifyPaystackPayment(
        orderData.payment.ref,
      );
      if (!paymentVerified) {
        return res.status(400).json({
          status: false,
          message: "Payment verification failed",
        });
      }
    }

    // ============================================
    // STEP 4: Validate Cart
    // ============================================
    if (
      !orderData.cart ||
      !Array.isArray(orderData.cart) ||
      orderData.cart.length === 0
    ) {
      return res.status(400).json({
        status: false,
        message: "Cart is empty or invalid",
      });
    }

    // ============================================
    // STEP 5: Create Orders (Multi-Seller Support)
    // ============================================
    const orders = [];

    // Group cart items by store
    const storeGroups = groupByStore(orderData.cart);

    for (const [storeId, items] of Object.entries(storeGroups)) {
      const orderTotal = items.reduce(
        (sum, item) => sum + (item.totalPrice || 0),
        0,
      );
      const deliveryCharge = orderData.charges?.details?.totalCharge || 0;

      // Create order record
      const newOrder = await Order.create({
        // Standard order fields
        store_id: storeId,
        total: orderTotal,
        delivery_charge: deliveryCharge,
        grand_total: orderTotal + deliveryCharge,
        payment_reference: orderData.payment?.ref,
        payment_type: orderData.payment?.type,
        payment_status: orderData.payment?.status || "pending",
        status: "Confirmed",

        // Address - store as JSON for flexibility
        delivery_address: JSON.stringify(orderData.address),
        state_id: orderData.address?.state_id,

        // User fields - NULL for guests
        user_id: isGuestOrder ? null : orderData.user_id,

        // Guest-specific fields
        is_guest_order: isGuestOrder,
        guest_email: isGuestOrder ? orderData.guest_email : null,
        guest_name: isGuestOrder ? orderData.address?.full_name : null,
        guest_phone: isGuestOrder ? orderData.address?.phone_no : null,

        created_at: new Date(),
      });

      // Create order items
      const orderItems = [];
      for (const item of items) {
        const orderItem = await OrderItem.create({
          order_id: newOrder.id,
          product_id: item.id || item.productId,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price || item.totalPrice / item.quantity,
          total_price: item.totalPrice,
          store_id: item.storeId || item.store_id,
        });
        orderItems.push(orderItem);
      }

      orders.push({
        orderId: newOrder.id,
        _id: newOrder.id,
        storeId: storeId,
        newOrder: {
          status: "Confirmed",
          total: orderTotal,
          grandTotal: newOrder.grand_total,
          deliveryCharge: deliveryCharge,
          discount: 0,
          tax: 0,
          reason: null,
        },
        orderItems: items.map((item) => ({
          id: item.id || item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price || item.totalPrice / item.quantity,
          totalPrice: item.totalPrice,
          image: item.image,
        })),
      });
    }

    // ============================================
    // STEP 6: Send Notifications
    // ============================================

    // Send confirmation email
    if (isGuestOrder) {
      await sendGuestOrderConfirmationEmail(
        orderData.guest_email,
        orders,
        orderData.address,
      );
    } else {
      await sendOrderConfirmationEmail(orderData.user_id, orders);
    }

    // Notify sellers
    for (const order of orders) {
      await notifySeller(order.storeId, order, isGuestOrder);
    }

    // ============================================
    // STEP 7: Return Success Response
    // ============================================
    return res.status(200).json({
      status: true,
      message: "Order created successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to create order",
    });
  }
}

// ============================================
// Helper Functions
// ============================================

function groupByStore(cart) {
  return cart.reduce((groups, item) => {
    const storeId = item.storeId || item.store_id || "default";
    if (!groups[storeId]) {
      groups[storeId] = [];
    }
    groups[storeId].push(item);
    return groups;
  }, {});
}

async function verifyPaystackPayment(reference) {
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );
    const data = await response.json();
    return data.status && data.data.status === "success";
  } catch (error) {
    console.error("Payment verification error:", error);
    return false;
  }
}

async function sendGuestOrderConfirmationEmail(email, orders, address) {
  // Implement email sending logic
  const emailContent = {
    to: email,
    subject: "Order Confirmation - Alaba Marketplace",
    body: `
      Dear ${address.full_name},
      
      Thank you for your order!
      
      Order Reference: ${orders[0]?.orderId}
      Total Amount: ₦${orders.reduce((sum, o) => sum + o.newOrder.grandTotal, 0).toLocaleString()}
      
      Delivery Address: ${address.full_address}
      
      You can track your order using this reference number.
      
      Thank you for shopping with us!
    `,
  };

  // Send email using your email service
  await emailService.send(emailContent);
}

module.exports = { createOrder };
```

---

## 3. Database Schema Changes

### SQL Migrations

```sql
-- ============================================
-- Add guest order columns to orders table
-- ============================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_guest_order BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255) NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255) NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(50) NULL;

-- ============================================
-- Create indexes for efficient lookups
-- ============================================

-- Index for finding guest orders by email
CREATE INDEX IF NOT EXISTS idx_orders_guest_email
ON orders(guest_email)
WHERE is_guest_order = TRUE;

-- Index for finding orders by payment reference (used for tracking)
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference
ON orders(payment_reference);

-- Index for filtering guest orders
CREATE INDEX IF NOT EXISTS idx_orders_is_guest
ON orders(is_guest_order);
```

### Prisma Schema (if using Prisma)

```prisma
model Order {
  id                Int       @id @default(autoincrement())
  store_id          Int
  user_id           Int?      // Nullable for guest orders
  total             Decimal
  delivery_charge   Decimal
  grand_total       Decimal
  payment_reference String?
  payment_type      String
  payment_status    String
  status            String    @default("Confirmed")
  delivery_address  Json

  // Guest order fields
  is_guest_order    Boolean   @default(false)
  guest_email       String?
  guest_name        String?
  guest_phone       String?

  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt

  // Relations
  user              User?     @relation(fields: [user_id], references: [id])
  store             Store     @relation(fields: [store_id], references: [id])
  order_items       OrderItem[]

  @@index([guest_email])
  @@index([payment_reference])
  @@index([is_guest_order])
}
```

---

## 4. Response Format

### Success Response (Expected by Frontend)

```json
{
  "status": true,
  "message": "Order created successfully",
  "data": [
    {
      "orderId": "ORD_12345",
      "_id": "ORD_12345",
      "storeId": 456,
      "newOrder": {
        "status": "Confirmed",
        "total": 10000,
        "grandTotal": 12000,
        "deliveryCharge": 2000,
        "discount": 0,
        "tax": 0,
        "reason": null
      },
      "orderItems": [
        {
          "id": 123,
          "name": "Product Name",
          "quantity": 2,
          "price": 5000,
          "totalPrice": 10000,
          "image": "https://..."
        }
      ]
    }
  ]
}
```

### Error Response

```json
{
  "status": false,
  "message": "Guest email is required for guest orders",
  "description": "Please provide a valid email address"
}
```

---

## 5. Checklist

### Required Changes

- [ ] Accept `user_id: null` without throwing error
- [ ] Detect guest orders via `is_guest`, `address.is_guest`, or missing `user_id`
- [ ] Require and validate `guest_email` for guest orders
- [ ] Accept guest address IDs (format: `guest_*`)
- [ ] Accept `GUEST_DELIVERY_*` tokens (skip validation or recalculate)
- [ ] Store guest info in dedicated columns
- [ ] Return proper response format for frontend

### Notifications

- [ ] Send order confirmation email to `guest_email`
- [ ] Include tracking reference in email
- [ ] Notify sellers about new orders (same as authenticated)
- [ ] Send order status updates to guest email

### Admin Panel

- [ ] Display guest orders in order list
- [ ] Show guest info (email, name, phone) instead of user info
- [ ] Allow sellers to view and manage guest orders
- [ ] Enable order status updates for guest orders

---

## 6. Common Issues & Solutions

### Issue: 500 Error on Guest Order

**Cause:** Backend trying to look up user with `user_id: null`

**Solution:**

```javascript
// Before
const user = await User.findById(orderData.user_id); // Fails when null

// After
let user = null;
if (orderData.user_id) {
  user = await User.findById(orderData.user_id);
}
```

### Issue: Address Validation Failing

**Cause:** Trying to find address in database with guest ID

**Solution:**

```javascript
// Before
const address = await Address.findById(orderData.address.id); // Fails for "guest_*"

// After
const isGuestAddress = String(orderData.address.id).startsWith("guest_");
const address = isGuestAddress
  ? orderData.address // Use address from payload
  : await Address.findById(orderData.address.id);
```

### Issue: Delivery Token Validation Failing

**Cause:** Guest tokens not recognized

**Solution:**

```javascript
// Accept guest delivery tokens
const isGuestToken = orderData.charges?.token?.startsWith("GUEST_DELIVERY_");
if (isGuestToken) {
  // Use default or recalculate delivery charge
  deliveryCharge = orderData.charges?.details?.totalCharge || 2000;
} else {
  // Normal token validation
  deliveryCharge = await validateDeliveryToken(orderData.charges.token);
}
```

---

## 7. Testing

### Test Cases

1. **Guest order with valid data** - Should succeed
2. **Guest order without email** - Should fail with 400
3. **Guest order with invalid email** - Should fail with 400
4. **Guest order with missing address fields** - Should fail with 400
5. **Guest order with GUEST_DELIVERY token** - Should succeed
6. **Multi-seller guest order** - Should create multiple orders
7. **Guest order appears in admin panel** - Should be visible
8. **Guest receives confirmation email** - Should receive email

### Sample cURL Test

```bash
curl -X POST https://development.alabamarketplace.ng/backend/order/ \
  -H "Content-Type: application/json" \
  -d '{
    "payment": {
      "ref": "TEST_ORDER_123",
      "type": "Pay Online",
      "status": "success"
    },
    "cart": [
      {
        "id": 1,
        "name": "Test Product",
        "quantity": 1,
        "totalPrice": 5000,
        "storeId": 1
      }
    ],
    "address": {
      "id": "guest_test",
      "full_name": "Test User",
      "phone_no": "08012345678",
      "full_address": "123 Test Street",
      "state_id": 25,
      "is_guest": true
    },
    "charges": {
      "token": "GUEST_DELIVERY_TEST"
    },
    "user_id": null,
    "is_guest": true,
    "guest_email": "test@example.com"
  }'
```

---

## 8. Related Documentation

- [GUEST_CHECKOUT_BACKEND_REQUIREMENTS.md](./GUEST_CHECKOUT_BACKEND_REQUIREMENTS.md) - Full guest checkout requirements
- [paystack-split-payment-backend.md](./paystack-split-payment-backend.md) - Split payment implementation

---

_Last updated: February 11, 2026_
