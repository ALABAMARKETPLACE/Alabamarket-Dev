# Guest Checkout - Backend Requirements

This document outlines the backend changes required to fully support guest checkout functionality.

---

## Overview

The frontend has been updated to allow users to add products to cart and complete purchases without logging in. However, some backend endpoints currently require authentication. This document details the necessary backend modifications.

---

## 1. Public Delivery Calculation Endpoint

### Current Issue

The existing endpoint `POST /calculate_delivery` requires authentication (returns 401 for guests).

### Required Endpoint

```
POST /calculate_delivery/public
```

### Request Body

```json
{
  "cart": [
    {
      "id": 123,
      "name": "Product Name",
      "quantity": 1,
      "weight": 1,
      "totalPrice": 5000,
      "storeId": 456
    }
  ],
  "address": {
    "id": "guest_1707580800000",
    "full_name": "John Doe",
    "phone_no": "08012345678",
    "full_address": "123 Main Street, Lagos",
    "country_id": 1,
    "state_id": 25,
    "country": "Nigeria",
    "state": "Lagos",
    "is_guest": true
  }
}
```

### Expected Response

```json
{
  "status": true,
  "token": "DELIVERY_TOKEN_ABC123",
  "details": {
    "totalCharge": 2000
  },
  "data": {
    "discount": 0
  },
  "message": "Delivery charge calculated successfully"
}
```

### Notes

- This endpoint should NOT require authentication
- Should validate the address structure (state_id is required for delivery calculation)
- The delivery token should be valid for order creation

---

## 2. Order Creation for Guest Users

### Current Endpoint

```
POST /order
```

### Required Modifications

The order creation endpoint needs to handle guest orders where:

1. **No `user_id`** - Guest orders may have `user_id: null`
2. **Guest Address** - Address object will have `is_guest: true` and an ID like `guest_1707580800000`
3. **Guest Email** - Email for order confirmation should come from the order payload
4. **Guest Delivery Token** - May receive tokens starting with `GUEST_DELIVERY_` if public calculation endpoint is unavailable

### Guest Order Payload Example

```json
{
  "payment": {
    "ref": "ORDER_1707580800000_ABC123",
    "type": "Pay Online",
    "status": "success",
    "verified": true
  },
  "cart": [
    {
      "id": 123,
      "name": "Product Name",
      "quantity": 2,
      "totalPrice": 10000,
      "storeId": 456
    }
  ],
  "address": {
    "id": "guest_1707580800000",
    "full_name": "John Doe",
    "phone_no": "08012345678",
    "country_code": "+234",
    "full_address": "123 Main Street",
    "state_id": 25,
    "country_id": 1,
    "is_guest": true
  },
  "charges": {
    "token": "DELIVERY_TOKEN_ABC123"
  },
  "user_id": null,
  "guest_email": "guest@example.com"
}
```

### Backend Logic Updates

```javascript
// Pseudo-code for order creation
function createOrder(orderData) {
  const isGuestOrder = !orderData.user_id || orderData.address?.is_guest;

  if (isGuestOrder) {
    // 1. Validate guest email exists
    if (!orderData.guest_email) {
      throw new Error("Guest email is required for guest orders");
    }

    // 2. Create temporary guest record or handle guest order differently
    const guestInfo = {
      email: orderData.guest_email,
      name: orderData.address.full_name,
      phone: orderData.address.phone_no
    };

    // 3. Handle guest delivery token validation
    const isGuestDeliveryToken = orderData.charges?.token?.startsWith("GUEST_DELIVERY_");
    if (isGuestDeliveryToken) {
      // Skip server-side token validation, use provided delivery charge
      // Or recalculate delivery charge server-side
    }

    // 4. Create order with guest flag
    const order = await Order.create({
      ...orderData,
      is_guest_order: true,
      guest_email: orderData.guest_email,
      guest_name: orderData.address.full_name,
      guest_phone: orderData.address.phone_no
    });

    // 5. Send order confirmation to guest email
    await sendOrderConfirmationEmail(orderData.guest_email, order);

    return order;
  }

  // ... existing authenticated order logic
}
```

---

## 3. Payment Verification for Guests

### Current Endpoint

```
POST /paystack/verify
```

### Required Modifications

- Should work without authentication (verify by payment reference only)
- The reference contains order info, no user session needed

### Notes

- Payment was already initialized with customer email
- Verification should match reference regardless of authentication status

---

## 4. Database Schema Updates (Recommended)

### Orders Table

Add these columns to support guest orders:

```sql
ALTER TABLE orders ADD COLUMN is_guest_order BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN guest_email VARCHAR(255) NULL;
ALTER TABLE orders ADD COLUMN guest_name VARCHAR(255) NULL;
ALTER TABLE orders ADD COLUMN guest_phone VARCHAR(50) NULL;
```

### Guest Sessions Table (Optional)

For tracking guest carts server-side:

```sql
CREATE TABLE guest_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NULL,
  cart_data JSONB,
  address_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);
```

---

## 5. Email Notifications for Guest Orders

### Order Confirmation Email

Send to `guest_email` containing:

- Order reference number
- Order items summary
- Delivery address
- Total amount paid
- Estimated delivery time
- Support contact information
- Link to track order (using reference number)

### Order Status Updates

Continue sending updates to guest email:

- Order confirmed
- Order shipped
- Out for delivery
- Order delivered

---

## 6. Guest Order Tracking

### New Endpoint (Optional but Recommended)

```
GET /order/track/:reference
```

Allow guests to track their order using the payment reference without authentication.

### Response

```json
{
  "status": true,
  "data": {
    "reference": "ORDER_1707580800000_ABC123",
    "order_status": "shipped",
    "items_count": 2,
    "total_amount": 12000,
    "delivery_address": "123 Main Street, Lagos",
    "estimated_delivery": "2026-02-15",
    "tracking_updates": [
      {
        "status": "Order Placed",
        "timestamp": "2026-02-10T10:00:00Z"
      },
      {
        "status": "Processing",
        "timestamp": "2026-02-10T11:00:00Z"
      },
      {
        "status": "Shipped",
        "timestamp": "2026-02-11T09:00:00Z"
      }
    ]
  }
}
```

---

## 7. Security Considerations

### Rate Limiting

Apply stricter rate limits to public endpoints:

- `/calculate_delivery/public` - Max 10 requests per minute per IP
- `/order/track/:reference` - Max 20 requests per minute per IP

### Input Validation

- Validate all guest input data thoroughly
- Sanitize email addresses
- Validate phone number format
- Ensure address fields are properly formatted

### Fraud Prevention

- Monitor for unusual patterns in guest orders
- Consider requiring email verification for high-value orders
- Implement CAPTCHA for suspicious activity

---

## 8. API Endpoints Summary

| Endpoint                     | Method | Auth Required | Status   |
| ---------------------------- | ------ | ------------- | -------- |
| `/calculate_delivery`        | POST   | Yes           | Existing |
| `/calculate_delivery/public` | POST   | **No**        | **NEW**  |
| `/order`                     | POST   | No\*          | Modify   |
| `/paystack/verify`           | POST   | No            | Verify   |
| `/order/track/:reference`    | GET    | **No**        | **NEW**  |

\*Order endpoint should accept both authenticated and guest orders

---

## 9. Frontend Fallback Behavior

If the public delivery calculation endpoint is not available, the frontend will:

1. Use a default delivery charge of ₦2,000
2. Generate a guest token: `GUEST_DELIVERY_{timestamp}_{random}`
3. Proceed with checkout using estimated delivery

The backend should:

- Accept orders with `GUEST_DELIVERY_*` tokens
- Recalculate actual delivery charge server-side if needed
- Adjust final charge if different from estimate

---

## Implementation Priority

1. **High Priority**
   - Public delivery calculation endpoint
   - Order creation modifications for guests
   - Guest order email notifications

2. **Medium Priority**
   - Guest order tracking endpoint
   - Database schema updates

3. **Low Priority**
   - Guest sessions table
   - Advanced fraud prevention

---

## Testing Checklist

- [ ] Guest can calculate delivery without authentication
- [ ] Guest can complete Paystack payment
- [ ] Guest order is created successfully
- [ ] Guest receives order confirmation email
- [ ] Guest can track order by reference
- [ ] Guest orders appear in admin dashboard
- [ ] Seller receives notification for guest orders
- [ ] Rate limiting works on public endpoints

---

## Questions for Backend Team

1. Should guest orders be stored differently from authenticated orders?
2. What's the retention policy for guest order data?
3. Should we allow guests to create an account post-purchase?
4. How should refunds/returns work for guest orders?
5. Should there be an order value limit for guest checkout?
