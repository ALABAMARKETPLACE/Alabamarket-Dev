# Order Reference Idempotency: Prevention of Duplicate Orders

## Problem

- If the same `payment.ref` (payment reference) is used in multiple order requests, the backend may treat it as an idempotent request.
- This can cause:
  - Orders not being created if the reference was already used.
  - Orders not showing up in the admin panel if the backend skips creation or fails to update status.

## Best Practices

### Backend

- **Check for Existing Reference:**
  - When a new order is requested, check if an order with the same `payment.ref` already exists.
  - If it exists and is completed, return the existing order (do not create a new one).
  - If it exists but is not completed, update the status or return an error.
  - If it does not exist, create a new order.

#### Example (Node/Express Pseudocode)

```js
const existingOrder = await Order.findOne({ paymentRef: req.body.payment.ref });
if (existingOrder) {
  if (existingOrder.status === "completed") {
    return res
      .status(200)
      .json({ message: "Order already exists", order: existingOrder });
  } else {
    // Optionally update status or return error
    return res
      .status(400)
      .json({ message: "Order with this reference is pending or failed." });
  }
}
// Proceed to create new order
```

### Frontend

- **Generate Unique Reference:**
  - Always generate a new, unique `payment.ref` for every new payment attempt (e.g., using a UUID or payment gateway reference).
  - Do **not** reuse a reference from a previous failed or completed order.
- **Clear Reference After Success:**
  - After a successful order, clear any stored payment references in local storage or state to avoid accidental reuse.

#### Example (Generating a Unique Reference)

```js
import { v4 as uuidv4 } from "uuid";
const paymentRef = `ps_${uuidv4()}`;
```

## Summary

- Never reuse a payment reference for a new order.
- Backend must check for duplicate references and handle idempotency correctly.
- Frontend must generate a new reference for each payment and clear it after use.

---

**If you need help implementing this logic in your backend or frontend, provide the relevant code and I can assist further.**
