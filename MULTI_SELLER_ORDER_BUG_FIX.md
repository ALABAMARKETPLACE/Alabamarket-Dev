# Multi-Seller Order Bug Fix Guide

**Issue**: Multi-seller orders fail with "ORDERID Already Used" error, and only one product is processed despite successful payment.
**Date**: February 16, 2026
**Priority**: CRITICAL - Affects revenue and customer experience

---

## Table of Contents

1. [Problem Summary](#problem-summary)
2. [Root Cause Analysis](#root-cause-analysis)
3. [Frontend Analysis](#frontend-analysis)
4. [Backend Fix Required](#backend-fix-required)
5. [Testing Instructions](#testing-instructions)

---

## 1. Problem Summary

### Symptoms
- ✅ Payment succeeds (Paystack confirms payment)
- ❌ Order creation fails with: "The ORDERID You've choosed is Already Used(177123086578)"
- ❌ Only ONE product is processed from the cart
- ❌ Other products from different sellers are ignored

### Expected Behavior
When a customer has products from multiple sellers in their cart:
1. Payment should be processed once
2. **Multiple orders should be created** (one per seller/store)
3. Each order should contain only items from that specific seller
4. Customer should see all orders in their order history

### Current Broken Behavior
1. Payment is processed successfully ✅
2. Only ONE order is created (for first seller) ❌
3. Other sellers' products are lost ❌
4. If retried, "ORDERID Already Used" error appears ❌

---

## 2. Root Cause Analysis

### The Issue Location
**Backend Order Creation Endpoint**: `POST /order/`

The backend is likely processing only the **first item** in the cart instead of:
1. Grouping cart items by `store_id`
2. Creating separate orders for each store
3. Returning an array of created orders

### Payment Reference Flow

```
Frontend generates unique reference:
ORDER_1707580800000_ABC123

↓

Sent to Paystack with payment data

↓

Payment succeeds, reference stored

↓

Backend receives order creation request with:
- payment.ref: "ORDER_1707580800000_ABC123"
- cart: [item1, item2, item3, ...]
- is_multi_seller: true
- stores: [123, 456]

↓

🐛 BUG HERE: Backend only processes first item
Instead of:
- Group cart by store_id
- Create order for Store 123 with item1
- Create order for Store 456 with item2, item3
- Return array: [order1, order2]

↓

If user retries, backend sees:
"payment.ref already exists in database"
→ Returns "ORDERID Already Used" error
```

---

## 3. Frontend Analysis

### Frontend Implementation Status: ✅ CORRECT

The frontend correctly implements multi-seller order handling:

#### Checkout Page (`src/app/(screens)/checkout/page.tsx`)

**Lines 295-319**: Correctly groups items by store
```typescript
const storeMap = new Map<number, { storeId: number; total: number; items: unknown[] }>();

Checkout?.Checkout?.forEach((item: Record<string, unknown>) => {
  const storeId = (item as { storeId?: number; store_id?: number }).storeId ||
                  (item as { store_id?: number }).store_id;
  if (storeId && !isNaN(storeId) && storeId > 0) {
    const existing = storeMap.get(storeId) || {
      storeId,
      total: 0,
      items: [],
    };
    existing.total += Number(item?.totalPrice || 0);
    existing.items.push(item);
    storeMap.set(storeId, existing);
  }
});

const stores = Array.from(storeMap.values());
const hasMultipleStores = stores.length > 1;
```

**Lines 423-439**: Calculates per-store allocations
```typescript
const storeAllocations = stores.map((s) => {
  const storeProductInKobo = Math.round(s.total * 100);
  const sellerAmountInKobo = Math.round((storeProductInKobo * SELLER_PERCENTAGE) / 100);
  const platformFeeFromStore = storeProductInKobo - sellerAmountInKobo;

  return {
    store_id: s.storeId,
    product_amount: storeProductInKobo,
    seller_amount: sellerAmountInKobo,
    platform_fee: platformFeeFromStore,
    item_count: s.items.length,
  };
});
```

#### Success Page (`src/app/(screens)/checkoutsuccess/[id]/page.tsx`)

**Lines 557-610**: Prepares complete order data with multi-seller flags
```typescript
const isMultiSeller = storeIds.size > 1 || finalOrderData?.payment?.is_multi_seller || false;

finalOrderData.is_multi_seller = isMultiSeller;
finalOrderData.stores = Array.from(storeIds);

// Build store allocations
const allocationMap = new Map();
finalOrderData.cart.forEach((ci: CheckoutCartItem) => {
  const sid = ci.store_id ?? ci.storeId;
  if (sid == null) return;
  const existing = allocationMap.get(sid) || {
    store_id: sid,
    product_amount: 0,
    item_count: 0,
  };
  existing.product_amount += Number(ci.totalPrice ?? 0);
  existing.item_count += 1;
  allocationMap.set(sid, existing);
});
const store_allocations = Array.from(allocationMap.values());
finalOrderData.store_allocations = store_allocations;

// Diagnostics
console.log("🧾 ORDER GROUPING DIAGNOSTICS");
console.log("Stores:", finalOrderData.stores);
console.log("Allocations:", store_allocations);
```

**Lines 823-826**: Sends complete cart to backend
```typescript
response = await POST(API.ORDER, finalOrderData);
// finalOrderData contains:
// - cart: [all items with store_id]
// - is_multi_seller: true
// - stores: [123, 456]
// - store_allocations: [{store_id: 123, ...}, {store_id: 456, ...}]
```

**Lines 833-877**: Expects array of orders in response
```typescript
if (response?.status) {
  const orders = response?.data; // Expects array of orders

  // Check if any order failed
  const anyFailed = Array.isArray(orders) && orders.some(
    (order: Order) =>
      order?.newOrder?.status === "failed" ||
      order?.status === "failed",
  );

  if (anyFailed) {
    // Handle failure
    localStorage.removeItem("paystack_payment_reference");
    // Prevents "ORDERID Already Used" on next attempt
  }

  // Display all orders
  getOrderItems(response?.data);
  setResponseData(response?.data);
}
```

### Frontend Payload Example

The frontend sends this to `POST /order/`:

```json
{
  "is_multi_seller": true,
  "stores": [123, 456],
  "store_allocations": [
    {
      "store_id": 123,
      "product_amount": 5000,
      "item_count": 1
    },
    {
      "store_id": 456,
      "product_amount": 8000,
      "item_count": 2
    }
  ],
  "cart": [
    {
      "product_id": 101,
      "store_id": 123,
      "quantity": 1,
      "totalPrice": 5000,
      "name": "Product A"
    },
    {
      "product_id": 202,
      "store_id": 456,
      "quantity": 1,
      "totalPrice": 3000,
      "name": "Product B"
    },
    {
      "product_id": 203,
      "store_id": 456,
      "quantity": 1,
      "totalPrice": 5000,
      "name": "Product C"
    }
  ],
  "payment": {
    "ref": "ORDER_1707580800000_ABC123",
    "type": "paystack",
    "is_multi_seller": true,
    "split_payment": true
  },
  "address": { ... },
  "user_id": 789
}
```

---

## 4. Backend Fix Required

### Current Buggy Backend Code (Pseudocode)

```javascript
// ❌ WRONG - Only processes first item
router.post('/order/', async (req, res) => {
  const { cart, payment, address, user_id, is_multi_seller } = req.body;

  // Check if payment reference already used
  const existingOrder = await Order.findOne({ paymentRef: payment.ref });
  if (existingOrder) {
    return res.status(400).json({
      status: false,
      message: `The ORDERID You've choosed is Already Used(${payment.ref})`
    });
  }

  // 🐛 BUG: Only processes first item
  const item = cart[0];

  const order = await Order.create({
    user_id: user_id,
    store_id: item.store_id,
    paymentRef: payment.ref,
    total: item.totalPrice,
    status: "Confirmed"
  });

  const orderItem = await OrderItem.create({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.totalPrice
  });

  return res.json({
    status: true,
    data: [{
      orderId: order.id,
      storeId: order.store_id,
      newOrder: order,
      orderItems: [orderItem]
    }]
  });
});
```

### Correct Backend Implementation

```javascript
// ✅ CORRECT - Processes all items grouped by store
router.post('/order/', async (req, res) => {
  const {
    cart,
    payment,
    address,
    user_id,
    is_multi_seller,
    stores,
    store_allocations
  } = req.body;

  try {
    // 1. Check if payment reference already used
    const existingOrders = await Order.findAll({
      where: { paymentRef: payment.ref }
    });

    if (existingOrders.length > 0) {
      // If orders exist and are all completed, return them
      const allCompleted = existingOrders.every(o => o.status === "Confirmed");
      if (allCompleted) {
        // Idempotent response
        const ordersWithItems = await Promise.all(
          existingOrders.map(async (order) => {
            const orderItems = await OrderItem.findAll({
              where: { order_id: order.id }
            });
            return {
              orderId: order.id,
              storeId: order.store_id,
              newOrder: order,
              orderItems: orderItems
            };
          })
        );
        return res.json({ status: true, data: ordersWithItems });
      } else {
        // Pending or failed orders exist
        return res.status(400).json({
          status: false,
          message: `The ORDERID You've choosed is Already Used(${payment.ref}). Previous order is still processing or failed.`
        });
      }
    }

    // 2. Group cart items by store_id
    const storeGroups = {};
    cart.forEach((item) => {
      const storeId = item.store_id || item.storeId;
      if (!storeId) {
        throw new Error(`Cart item missing store_id: ${JSON.stringify(item)}`);
      }
      if (!storeGroups[storeId]) {
        storeGroups[storeId] = [];
      }
      storeGroups[storeId].push(item);
    });

    console.log(`Creating ${Object.keys(storeGroups).length} orders for stores:`, Object.keys(storeGroups));

    // 3. Create one order per store (transaction for atomicity)
    const transaction = await sequelize.transaction();
    const createdOrders = [];

    try {
      for (const [storeId, items] of Object.entries(storeGroups)) {
        // Calculate total for this store
        const storeTotal = items.reduce((sum, item) => {
          return sum + (Number(item.totalPrice) || 0);
        }, 0);

        // Get delivery charge allocation for this store
        const storeAllocation = store_allocations?.find(
          a => a.store_id == storeId
        );
        const deliveryCharge = storeAllocation?.delivery_charge || 0;
        const grandTotal = storeTotal + deliveryCharge;

        // Create order for this store
        const order = await Order.create({
          user_id: user_id,
          store_id: Number(storeId),
          paymentRef: payment.ref,
          payment_type: payment.type,
          total: storeTotal,
          delivery_charge: deliveryCharge,
          grandTotal: grandTotal,
          status: "Confirmed",
          is_multi_seller: is_multi_seller,
          address_id: address.id || null,
          // Store address details
          delivery_address: address.address_line1,
          delivery_city: address.city,
          delivery_state: address.state,
          delivery_country: address.country,
          delivery_postal_code: address.postal_code,
          phone: address.phone_no,
          customer_name: address.full_name || `${user.first_name} ${user.last_name}`,
        }, { transaction });

        // Create order items for this store
        const orderItems = await Promise.all(
          items.map((item) =>
            OrderItem.create({
              order_id: order.id,
              product_id: item.product_id || item.productId,
              product_variant_id: item.variant_id || item.variantId || null,
              quantity: item.quantity,
              unit_price: item.price || (item.totalPrice / item.quantity),
              total_price: item.totalPrice,
              product_name: item.name || item.product_name,
              // Store variant details if available
              variant_name: item.variant_name || null,
              variant_value: item.variant_value || null,
            }, { transaction })
          )
        );

        // Update product inventory
        for (const item of items) {
          await Product.decrement('stock', {
            by: item.quantity,
            where: { id: item.product_id || item.productId },
            transaction
          });
        }

        createdOrders.push({
          orderId: order.id,
          storeId: order.store_id,
          newOrder: {
            id: order.id,
            status: order.status,
            total: order.total,
            delivery_charge: order.delivery_charge,
            grandTotal: order.grandTotal,
            paymentRef: order.paymentRef,
            created_at: order.createdAt,
          },
          orderItems: orderItems.map(oi => ({
            id: oi.id,
            product_id: oi.product_id,
            product_name: oi.product_name,
            quantity: oi.quantity,
            unit_price: oi.unit_price,
            total_price: oi.total_price,
            variant_name: oi.variant_name,
          }))
        });
      }

      // Commit transaction
      await transaction.commit();

      // 4. Send notifications to sellers
      for (const orderData of createdOrders) {
        // Send email/SMS to seller
        await sendSellerNotification(orderData.storeId, orderData.orderId);
      }

      // 5. Send confirmation to customer
      await sendCustomerOrderConfirmation(user_id, createdOrders);

      // 6. Clear customer cart
      if (user_id) {
        await Cart.destroy({ where: { user_id: user_id } });
      }

      // 7. Return all created orders
      return res.json({
        status: true,
        message: `Successfully created ${createdOrders.length} order(s)`,
        data: createdOrders
      });

    } catch (error) {
      // Rollback on error
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({
      status: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});
```

### Key Backend Changes Required

1. **Group cart items by `store_id`**
   ```javascript
   const storeGroups = {};
   cart.forEach((item) => {
     const storeId = item.store_id;
     if (!storeGroups[storeId]) storeGroups[storeId] = [];
     storeGroups[storeId].push(item);
   });
   ```

2. **Create one order per store**
   ```javascript
   for (const [storeId, items] of Object.entries(storeGroups)) {
     const order = await Order.create({ store_id: storeId, ... });
     // Create order items for this order
   }
   ```

3. **Return array of orders**
   ```javascript
   return res.json({
     status: true,
     data: [order1, order2, order3] // One per store
   });
   ```

4. **Use database transaction**
   - Ensures all-or-nothing: either ALL orders are created, or NONE
   - Prevents partial order creation

5. **Improve idempotency check**
   - If payment ref exists and orders are completed, return existing orders
   - Don't create duplicates

---

## 5. Testing Instructions

### Test Scenario 1: Multi-Seller Order

**Setup:**
1. Add Product A from Store 123 (₦5,000)
2. Add Product B from Store 456 (₦3,000)
3. Add Product C from Store 456 (₦5,000)
4. Total: ₦13,000 + delivery

**Expected Result:**
- Payment succeeds
- 2 orders created:
  - Order 1: Store 123, 1 item (Product A), ₦5,000
  - Order 2: Store 456, 2 items (Product B, C), ₦8,000
- Customer sees 2 orders in "My Orders"
- Store 123 seller sees Order 1 in their dashboard
- Store 456 seller sees Order 2 in their dashboard

### Test Scenario 2: Single Seller Order

**Setup:**
1. Add 3 products all from Store 123
2. Total: ₦10,000 + delivery

**Expected Result:**
- Payment succeeds
- 1 order created with 3 items
- Customer sees 1 order
- Store 123 seller sees 1 order with 3 items

### Test Scenario 3: Duplicate Payment Reference

**Setup:**
1. Create order with payment ref "ORDER_123"
2. Try to create another order with same ref "ORDER_123"

**Expected Result:**
- Second attempt returns error: "ORDERID Already Used"
- OR if first order completed, returns existing order (idempotent)

### Backend Testing Checklist

```bash
# Test 1: Multi-seller order
curl -X POST https://development.alabamarketplace.ng/backend/order/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "cart": [
      {"product_id": 101, "store_id": 123, "quantity": 1, "totalPrice": 5000},
      {"product_id": 202, "store_id": 456, "quantity": 1, "totalPrice": 3000},
      {"product_id": 203, "store_id": 456, "quantity": 1, "totalPrice": 5000}
    ],
    "payment": {
      "ref": "TEST_ORDER_1234567890",
      "type": "paystack"
    },
    "is_multi_seller": true,
    "stores": [123, 456],
    "user_id": 789,
    "address": {...}
  }'

# Expected response:
{
  "status": true,
  "data": [
    {
      "orderId": 1001,
      "storeId": 123,
      "newOrder": {"status": "Confirmed", "total": 5000},
      "orderItems": [{"product_id": 101, ...}]
    },
    {
      "orderId": 1002,
      "storeId": 456,
      "newOrder": {"status": "Confirmed", "total": 8000},
      "orderItems": [
        {"product_id": 202, ...},
        {"product_id": 203, ...}
      ]
    }
  ]
}
```

### Database Verification

```sql
-- After creating multi-seller order, verify:

-- Should have 2 orders with same paymentRef
SELECT id, store_id, paymentRef, total, status
FROM orders
WHERE paymentRef = 'ORDER_1707580800000_ABC123';

-- Expected:
-- id | store_id | paymentRef | total | status
-- 1001 | 123 | ORDER_... | 5000 | Confirmed
-- 1002 | 456 | ORDER_... | 8000 | Confirmed

-- Should have 3 order items total
SELECT oi.id, oi.order_id, oi.product_id, o.store_id
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE o.paymentRef = 'ORDER_1707580800000_ABC123';

-- Expected:
-- id | order_id | product_id | store_id
-- 5001 | 1001 | 101 | 123
-- 5002 | 1002 | 202 | 456
-- 5003 | 1002 | 203 | 456
```

---

## Summary

### Issue Root Cause
Backend `POST /order/` endpoint only processes the first cart item instead of grouping by store and creating multiple orders.

### Frontend Status
✅ Frontend implementation is CORRECT
- Properly groups items by store
- Sends complete cart data
- Handles multi-seller flag
- Expects array of orders in response

### Backend Fix Required
❌ Backend needs major refactoring:
1. Group cart items by `store_id`
2. Create one order per store
3. Use database transactions for atomicity
4. Return array of created orders
5. Improve idempotency handling

### Priority
**CRITICAL** - This bug:
- Loses customer orders
- Results in lost revenue for sellers
- Creates poor customer experience
- Requires manual order recreation

### Next Steps
1. Share this document with backend team
2. Backend team implements the fix
3. Test on staging environment
4. Deploy to production
5. Monitor orders for 24 hours
6. Verify no more "ORDERID Already Used" errors

---

**Document End**
