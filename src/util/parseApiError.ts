/**
 * Safely extracts a human-readable string from any API response value.
 *
 * Handles:
 *   - Plain strings  → returned as-is
 *   - Arrays         → joined (NestJS validation: ["field required", "email invalid"])
 *   - Nested objects → looks inside .message / .error / .detail / .details
 *   - null / undefined / other → returns fallback
 */
export function parseApiMessage(
  val: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (val === null || val === undefined) return fallback;

  if (typeof val === "string") {
    return val.trim() || fallback;
  }

  if (Array.isArray(val)) {
    const parts = val
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : fallback;
  }

  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    // Try common backend message keys in order of priority
    for (const key of ["message", "error", "detail", "details", "msg"]) {
      if (key in obj) {
        const inner = parseApiMessage(obj[key], "");
        if (inner) return inner;
      }
    }
    return fallback;
  }

  const str = String(val);
  return str || fallback;
}
