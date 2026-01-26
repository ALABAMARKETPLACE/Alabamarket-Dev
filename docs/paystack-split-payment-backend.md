# Paystack Split Payment (Backend Implementation Guide)

## Overview
- Goal: Automatically split each customer payment between Platform (admin) and Seller (store) — e.g., 5% Platform, 95% Seller.
- Strategies:
  - Subaccount-based split: attach a seller subaccount to a transaction and define who bears fees.
  - Split-object-based split: create a Paystack Split object with percentages and reference it when initializing transactions.
- Recommended: Use Split objects for clear, fixed percentages per transaction and easy auditing; use Subaccounts for seller payouts routing.

## Prerequisites
- Seller onboarding: create and store for each seller:
  - Paystack subaccount_code (receives the seller portion)
  - Seller bank details (validated with Paystack)
- Platform constants:
  - Platform percentage (e.g., 5)
  - Seller percentage (e.g., 95)
- Security:
  - Store Paystack secret key securely
  - Use idempotency keys for transaction init to prevent duplicates

## Data Model
- sellers table: id, name, subaccount_code, bank_name, account_number, percentage_override (optional)
- payment_splits table: id, seller_id, split_id (Paystack split identifier), admin_percentage, seller_percentage, active
- transactions table: id, order_id, seller_id, reference, amount_kobo, status, split_id, authorization_url, payer_email
- webhooks table: id, event, reference, payload_json, processed

## Endpoints
1) POST /paystack/initialize-split
   - Body: { email, amount, currency, reference, callback_url, store_id }
   - Steps:
     - Validate store_id and resolve seller subaccount_code
     - Resolve split_id:
       - If existing split for seller found, reuse
       - Else create a new split object at Paystack: admin=5%, seller=95%, attach seller subaccount
     - Initialize transaction at Paystack with:
       - amount (kobo), email, reference, callback_url
       - split: split_id
     - Persist transaction locally with authorization_url and reference
     - Return authorization_url to the frontend

2) POST /paystack/verify
   - Body: { reference }
   - Steps:
     - Verify with Paystack
     - Update transaction status in DB
     - On success, finalize order, ledger entries:
       - Record platform revenue and seller receivable amounts from split result

3) POST /paystack/webhook
   - Validate Paystack signature
   - Handle charge.success and related events
   - Idempotent processing: check if reference already processed
   - Update transaction and settlement records

## Split Creation Flow
- Create Split (server → Paystack):
  - POST https://api.paystack.co/split
  - Headers: Authorization: Bearer <SECRET_KEY>
  - Body example:
    {
      "name": "Seller 3203 Split",
      "type": "percentage",
      "currency": "NGN",
      "bearer_type": "subaccount",
      "subaccounts": [
        { "subaccount": "<SELLER_SUBACCOUNT_CODE>", "share": 95 },
        { "subaccount": "<PLATFORM_SUBACCOUNT_CODE>", "share": 5 }
      ]
    }
  - Store returned split id
- Update Split (optional):
  - PATCH https://api.paystack.co/split/{split_id}
  - Update shares or add/remove subaccounts if needed

## Transaction Initialization (with Split)
- POST https://api.paystack.co/transaction/initialize
- Headers:
  - Authorization: Bearer <SECRET_KEY>
  - Idempotency-Key: <reference>
- Body:
  {
    "email": "<customer_email>",
    "amount": <amount_in_kobo>,
    "reference": "<ORDER_REFERENCE>",
    "callback_url": "<frontend_callback>",
    "split": "<split_id>",
    "metadata": {
      "order_id": "<ORDER_REFERENCE>",
      "store_id": <store_id>
    }
  }
- Response includes authorization_url; persist it and return to client.

## Verification and Webhook Handling
- Verification:
  - POST https://api.paystack.co/transaction/verify/<reference>
  - Confirm status === "success"
  - Retrieve transaction fees and split settlement details if needed
- Webhook:
  - Validate x-paystack-signature
  - On charge.success:
    - Mark transaction as successful
    - Record platform and seller amounts (from split rules)
    - Trigger order fulfillment

## Settlement and Ledger
- Maintain internal ledger:
  - Entries for platform revenue (admin share)
  - Entries for seller receivable (seller share)
  - Reconcile against Paystack payouts
- Provide admin reporting endpoints:
  - /payment-splits/admin/summary
  - /settlements/history

## Error Handling
- Use idempotency keys on init to avoid duplicates
- Handle common errors:
  - INVALID_AMOUNT / INVALID_EMAIL → 400 with clear messages
  - CHANNEL_NOT_ACTIVE → 503 and guidance
- Log and persist failed attempts for audit

## Security Best Practices
- Do not expose secret keys in frontend
- Validate all incoming data (email, amount, store_id)
- Enforce HTTPS and verify Paystack webhook signatures
- Rate-limit split creation; cache split_id per seller

## Optional: Subaccount-Only Strategy
- If you prefer not to use split objects:
  - Create seller subaccount
  - Initialize transaction with "subaccount": "<SELLER_SUBACCOUNT_CODE>"
  - Use "bearer_type" and subaccount percentage on the subaccount itself
  - Note: percentages are tied to subaccount config; split objects give finer control per transaction.

## Testing Checklist
- Seller without split → creates split → init succeeds → redirects to Paystack
- Seller with existing split → reuses split_id
- Webhook verifies reference and updates transaction
- Ledger reflects admin 5% and seller 95%

## Minimal Pseudocode (Node/Express)
1) initialize-split:
   - validate body
   - seller = getSeller(store_id)
   - split = getOrCreateSplit(seller.subaccount_code)
   - tx = paystack.initialize({ email, amount, reference, callback_url, split })
   - saveTransaction(tx, seller, reference)
   - return { authorization_url: tx.authorization_url }
2) verify:
   - result = paystack.verify(reference)
   - if success → update transaction, ledger, order
   - return result
3) webhook:
   - validate signature
   - process event idempotently
   - update transaction and ledger

