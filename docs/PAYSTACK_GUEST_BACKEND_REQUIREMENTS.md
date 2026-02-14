# Paystack Guest Checkout Backend Requirements

## Overview

This document outlines the backend changes required to fully support guest checkout and payment flows using Paystack. All endpoints must allow unauthenticated (public) access for guest users, using only the payment reference and delivery calculation token where specified.

---

## 1. Delivery Charge Calculation (Guest)

- **Endpoint:** `POST /calculate_delivery/public`
- **Auth:** None (public)
- **Request:**
  ```json
  {
    "address": { ... },
    "cart": [ ... ]
  }
  ```
- **Response:**
  ```json
  {
    "status": true,
    "data": { "delivery_charge": 4000, ... },
    "token": "<delivery_calc_token>"
  }
  ```
- **Notes:**
  - Return a short-lived token in the response for use in subsequent guest order steps.

---

## 2. Paystack Payment Initialization (Guest & Authenticated)

- **Endpoint:** `POST /paystack/initialize-split`
- **Auth:**
  - Required for authenticated users (Authorization header)
  - Not required for guests (public)
- **Request:**
  ```json
  {
    "email": "guest@example.com",
    "amount": 1500000,
    "reference": "ORDER_1707580800000_ABC123",
    "callback_url": "https://...",
    "split": "SPL_abc123",
    "metadata": { ... }
  }
  ```
- **Response:**
  ```json
  {
    "status": true,
    "data": { "authorization_url": "...", "reference": "..." }
  }
  ```
- **Notes:**
  - For guests, do not require Authorization header.
  - Use guest email and reference for transaction tracking.

---

## 3. Paystack Payment Verification (Guest & Authenticated)

- **Endpoint:** `POST /paystack/verify`
- **Auth:**
  - Not required for guests (public, no Authorization header)
  - Required for authenticated users
- **Request:**
  ```json
  {
    "reference": "ORDER_1707580800000_ABC123"
  }
  ```
- **Response:**
  ```json
  {
    "status": true,
    "data": { ...Paystack verification data... }
  }
  ```
- **Notes:**
  - For guests, verify payment using only the reference (no session/token check).
  - If reference is valid and payment is successful, return verification data.
  - Do not block or return 401 for guest requests.

---

## 4. Guest Order Creation

- **Endpoint:** `POST /order/guest`
- **Auth:** None (public)
- **Request:**
  ```json
  {
    "payment": { ... },
    "cart": [ ... ],
    "address": { ... },
    "charges": { ... },
    "guest_email": "guest@example.com"
  }
  ```
- **Response:**
  ```json
  {
    "status": true,
    "order_id": "...",
    "message": "Order created successfully"
  }
  ```
- **Notes:**
  - Use delivery calculation token for validation if needed.
  - No authentication required.

---

## 5. Paystack Webhook

- **Endpoint:** `POST /paystack/webhook`
- **Auth:** None (Paystack signature validation only)
- **Notes:**
  - Handle Paystack events for both guest and authenticated transactions.
  - Update order/payment status accordingly.

---

## General Implementation Notes

- All guest endpoints must not require Authorization or session.
- For guest payment verification, only the payment reference is required.
- Return clear error messages for invalid or failed payments, but never 401 for guest flows.
- Ensure all responses are valid JSON.

---

## References

- See `GUEST_CHECKOUT_BACKEND_REQUIREMENTS.md` and `SPLIT_PAYMENT_BACKEND_REQUIREMENTS.md` for payload details and further requirements.
