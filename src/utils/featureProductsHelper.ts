/**
 * Helper utilities for featured products API calls
 */

/**
 * Maps position identifiers to numeric values
 * @param position - Position identifier (numeric or string)
 * @returns Numeric position value
 */
export function normalizePositionValue(position: string | number): number {
  if (typeof position === "number") {
    return position;
  }

  const positionMap: Record<string, number> = {
    top: 1,
    middle: 2,
    lower: 3,
    discounted: 4,
    discount: 4,
  };

  const normalized = positionMap[position.toLowerCase()];
  return normalized !== undefined ? normalized : parseInt(position, 10) || 0;
}

/**
 * Constructs the featured products API URL with proper position formatting
 * @param position - Position identifier
 * @param params - Query parameters
 * @returns Properly formatted API endpoint
 */
export function buildFeaturedProductsUrl(
  position: string | number,
  params?: Record<string, string | number | boolean>,
): string {
  const numericPosition = normalizePositionValue(position);
  let url = `featured-products/position/${numericPosition}/products`;

  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce(
        (acc, [key, value]) => {
          if (value !== null && value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        },
        {} as Record<string, string>,
      ),
    ).toString();

    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return url;
}
