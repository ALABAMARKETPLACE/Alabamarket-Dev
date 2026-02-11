# Split Payment Feature - Backend Requirements

This document outlines the backend API endpoints and infrastructure required to support Paystack split payments with automatic revenue distribution between platform (5%) and sellers (95%).

---

## Overview

The split payment system automatically divides customer payments:

- **Seller**: Receives 95% of their product price
- **Platform**: Receives 5% of product price + 100% of delivery charges

Supports both single-store and multi-store (multi-seller) orders.

---

## Base URL

```
/paystack
```

---

## 1. Initialize Split Payment

### Endpoint

```
POST /paystack/initialize-split
```

### Authentication

**Required** - User must be authenticated (or guest checkout enabled)

### Headers

```
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

#### Single Store Order

```json
{
  "email": "customer@example.com",
  "amount": 1250000,
  "currency": "NGN",
  "reference": "ORDER_1707580800000_ABC123",
  "callback_url": "https://alabamarketplace.ng/checkoutsuccess/2",
  "store_id": 123,
  "split_payment": true,
  "split_config": {
    "seller_percentage": 95,
    "platform_percentage": 5,
    "product_total": 1000000,
    "delivery_charge": 250000,
    "platform_total": 300000,
    "seller_total": 950000
  },
  "metadata": {
    "order_id": "ORDER_1707580800000_ABC123",
    "customer_id": 456,
    "stores": [123],
    "is_multi_seller": false,
    "split_breakdown": {
      "product_total": 1000000,
      "delivery_charge": 250000,
      "seller_percentage": 95,
      "platform_percentage": 5,
      "seller_gets": 950000,
      "platform_gets": 300000
    }
  }
}
```

#### Multi-Store Order

```json
{
  "email": "customer@example.com",
  "amount": 2500000,
  "currency": "NGN",
  "reference": "ORDER_1707580800000_XYZ789",
  "callback_url": "https://alabamarketplace.ng/checkoutsuccess/2",
  "stores": [123, 456, 789],
  "store_allocations": [
    {
      "store_id": 123,
      "product_amount": 1000000,
      "seller_amount": 950000,
      "platform_fee": 50000,
      "item_count": 2
    },
    {
      "store_id": 456,
      "product_amount": 800000,
      "seller_amount": 760000,
      "platform_fee": 40000,
      "item_count": 1
    },
    {
      "store_id": 789,
      "product_amount": 200000,
      "seller_amount": 190000,
      "platform_fee": 10000,
      "item_count": 3
    }
  ],
  "split_payment": true,
  "split_config": {
    "seller_percentage": 95,
    "platform_percentage": 5,
    "product_total": 2000000,
    "delivery_charge": 500000,
    "platform_total": 600000,
    "seller_total": 1900000
  },
  "metadata": {
    "order_id": "ORDER_1707580800000_XYZ789",
    "customer_id": 456,
    "stores": [123, 456, 789],
    "store_allocations": [...],
    "is_multi_seller": true
  }
}
```

### Request Fields

| Field               | Type     | Required | Description                                  |
| ------------------- | -------- | -------- | -------------------------------------------- |
| `email`             | string   | Yes      | Customer email                               |
| `amount`            | number   | Yes      | Total amount in **kobo** (NGN × 100)         |
| `currency`          | string   | No       | Default: "NGN"                               |
| `reference`         | string   | Yes      | Unique order reference                       |
| `callback_url`      | string   | Yes      | URL to redirect after payment                |
| `store_id`          | number   | Single   | Single store ID (for single-store orders)    |
| `stores`            | number[] | Multi    | Array of store IDs (for multi-store orders)  |
| `store_allocations` | array    | Multi    | Per-store breakdown (for multi-store orders) |
| `split_payment`     | boolean  | Yes      | Must be `true` for split payments            |
| `split_config`      | object   | Yes      | Split calculation details                    |
| `metadata`          | object   | No       | Additional order metadata                    |

### Store Allocation Object

| Field            | Type   | Description                              |
| ---------------- | ------ | ---------------------------------------- |
| `store_id`       | number | Store/seller ID                          |
| `product_amount` | number | Store's product total in kobo            |
| `seller_amount`  | number | 95% of product_amount (seller receives)  |
| `platform_fee`   | number | 5% of product_amount (platform receives) |
| `item_count`     | number | Number of items from this store          |

### Split Config Object

| Field                 | Type   | Description                      |
| --------------------- | ------ | -------------------------------- |
| `seller_percentage`   | number | 95                               |
| `platform_percentage` | number | 5                                |
| `product_total`       | number | Total product price in kobo      |
| `delivery_charge`     | number | Delivery charge in kobo          |
| `platform_total`      | number | Platform's total share in kobo   |
| `seller_total`        | number | All sellers' total share in kobo |

### Success Response (200 OK)

```json
{
  "status": true,
  "message": "Payment initialized successfully",
  "data": {
    "authorization_url": "https://checkout.paystack.com/abc123xyz",
    "access_code": "abc123xyz",
    "reference": "ORDER_1707580800000_ABC123"
  }
}
```

### Error Responses

**400 Bad Request - Invalid Store**

```json
{
  "status": false,
  "message": "Invalid store subaccount",
  "code": "INVALID_STORE_SUBACCOUNT"
}
```

**400 Bad Request - Missing Subaccount**

```json
{
  "status": false,
  "message": "Store does not have an active subaccount",
  "code": "NO_SUBACCOUNT"
}
```

### Backend Logic

```javascript
async function initializeSplitPayment(req, res) {
  const {
    email,
    amount,
    reference,
    callback_url,
    store_id,
    stores,
    store_allocations,
    split_payment,
    split_config,
  } = req.body;

  // 1. Validate input
  if (!email || !amount || !reference || !callback_url) {
    return res
      .status(400)
      .json({ status: false, message: "Missing required fields" });
  }

  // 2. Determine if single or multi-store
  const isSingleStore = !!store_id;
  const storeIds = isSingleStore ? [store_id] : stores;

  // 3. Validate all stores have active subaccounts
  const storesData = await Store.findAll({ where: { id: storeIds } });

  for (const store of storesData) {
    if (
      store.subaccount_status !== "active" ||
      !store.paystack_subaccount_code
    ) {
      // Fallback to non-split payment
      return initializeRegularPayment(req, res);
    }
  }

  // 4. Get or create Paystack split for this combination
  const splitCode = await getOrCreatePaystackSplit(storesData, split_config);

  // 5. Initialize Paystack transaction with split
  const paystackResponse = await paystack.transaction.initialize({
    email,
    amount,
    reference,
    callback_url,
    split: splitCode,
    metadata: req.body.metadata,
  });

  // 6. Save transaction record
  await Transaction.create({
    reference,
    amount,
    store_ids: storeIds,
    store_allocations,
    split_code: splitCode,
    status: "pending",
    authorization_url: paystackResponse.data.authorization_url,
  });

  return res.json({
    status: true,
    message: "Payment initialized successfully",
    data: paystackResponse.data,
  });
}
```

---

## 2. Initialize Regular Payment (Fallback)

### Endpoint

```
POST /paystack/initialize
```

### Purpose

Fallback endpoint when seller has no active Paystack subaccount.

### Request Body

```json
{
  "email": "customer@example.com",
  "amount": 1250000,
  "currency": "NGN",
  "reference": "ORDER_1707580800000_ABC123",
  "callback_url": "https://alabamarketplace.ng/checkoutsuccess/2",
  "metadata": {
    "order_id": "ORDER_1707580800000_ABC123",
    "customer_id": 456
  }
}
```

### Success Response

```json
{
  "status": true,
  "message": "Payment initialized successfully",
  "data": {
    "authorization_url": "https://checkout.paystack.com/xyz789",
    "access_code": "xyz789",
    "reference": "ORDER_1707580800000_ABC123"
  }
}
```

---

## 3. Verify Payment

### Endpoint

```
POST /paystack/verify
```

### Request Body

```json
{
  "reference": "ORDER_1707580800000_ABC123"
}
```

### Success Response

```json
{
  "status": true,
  "message": "Payment verified successfully",
  "data": {
    "id": 123456789,
    "status": "success",
    "reference": "ORDER_1707580800000_ABC123",
    "amount": 1250000,
    "currency": "NGN",
    "gateway_response": "Successful",
    "paid_at": "2026-02-10T12:00:00.000Z",
    "channel": "card",
    "fees": 18750,
    "customer": {
      "email": "customer@example.com",
      "customer_code": "CUS_abc123"
    },
    "authorization": {
      "authorization_code": "AUTH_xyz789",
      "card_type": "visa",
      "last4": "4081",
      "bank": "GTBank"
    },
    "split": {
      "split_code": "SPL_abc123",
      "subaccounts": [
        {
          "subaccount_code": "ACCT_seller123",
          "share": 950000
        }
      ]
    }
  }
}
```

### Backend Logic

```javascript
async function verifyPayment(req, res) {
  const { reference } = req.body;

  // 1. Verify with Paystack
  const verification = await paystack.transaction.verify(reference);

  if (verification.data.status !== "success") {
    return res.status(400).json({
      status: false,
      message: "Payment verification failed",
      data: verification.data,
    });
  }

  // 2. Update transaction in DB
  const transaction = await Transaction.findOne({ where: { reference } });
  transaction.status = "success";
  transaction.paystack_id = verification.data.id;
  transaction.paid_at = verification.data.paid_at;
  transaction.fees = verification.data.fees;
  await transaction.save();

  // 3. Record split settlement
  if (transaction.store_allocations) {
    for (const allocation of transaction.store_allocations) {
      await PaymentSplit.create({
        transaction_id: transaction.id,
        store_id: allocation.store_id,
        product_amount: allocation.product_amount,
        seller_amount: allocation.seller_amount,
        platform_fee: allocation.platform_fee,
        status: "completed",
      });
    }
  }

  return res.json({
    status: true,
    message: "Payment verified successfully",
    data: verification.data,
  });
}
```

---

## 4. Webhook Handler

### Endpoint

```
POST /paystack/webhook
```

### Headers

```
x-paystack-signature: <HMAC_SHA512_signature>
```

### Events to Handle

| Event              | Description                        |
| ------------------ | ---------------------------------- |
| `charge.success`   | Payment completed successfully     |
| `transfer.success` | Split transfer to seller completed |
| `transfer.failed`  | Split transfer to seller failed    |
| `refund.processed` | Refund has been processed          |

### Request Body (charge.success)

```json
{
  "event": "charge.success",
  "data": {
    "id": 123456789,
    "reference": "ORDER_1707580800000_ABC123",
    "status": "success",
    "amount": 1250000,
    "currency": "NGN",
    "paid_at": "2026-02-10T12:00:00.000Z",
    "metadata": {
      "order_id": "ORDER_1707580800000_ABC123",
      "stores": [123, 456]
    }
  }
}
```

### Backend Logic

```javascript
async function handleWebhook(req, res) {
  // 1. Validate Paystack signature
  const signature = req.headers["x-paystack-signature"];
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== signature) {
    return res.status(401).json({ message: "Invalid signature" });
  }

  const { event, data } = req.body;

  // 2. Check idempotency
  const existing = await Webhook.findOne({
    where: { reference: data.reference, event },
  });
  if (existing) {
    return res.status(200).json({ message: "Already processed" });
  }

  // 3. Process event
  switch (event) {
    case "charge.success":
      await handleChargeSuccess(data);
      break;
    case "transfer.success":
      await handleTransferSuccess(data);
      break;
    case "transfer.failed":
      await handleTransferFailed(data);
      break;
  }

  // 4. Record webhook
  await Webhook.create({
    event,
    reference: data.reference,
    payload: req.body,
    processed: true,
  });

  return res.status(200).json({ message: "Webhook processed" });
}
```

---

## 5. Refund Payment

### Endpoint

```
POST /paystack/refund
```

### Request Body

```json
{
  "transaction": "ORDER_1707580800000_ABC123",
  "amount": 500000,
  "reason": "Customer requested refund",
  "currency": "NGN"
}
```

### Success Response

```json
{
  "status": true,
  "message": "Refund initiated successfully",
  "data": {
    "transaction": {
      "id": 123456789,
      "reference": "ORDER_1707580800000_ABC123",
      "amount": 1250000
    },
    "amount": 500000,
    "status": "pending",
    "refunded_by": "admin@alabamarketplace.ng"
  }
}
```

---

## Database Schema

### Stores Table (Add/Verify Fields)

```sql
ALTER TABLE stores ADD COLUMN IF NOT EXISTS paystack_subaccount_code VARCHAR(50);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS subaccount_status VARCHAR(20) DEFAULT 'pending';
-- Values: 'pending', 'active', 'inactive'
ALTER TABLE stores ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS account_number VARCHAR(20);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS account_name VARCHAR(200);
```

### Transactions Table

```sql
CREATE TABLE payment_transactions (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(100) UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- in kobo
  currency VARCHAR(3) DEFAULT 'NGN',
  email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  -- Values: 'pending', 'success', 'failed', 'abandoned'

  -- Split payment fields
  is_split_payment BOOLEAN DEFAULT FALSE,
  split_code VARCHAR(50),
  store_ids INTEGER[], -- Array of store IDs
  store_allocations JSONB, -- Detailed breakdown per store

  -- Paystack response data
  paystack_id BIGINT,
  authorization_url TEXT,
  access_code VARCHAR(50),
  gateway_response VARCHAR(255),
  channel VARCHAR(20),
  fees INTEGER,
  paid_at TIMESTAMP,

  -- Order relation
  order_id INTEGER REFERENCES orders(id),
  customer_id INTEGER,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_reference ON payment_transactions(reference);
CREATE INDEX idx_transactions_status ON payment_transactions(status);
CREATE INDEX idx_transactions_order ON payment_transactions(order_id);
```

### Payment Splits Table

```sql
CREATE TABLE payment_splits (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER REFERENCES payment_transactions(id),
  store_id INTEGER REFERENCES stores(id),

  -- Amounts in kobo
  product_amount INTEGER NOT NULL, -- Total product price
  seller_amount INTEGER NOT NULL, -- 95% to seller
  platform_fee INTEGER NOT NULL, -- 5% to platform
  delivery_contribution INTEGER DEFAULT 0, -- Delivery charge portion

  -- Settlement tracking
  status VARCHAR(20) DEFAULT 'pending',
  -- Values: 'pending', 'completed', 'failed'
  seller_settled BOOLEAN DEFAULT FALSE,
  seller_settled_at TIMESTAMP,
  paystack_transfer_code VARCHAR(50),

  -- Percentages used
  seller_percentage INTEGER DEFAULT 95,
  platform_percentage INTEGER DEFAULT 5,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_splits_transaction ON payment_splits(transaction_id);
CREATE INDEX idx_splits_store ON payment_splits(store_id);
CREATE INDEX idx_splits_status ON payment_splits(status);
```

### Paystack Splits Cache Table

```sql
CREATE TABLE paystack_splits (
  id SERIAL PRIMARY KEY,
  split_code VARCHAR(50) UNIQUE NOT NULL, -- Paystack split identifier
  name VARCHAR(100),

  -- Configuration
  type VARCHAR(20) DEFAULT 'percentage',
  currency VARCHAR(3) DEFAULT 'NGN',
  bearer_type VARCHAR(20) DEFAULT 'subaccount',

  -- Subaccount mapping (for single-store splits)
  store_id INTEGER REFERENCES stores(id),
  seller_subaccount_code VARCHAR(50),

  -- Multi-store tracking
  store_ids INTEGER[], -- For multi-seller splits

  -- Percentages
  seller_percentage INTEGER DEFAULT 95,
  platform_percentage INTEGER DEFAULT 5,

  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_paystack_splits_store ON paystack_splits(store_id);
CREATE INDEX idx_paystack_splits_code ON paystack_splits(split_code);
```

### Webhooks Table

```sql
CREATE TABLE webhooks (
  id SERIAL PRIMARY KEY,
  event VARCHAR(50) NOT NULL,
  reference VARCHAR(100),
  payload JSONB,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_webhooks_reference_event ON webhooks(reference, event);
```

---

## Paystack API Integration

### Create Subaccount (Seller Onboarding)

```
POST https://api.paystack.co/subaccount
```

```json
{
  "business_name": "Seller Store Name",
  "settlement_bank": "044",
  "account_number": "0123456789",
  "percentage_charge": 95,
  "description": "Seller subaccount for Store ID 123"
}
```

### Create Split

```
POST https://api.paystack.co/split
```

```json
{
  "name": "Store 123 Split",
  "type": "percentage",
  "currency": "NGN",
  "bearer_type": "subaccount",
  "subaccounts": [{ "subaccount": "ACCT_seller123", "share": 95 }]
}
```

### Initialize Transaction with Split

```
POST https://api.paystack.co/transaction/initialize
```

```json
{
  "email": "customer@example.com",
  "amount": 1250000,
  "reference": "ORDER_123",
  "callback_url": "https://your-site.com/success",
  "split": "SPL_abc123",
  "metadata": {
    "order_id": "ORDER_123",
    "store_id": 123
  }
}
```

### Verify Transaction

```
GET https://api.paystack.co/transaction/verify/:reference
```

---

## Split Calculation Formula

```javascript
// Frontend sends these values calculated as:

const SELLER_PERCENTAGE = 95;
const PLATFORM_PERCENTAGE = 5;

// For each store
const productAmountKobo = productPriceNaira * 100;
const sellerAmountKobo = Math.round(
  (productAmountKobo * SELLER_PERCENTAGE) / 100,
);
const platformFeeKobo = productAmountKobo - sellerAmountKobo;

// Total platform share = 5% of all products + 100% delivery
const platformTotal = sumOfAllPlatformFees + deliveryChargeKobo;

// Verification
assert(sellerTotal + platformTotal === totalAmountKobo);
```

---

## API Endpoints Summary

| Method | Endpoint                           | Auth   | Description                           |
| ------ | ---------------------------------- | ------ | ------------------------------------- |
| POST   | `/paystack/initialize-split`       | Yes\*  | Initialize split payment              |
| POST   | `/paystack/initialize`             | Yes\*  | Initialize regular payment (fallback) |
| POST   | `/paystack/verify`                 | Yes\*  | Verify payment status                 |
| POST   | `/paystack/webhook`                | No\*\* | Handle Paystack webhooks              |
| POST   | `/paystack/refund`                 | Admin  | Process refunds                       |
| GET    | `/paystack/public-key`             | No     | Get Paystack public key               |
| GET    | `/paystack/transaction/:reference` | Yes    | Get transaction details               |
| GET    | `/paystack/transactions`           | Admin  | List all transactions                 |

\* Can be guest checkout (email required)  
\*\* Validated by Paystack signature

---

## Seller Subaccount Management

### Create Subaccount Endpoint

```
POST /sellers/:id/subaccount
```

### Request Body

```json
{
  "business_name": "Seller Business Name",
  "bank_code": "044",
  "account_number": "0123456789"
}
```

### Response

```json
{
  "status": true,
  "message": "Subaccount created successfully",
  "data": {
    "subaccount_code": "ACCT_abc123xyz",
    "business_name": "Seller Business Name",
    "bank_name": "Access Bank",
    "account_number": "0123456789",
    "percentage_charge": 95
  }
}
```

### Backend Logic

```javascript
async function createSellerSubaccount(req, res) {
  const { id } = req.params;
  const { business_name, bank_code, account_number } = req.body;

  // 1. Validate bank account with Paystack
  const validation = await paystack.verification.resolveAccount({
    account_number,
    bank_code,
  });

  if (!validation.status) {
    return res.status(400).json({
      status: false,
      message: "Invalid bank account",
    });
  }

  // 2. Create subaccount on Paystack
  const subaccount = await paystack.subaccount.create({
    business_name,
    settlement_bank: bank_code,
    account_number,
    percentage_charge: 95,
    description: `Seller subaccount for Store ID ${id}`,
  });

  // 3. Update store record
  await Store.update(
    {
      paystack_subaccount_code: subaccount.data.subaccount_code,
      subaccount_status: "active",
      bank_name: validation.data.bank_name,
      account_number,
      account_name: validation.data.account_name,
    },
    {
      where: { id },
    },
  );

  return res.json({
    status: true,
    message: "Subaccount created successfully",
    data: subaccount.data,
  });
}
```

---

## Security Considerations

1. **Secret Key Protection**: Never expose Paystack secret key
2. **Webhook Validation**: Always verify `x-paystack-signature`
3. **Idempotency**: Use reference as idempotency key
4. **Amount Validation**: Verify amounts match order totals
5. **Rate Limiting**: Limit API calls to prevent abuse
6. **HTTPS Only**: All endpoints must use HTTPS

---

## Environment Variables

```env
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
PLATFORM_SUBACCOUNT_CODE=ACCT_platformxxxxxxxx

# Split percentages (can be overridden per transaction)
DEFAULT_SELLER_PERCENTAGE=95
DEFAULT_PLATFORM_PERCENTAGE=5
```

---

## Testing Checklist

- [ ] Single-store split payment initializes correctly
- [ ] Multi-store split payment initializes correctly
- [ ] Fallback to non-split when seller has no subaccount
- [ ] Payment verification updates transaction status
- [ ] Webhook signature validation works
- [ ] Webhook processes charge.success correctly
- [ ] Split amounts are recorded in payment_splits table
- [ ] Refunds work for split payments
- [ ] Admin can view transaction history
- [ ] Seller subaccount creation works
- [ ] Bank account validation works
- [ ] Idempotency prevents duplicate processing

---

## Frontend API Constants

```typescript
// src/config/API.ts
{
  PAYSTACK_INITIALIZE: "paystack/initialize",
  PAYSTACK_INITIALIZE_SPLIT: "paystack/initialize-split",
  PAYSTACK_VERIFY: "paystack/verify",
  PAYSTACK_WEBHOOK: "paystack/webhook",
  PAYSTACK_PUBLIC_KEY: "paystack/public-key",
  PAYSTACK_REFUND: "paystack/refund",
  PAYSTACK_TRANSACTION: "paystack/transaction",
  PAYSTACK_TRANSACTIONS: "paystack/transactions",
  PAYSTACK_SUCCESS: "paystack/success",
  PAYSTACK_CANCEL: "paystack/cancel"
}
```

---

## Error Codes

| Code                       | Description                            | HTTP Status |
| -------------------------- | -------------------------------------- | ----------- |
| `INVALID_AMOUNT`           | Amount is less than minimum (100 kobo) | 400         |
| `INVALID_EMAIL`            | Email format is invalid                | 400         |
| `INVALID_STORE_SUBACCOUNT` | Store subaccount is invalid            | 400         |
| `NO_SUBACCOUNT`            | Store has no active subaccount         | 400         |
| `CHANNEL_NOT_ACTIVE`       | Payment channel unavailable            | 503         |
| `DUPLICATE_REFERENCE`      | Reference already used                 | 409         |
| `VERIFICATION_FAILED`      | Payment verification failed            | 400         |
| `INVALID_SIGNATURE`        | Webhook signature invalid              | 401         |
