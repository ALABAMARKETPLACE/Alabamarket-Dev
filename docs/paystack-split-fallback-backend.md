# Paystack Split Payment (Backend) — Fallback to Non-Split Initialize When No Subaccount

This document describes what to implement on the backend so that:

- Normal case: **Seller has an active Paystack subaccount** → split payment **95% seller / 5% platform** uses the seller’s subaccount.
- Fallback case: **Seller has no active Paystack subaccount** → do **NOT** attempt split; instead fall back to the older flow and call **Paystack normal initialize* (no split).

<!--
Previous approach (removed by request):
- Fallback case used a default bank account/subaccount and still forced a 95/5 split.
-->

## Endpoint to Modify

### `POST /paystack/initialize-split`

This is the endpoint the frontend calls for split initialization:

- Frontend constant: `PAYSTACK_INITIALIZE_SPLIT = "paystack/initialize-split"`
- If the store has **no active seller subaccount**, this endpoint should fall back internally to the older flow: `POST /paystack/initialize`.

## Request Payload (Fields to Accept)

Your backend should accept the usual initialize fields needed to determine whether to split.

### Existing / typical fields

- `email` (string, required)
- `amount` (number, required) — amount in **kobo**
- `currency` (string, optional, default: `"NGN"`)
- `reference` (string, required)
- `callback_url` (string, required)
- `store_id` (number, required)
- `split_payment` (boolean, should be `true`)
- `metadata` (object, optional)

<!--
Removed by request:
New fallback fields (use_default_subaccount_if_missing, fallback_subaccount_code, fallback_bank_details)
and the backend default subaccount routing approach.
-->

## Data Model Changes (Fields to Create)

The backend must be able to determine whether a seller/store has an active subaccount and what code to use.

### 1) Store/Seller table (if not already present)

Add or confirm these fields exist:

- `paystack_subaccount_code` (string, nullable)
- `subaccount_status` (enum/string) — values like: `pending | active | inactive`

These are already referenced by the frontend and admin dashboard, so they likely exist already.

### 2) Optional: Split Cache table (recommended)

Create a table to avoid creating a new Paystack split object for every payment:

**`payment_splits`**

- `id` (PK)
- `store_id` (FK)
- `paystack_split_code` (string) — Paystack split identifier/code
- `admin_percentage` (int) — e.g., `5`
- `seller_percentage` (int) — e.g., `95`
- `seller_subaccount_code_used` (string) — which subaccount was used when the split was created (seller or fallback)
- `status` (enum/string) — `active | inactive`
- `created_at`, `updated_at`

Why: You can reuse the split object per store/subaccount combination.

### 3) Optional: Settings table (alternative to env vars)

If you prefer DB settings:

**`platform_settings`**

- `paystack_platform_subaccount_code` (string) — if you route platform share to a platform subaccount
- `paystack_fallback_subaccount_code` (string) — `ACCT_o32kx6ecn1uqblv`
- `paystack_fallback_bank_name` (string) — `Fidelity Bank`
- `paystack_fallback_account_number` (string) — `5601342631`

## Core Backend Logic (Initialize-Split)

### Step 1 — Validate input

- Validate `email`, `amount >= 100`, `reference`, `callback_url`, `store_id`
- Validate `split_payment === true` for this endpoint
- Validate store exists and is eligible for split payments

### Step 2 — Resolve seller payout subaccount

1. Load store/seller by `store_id`
2. Determine if seller has an active subaccount:
   - `subaccount_status === "active"` AND `paystack_subaccount_code` is present
3. If seller has an active subaccount:
   - `sellerSubaccountCode = store.paystack_subaccount_code`
4. Else (no active subaccount):
   - Do **NOT** create/reuse a split.
   - Fall back to the older flow by initializing a normal Paystack transaction (no split) and return the authorization_url.

### Step 3 — Resolve platform share routing

You have two common approaches:

**A) Split object with two subaccounts (recommended for strict 95/5)**

- Seller share: `sellerSubaccountCode` (seller’s real subaccount or fallback)
- Platform share: `PAYSTACK_PLATFORM_SUBACCOUNT_CODE` (your platform subaccount)

**B) Subaccount-only strategy**

- Initialize with the seller subaccount and configure fees/percentage on Paystack side.
- Not recommended if you want strict 95/5 controlled per transaction.

This project’s docs recommend **Split objects**.

### Step 4 — Get or create Paystack Split

If you cache split per store:

- If a split exists in DB for `(store_id, sellerSubaccountCode, 95/5)` and `status=active`, reuse it.
- Else create a new split at Paystack:

`POST https://api.paystack.co/split`

Body (example):

```json
{
  "name": "Store 123 Split",
  "type": "percentage",
  "currency": "NGN",
  "bearer_type": "subaccount",
  "subaccounts": [
    { "subaccount": "SELLER_SUBACCOUNT_CODE", "share": 95 },
    { "subaccount": "PLATFORM_SUBACCOUNT", "share": 5 }
  ]
}
```

Replace `SELLER_SUBACCOUNT_CODE` with the store’s `paystack_subaccount_code` (only when `subaccount_status === "active"`).

Persist Paystack split id/code in your DB for reuse.

### Step 5 — Initialize Paystack Transaction

`POST https://api.paystack.co/transaction/initialize`

Body (example):

```json
{
  "email": "customer@example.com",
  "amount": 250000,
  "reference": "ORDER_123",
  "callback_url": "https://your-frontend/checkoutsuccess/2",
  "split": "PAYSTACK_SPLIT_CODE",
  "metadata": {
    "store_id": 123,
    "order_id": "ORDER_123",
    "split": {
      "admin_percentage": 5,
      "seller_percentage": 95,
      "seller_subaccount_code_used": "SELLER_SUBACCOUNT_CODE"
    }
  }
}
```

Return `authorization_url` to the frontend.

### Step 6 — Save transaction locally

Store at least:

- `reference`
- `amount_kobo`
- `store_id`
- `split_code`
- `seller_subaccount_code_used` (seller or fallback)
- `authorization_url`
- `status = pending`

## Verification / Webhook Notes

No change is strictly required for `/paystack/verify` or `/paystack/webhook`, but recommended:

- When verifying, record which subaccount routing was used (seller vs fallback) for audit.
- If your fulfillment/settlement pipeline depends on store subaccounts, ensure it handles the fallback case cleanly.

## Expected Behavior Summary

- If seller subaccount is active → seller gets 95% to their subaccount.
- If seller subaccount is missing/inactive → fall back to **non-split**: call `POST /paystack/initialize` and return the authorization_url (old behavior).

## Implementation Checklist

- [ ] Modify `POST /paystack/initialize-split`:
  - If store has active subaccount → do 95/5 split initialization
  - Else → fall back to `POST /paystack/initialize` (non-split)
- [ ] Add/confirm DB fields: `paystack_subaccount_code`, `subaccount_status` on store/seller.
- [ ] Add split caching table (recommended) or implement split creation per transaction.
- [ ] Ensure `paystack/initialize-split` always returns a valid `authorization_url` or a clear error.
