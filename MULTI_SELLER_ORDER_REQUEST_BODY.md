# Multi-Seller Order Request Body Structure

**Endpoint**: `POST /order/`
**Date**: February 16, 2026
**Purpose**: Shows exact request body sent to backend for multi-seller orders

---

## Table of Contents

1. [Authenticated User Request Body](#authenticated-user-request-body)
2. [Guest User Request Body](#guest-user-request-body)
3. [Example with Real Data](#example-with-real-data)
4. [Key Fields Explained](#key-fields-explained)

---

## 1. Authenticated User Request Body

### Structure

```typescript
{
  // Multi-seller flags (added by frontend)
  is_multi_seller: boolean,        // true if cart has items from multiple stores
  stores: number[],                // [123, 456] - Array of unique store IDs
  store_allocations: [             // Per-store breakdown
    {
      store_id: number,            // 123
      product_amount: number,      // 5000 (in Naira)
      item_count: number           // 2 (number of items for this store)
    },
    {
      store_id: number,            // 456
      product_amount: number,      // 8000
      item_count: number           // 3
    }
  ],

  // Payment information (verified Paystack payment)
  payment: {
    ref: string,                   // "ORDER_1707580800000_ABC123" (Paystack reference)
    type: string,                  // "Pay Online" or "paystack"
    status: string,                // "success"
    amount: number,                // 1300000 (in kobo, 13,000 Naira)
    gateway_response: string,      // "Successful"
    verified: boolean,             // true
    verified_at: string,           // "2026-02-16T10:30:00.000Z"
    split_payment: boolean,        // true for multi-seller
    is_multi_seller: boolean       // true for multi-seller
  },

  // Shopping cart items (ALL items from ALL stores)
  cart: [
    {
      id: number,                  // Cart item ID
      productId: number,           // Product ID
      product_id: number,          // Product ID (duplicate for backend compatibility)
      store_id: number,            // 123 (Store A)
      storeId: number,             // 123 (duplicate)
      name: string,                // "Samsung Galaxy S24"
      quantity: number,            // 1
      price: number,               // 5000 (unit price)
      totalPrice: number,          // 5000 (quantity * price)
      weight: number,              // 0.5 (in kg)
      image: string,               // Product image URL
      variantId: number | null,    // Product variant ID if applicable
      combination: string | null,  // "Color: Blue, Size: 128GB"
      // ... other product fields
    },
    {
      id: number,
      productId: number,
      product_id: number,
      store_id: number,            // 456 (Store B)
      storeId: number,             // 456
      name: string,                // "iPhone 15 Pro"
      quantity: number,            // 1
      price: number,               // 3000
      totalPrice: number,          // 3000
      weight: number,              // 0.4
      image: string,
      variantId: number | null,
      combination: string | null,
    },
    {
      id: number,
      productId: number,
      product_id: number,
      store_id: number,            // 456 (Store B - same store as above)
      storeId: number,             // 456
      name: string,                // "AirPods Pro"
      quantity: number,            // 2
      price: number,               // 2500
      totalPrice: number,          // 5000 (2 * 2500)
      weight: number,              // 0.2
      image: string,
      variantId: number | null,
      combination: string | null,
    }
  ],

  // Delivery address
  address: {
    id: number,                    // Address ID (if saved address)
    user_id: number,               // User ID
    full_name: string,             // "John Doe"
    phone_no: string,              // "08012345678"
    country_code: string,          // "+234"
    full_address: string,          // "123 Main Street, Apartment 4B"
    city: string,                  // "Lagos"
    state: string,                 // "Lagos"
    state_id: number,              // 25
    country: string,               // "Nigeria"
    country_id: number,            // 160
    postal_code: string,           // "100001"
    landmark: string,              // "Near Shoprite"
    address_type: string,          // "Home" or "Office"
    latitude: number | null,       // 6.5244
    longitude: number | null,      // 3.3792
    is_default: boolean            // true
  },

  // Delivery charges
  charges: {
    token: string,                 // Delivery calculation token from API
    totalCharge: number,           // 2500 (total delivery fee in Naira)
    breakdown: [                   // Per-store delivery breakdown
      {
        store_id: number,          // 123
        charge: number,            // 1200
        distance: number,          // 5.2 (km)
        weight: number             // 0.5 (kg)
      },
      {
        store_id: number,          // 456
        charge: number,            // 1300
        distance: number,          // 5.2
        weight: number             // 0.6
      }
    ],
    estimated_days: number | null  // 2-3 days
  },

  // User information
  user_id: number,                 // 789
  userId: number,                  // 789 (duplicate for compatibility)
  user: {
    id: number,                    // 789
    name: string,                  // "John Doe"
    first_name: string,            // "John"
    last_name: string,             // "Doe"
    email: string,                 // "john@example.com"
    phone: string,                 // "08012345678"
    countrycode: string,           // "+234"
    type: string,                  // "user"
    role: string | null            // null or "user"
  }
}
```

---

## 2. Guest User Request Body

**Note**: Guest orders use a different structure but contain the same essential information.

### Structure

```typescript
{
  // Guest user information
  guest_info: {
    email: string,                 // "guest@example.com"
    first_name: string,            // "Guest"
    last_name: string,             // "User"
    phone: string,                 // "08012345678"
    country_code: string           // "+234"
  },

  // Cart items (normalized structure)
  cart_items: [
    {
      product_id: number,          // 101
      product_name: string,        // "Samsung Galaxy S24"
      variant_id: number | null,   // null or variant ID
      variant_name: string | null, // "Color: Blue, Size: 128GB"
      quantity: number,            // 1
      store_id: number,            // 123
      weight: number,              // 0.5
      unit_price: number,          // 5000
      total_price: number,         // 5000
      image: string | null         // Product image URL
    },
    {
      product_id: number,          // 202
      product_name: string,        // "iPhone 15 Pro"
      variant_id: number | null,
      variant_name: string | null,
      quantity: number,            // 1
      store_id: number,            // 456
      weight: number,              // 0.4
      unit_price: number,          // 3000
      total_price: number,         // 3000
      image: string | null
    },
    {
      product_id: number,          // 203
      product_name: string,        // "AirPods Pro"
      variant_id: number | null,
      variant_name: string | null,
      quantity: number,            // 2
      store_id: number,            // 456
      weight: number,              // 0.2
      unit_price: number,          // 2500
      total_price: number,         // 5000
      image: string | null
    }
  ],

  // Delivery address
  delivery_address: {
    full_name: string,             // "Guest User"
    phone_no: string,              // "08012345678"
    country_code: string,          // "+234"
    full_address: string,          // "123 Main Street"
    city: string,                  // "Lagos"
    state: string,                 // "Lagos"
    state_id: number,              // 25
    country: string,               // "Nigeria"
    country_id: number,            // 160
    landmark: string | null,       // "Near Shoprite"
    address_type: string | null    // "Home"
  },

  // Delivery information
  delivery: {
    delivery_token: string,        // Delivery calculation token
    delivery_charge: number,       // 2500 (in Naira)
    total_weight: number,          // 1.1 (sum of all item weights)
    estimated_delivery_days: number | null  // 2
  },

  // Payment information
  payment: {
    payment_reference: string,     // "ORDER_1707580800000_ABC123"
    payment_method: string,        // "paystack"
    transaction_reference: string, // "ORDER_1707580800000_ABC123"
    amount_paid: number,           // 1300000 (in kobo)
    payment_status: string,        // "success"
    paid_at: string                // "2026-02-16T10:30:00.000Z"
  },

  // Order summary
  order_summary: {
    subtotal: number,              // 13000 (sum of all item prices)
    delivery_fee: number,          // 2500
    tax: number,                   // 0
    discount: number,              // 0
    total: number                  // 15500 (subtotal + delivery)
  },

  // Metadata
  metadata: {
    order_notes: string,           // ""
    preferred_delivery_time: string | null,  // null
    source: string,                // "web_app"
    device_id: string              // ""
  },

  // Multi-seller flag
  is_multi_seller: boolean         // true
}
```

---

## 3. Example with Real Data

### Scenario
- **Customer**: John Doe (Authenticated User, ID: 789)
- **Cart**:
  1. Samsung Galaxy S24 from **Store 123** (TechMart) - ₦850,000
  2. iPhone 15 Pro from **Store 456** (GadgetHub) - ₦1,200,000
  3. AirPods Pro (x2) from **Store 456** (GadgetHub) - ₦250,000 each = ₦500,000
- **Total Products**: ₦2,550,000
- **Delivery**: ₦2,500
- **Grand Total**: ₦2,552,500

### Actual Request Body (Authenticated)

```json
{
  "is_multi_seller": true,
  "stores": [123, 456],
  "store_allocations": [
    {
      "store_id": 123,
      "product_amount": 850000,
      "item_count": 1
    },
    {
      "store_id": 456,
      "product_amount": 1700000,
      "item_count": 2
    }
  ],
  "payment": {
    "ref": "ORDER_1739708400000_K7M9P2",
    "type": "Pay Online",
    "status": "success",
    "amount": 255250000,
    "gateway_response": "Successful",
    "verified": true,
    "verified_at": "2026-02-16T14:30:45.123Z",
    "split_payment": true,
    "is_multi_seller": true
  },
  "cart": [
    {
      "id": 4501,
      "productId": 101,
      "product_id": 101,
      "store_id": 123,
      "storeId": 123,
      "name": "Samsung Galaxy S24 Ultra 256GB",
      "quantity": 1,
      "price": 850000,
      "totalPrice": 850000,
      "weight": 0.234,
      "image": "https://cdn.alabamart.com/products/samsung-s24-ultra.jpg",
      "variantId": 1001,
      "combination": "Color: Titanium Black, Storage: 256GB",
      "sku": "SAMS24U-256-BLK",
      "category": "Smartphones",
      "brand": "Samsung"
    },
    {
      "id": 4502,
      "productId": 202,
      "product_id": 202,
      "store_id": 456,
      "storeId": 456,
      "name": "iPhone 15 Pro Max 512GB",
      "quantity": 1,
      "price": 1200000,
      "totalPrice": 1200000,
      "weight": 0.221,
      "image": "https://cdn.alabamart.com/products/iphone-15-pro-max.jpg",
      "variantId": 2001,
      "combination": "Color: Natural Titanium, Storage: 512GB",
      "sku": "IP15PM-512-NAT",
      "category": "Smartphones",
      "brand": "Apple"
    },
    {
      "id": 4503,
      "productId": 203,
      "product_id": 203,
      "store_id": 456,
      "storeId": 456,
      "name": "Apple AirPods Pro (2nd Gen) with USB-C",
      "quantity": 2,
      "price": 250000,
      "totalPrice": 500000,
      "weight": 0.05,
      "image": "https://cdn.alabamart.com/products/airpods-pro-2.jpg",
      "variantId": null,
      "combination": null,
      "sku": "APP2-USBC-WHT",
      "category": "Audio",
      "brand": "Apple"
    }
  ],
  "address": {
    "id": 567,
    "user_id": 789,
    "full_name": "John Doe",
    "phone_no": "08123456789",
    "country_code": "+234",
    "full_address": "15 Admiralty Way, Lekki Phase 1",
    "city": "Lagos",
    "state": "Lagos",
    "state_id": 25,
    "country": "Nigeria",
    "country_id": 160,
    "postal_code": "101245",
    "landmark": "Near Landmark Beach Resort",
    "address_type": "Home",
    "latitude": 6.4474,
    "longitude": 3.4739,
    "is_default": true
  },
  "charges": {
    "token": "DEL_TOK_1739708350000_ABC123",
    "totalCharge": 2500,
    "breakdown": [
      {
        "store_id": 123,
        "charge": 1200,
        "distance": 5.2,
        "weight": 0.234
      },
      {
        "store_id": 456,
        "charge": 1300,
        "distance": 5.2,
        "weight": 0.271
      }
    ],
    "estimated_days": 2
  },
  "user_id": 789,
  "userId": 789,
  "user": {
    "id": 789,
    "name": "John Doe",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "08123456789",
    "countrycode": "+234",
    "image": "https://cdn.alabamart.com/users/789.jpg",
    "type": "user",
    "role": null,
    "mail_verify": true,
    "phone_verify": true,
    "status": true
  }
}
```

### Console Logs You'll See

When this request is sent, the frontend logs:

```javascript
🧾 ORDER GROUPING DIAGNOSTICS
Stores: [123, 456]
Allocations: [
  { store_id: 123, product_amount: 850000, item_count: 1 },
  { store_id: 456, product_amount: 1700000, item_count: 2 }
]
Items per store: [
  { store_id: 123, items: 1 },
  { store_id: 456, items: 2 }
]
Submitting order with payment amount: 255250000
Verifying payment with reference: ORDER_1739708400000_K7M9P2
Payment verification response: { status: true, data: { ... } }
```

---

## 4. Key Fields Explained

### 4.1 Multi-Seller Indicators

```typescript
{
  is_multi_seller: true,           // Backend should create multiple orders
  stores: [123, 456],              // List of unique store IDs
  store_allocations: [...]         // Per-store breakdown for validation
}
```

**Purpose**: These fields tell the backend:
- This is a multi-seller order
- Create ONE order per store (2 orders in this case)
- Each order should contain only items from that store

### 4.2 Payment Reference

```typescript
{
  payment: {
    ref: "ORDER_1739708400000_K7M9P2"  // ✅ CRITICAL: Same for all orders
  }
}
```

**Purpose**:
- Links all orders to the same Paystack payment
- Backend uses this to verify payment was successful
- All orders for this cart share the same `paymentRef`
- Each order gets a unique `orderId` (backend-generated)

**After Fix** (from our changes):
- ✅ This is now the actual Paystack reference from URL callback
- ✅ Previously was incorrectly generating `ps_${uuidv4()}`

### 4.3 Cart Array

```typescript
{
  cart: [
    { store_id: 123, ... },        // Item from Store A
    { store_id: 456, ... },        // Item from Store B
    { store_id: 456, ... }         // Another item from Store B
  ]
}
```

**Purpose**:
- Backend groups items by `store_id`
- Creates Order 1: Items with `store_id: 123`
- Creates Order 2: Items with `store_id: 456`

**Backend Should Do**:
```javascript
const storeGroups = {};
cart.forEach((item) => {
  if (!storeGroups[item.store_id]) storeGroups[item.store_id] = [];
  storeGroups[item.store_id].push(item);
});
// storeGroups = {
//   123: [item1],
//   456: [item2, item3]
// }

// Create one order per group
for (const [storeId, items] of Object.entries(storeGroups)) {
  await Order.create({
    store_id: storeId,
    paymentRef: payment.ref,  // Same for all orders
    // ... add all items for this store
  });
}
```

### 4.4 Store Allocations

```typescript
{
  store_allocations: [
    {
      store_id: 123,
      product_amount: 850000,     // Total for Store 123
      item_count: 1               // Number of items
    },
    {
      store_id: 456,
      product_amount: 1700000,    // Total for Store 456
      item_count: 2               // Number of items
    }
  ]
}
```

**Purpose**:
- Helps backend validate order totals
- Backend can verify: Sum of cart items for store_id 123 = 850,000
- Optional but helpful for auditing

### 4.5 Delivery Charges

```typescript
{
  charges: {
    token: "DEL_TOK_...",          // Delivery calculation token (for verification)
    totalCharge: 2500,             // Total delivery for all orders
    breakdown: [                   // Per-store breakdown
      { store_id: 123, charge: 1200 },
      { store_id: 456, charge: 1300 }
    ]
  }
}
```

**Purpose**:
- Backend adds delivery charge to each order's grand total
- Order 1 (Store 123): ₦850,000 + ₦1,200 = ₦851,200
- Order 2 (Store 456): ₦1,700,000 + ₦1,300 = ₦1,701,300

---

## Expected Backend Response

After processing the multi-seller order, backend should return:

```json
{
  "status": true,
  "message": "Successfully created 2 order(s)",
  "data": [
    {
      "orderId": 10001,
      "storeId": 123,
      "newOrder": {
        "id": 10001,
        "store_id": 123,
        "user_id": 789,
        "paymentRef": "ORDER_1739708400000_K7M9P2",
        "status": "Confirmed",
        "total": 850000,
        "delivery_charge": 1200,
        "grandTotal": 851200,
        "created_at": "2026-02-16T14:30:50.000Z"
      },
      "orderItems": [
        {
          "id": 20001,
          "order_id": 10001,
          "product_id": 101,
          "product_name": "Samsung Galaxy S24 Ultra 256GB",
          "quantity": 1,
          "unit_price": 850000,
          "total_price": 850000,
          "variant_id": 1001,
          "variant_name": "Color: Titanium Black, Storage: 256GB"
        }
      ]
    },
    {
      "orderId": 10002,
      "storeId": 456,
      "newOrder": {
        "id": 10002,
        "store_id": 456,
        "user_id": 789,
        "paymentRef": "ORDER_1739708400000_K7M9P2",
        "status": "Confirmed",
        "total": 1700000,
        "delivery_charge": 1300,
        "grandTotal": 1701300,
        "created_at": "2026-02-16T14:30:50.000Z"
      },
      "orderItems": [
        {
          "id": 20002,
          "order_id": 10002,
          "product_id": 202,
          "product_name": "iPhone 15 Pro Max 512GB",
          "quantity": 1,
          "unit_price": 1200000,
          "total_price": 1200000,
          "variant_id": 2001,
          "variant_name": "Color: Natural Titanium, Storage: 512GB"
        },
        {
          "id": 20003,
          "order_id": 10002,
          "product_id": 203,
          "product_name": "Apple AirPods Pro (2nd Gen) with USB-C",
          "quantity": 2,
          "unit_price": 250000,
          "total_price": 500000,
          "variant_id": null,
          "variant_name": null
        }
      ]
    }
  ]
}
```

### Key Points in Response:

1. **Array of Orders**: `data` is an array with 2 orders (one per store)
2. **Unique Order IDs**: Each order has unique `orderId` (10001, 10002)
3. **Same Payment Ref**: Both orders share `paymentRef: "ORDER_1739708400000_K7M9P2"`
4. **Store Separation**: Order 1 only has Store 123 items, Order 2 only has Store 456 items
5. **Order Items**: Each order has its own `orderItems` array

---

## Database Structure After Creation

### orders table:
```sql
id    | store_id | user_id | paymentRef                  | status    | total   | delivery_charge | grandTotal | created_at
10001 | 123      | 789     | ORDER_1739708400000_K7M9P2 | Confirmed | 850000  | 1200            | 851200     | 2026-02-16 14:30:50
10002 | 456      | 789     | ORDER_1739708400000_K7M9P2 | Confirmed | 1700000 | 1300            | 1701300    | 2026-02-16 14:30:50
```

### order_items table:
```sql
id    | order_id | product_id | product_name                         | quantity | unit_price | total_price | variant_id
20001 | 10001    | 101        | Samsung Galaxy S24 Ultra 256GB      | 1        | 850000     | 850000      | 1001
20002 | 10002    | 202        | iPhone 15 Pro Max 512GB             | 1        | 1200000    | 1200000     | 2001
20003 | 10002    | 203        | Apple AirPods Pro (2nd Gen)         | 2        | 250000     | 500000      | null
```

**Notice**:
- ✅ 2 orders with same `paymentRef` but different `id` (order IDs)
- ✅ 3 order items distributed across the 2 orders by `store_id`
- ✅ Order 10001 has 1 item (Store 123)
- ✅ Order 10002 has 2 items (Store 456)

---

## Testing the Request

### Using cURL:

```bash
curl -X POST https://development.alabamarketplace.ng/backend/order/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "is_multi_seller": true,
    "stores": [123, 456],
    "store_allocations": [
      {
        "store_id": 123,
        "product_amount": 850000,
        "item_count": 1
      },
      {
        "store_id": 456,
        "product_amount": 1700000,
        "item_count": 2
      }
    ],
    "payment": {
      "ref": "ORDER_1739708400000_K7M9P2",
      "type": "Pay Online",
      "status": "success",
      "amount": 255250000,
      "verified": true
    },
    "cart": [
      {
        "product_id": 101,
        "store_id": 123,
        "quantity": 1,
        "totalPrice": 850000,
        "name": "Samsung Galaxy S24 Ultra"
      },
      {
        "product_id": 202,
        "store_id": 456,
        "quantity": 1,
        "totalPrice": 1200000,
        "name": "iPhone 15 Pro Max"
      },
      {
        "product_id": 203,
        "store_id": 456,
        "quantity": 2,
        "totalPrice": 500000,
        "name": "AirPods Pro"
      }
    ],
    "address": { ... },
    "charges": { ... },
    "user_id": 789
  }'
```

---

## Summary

### Request Body Contains:

1. ✅ **Multi-seller flags**: `is_multi_seller`, `stores`, `store_allocations`
2. ✅ **Complete cart**: All items from all stores with `store_id` field
3. ✅ **Payment reference**: Verified Paystack transaction reference
4. ✅ **Delivery charges**: Total and per-store breakdown
5. ✅ **User/Address info**: Customer and delivery details

### Backend Should:

1. ✅ Group cart items by `store_id`
2. ✅ Create ONE order per store
3. ✅ Use same `paymentRef` for all orders
4. ✅ Generate unique `orderId` for each order
5. ✅ Return array of all created orders

### Common Issues:

- ❌ Backend only processing first item: Not grouping by `store_id`
- ❌ "ORDERID Already Used" error: Trying to use `paymentRef` as `orderId`
- ❌ Payment verification failed: Using wrong payment reference

---

**Document End**
