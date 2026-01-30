/**
 * Product Allocation Algorithm
 * Automatically distributes products to Platinum, Gold, Silver, and Discounted sections
 * Ensures no product appears in multiple sections
 */

interface Product {
  _id?: string;
  pid?: string;
  id?: string;
  rating?: number;
  orders?: number;
  sales?: number;
  createdAt?: string | Date;
  retail_rate?: number;
  discount?: number | boolean;
  tag?: string;
  store_id?: string;
  storeDetails?: {
    store_name?: string;
  };
  [key: string]: unknown;
}

interface ProductScore {
  productId: string;
  score: number;
  reason: string;
}

interface AllocationResult {
  platinum: string[];
  gold: string[];
  silver: string[];
  discounted: string[];
  unallocated: string[];
}

/**
 * Score a product based on multiple criteria
 * Higher score = more likely to be featured
 */
function scoreProduct(product: Product): number {
  let score = 0;

  // Rating score (0-30 points)
  if (product.rating) {
    const ratingScore = (product.rating / 5) * 30;
    score += ratingScore;
  }

  // Sales/Orders score (0-25 points)
  if (product.orders || product.sales) {
    const salesCount = product.orders || product.sales || 0;
    const salesScore = Math.min((salesCount / 100) * 25, 25);
    score += salesScore;
  }

  // Recency score (0-20 points) - newer products get boost
  if (product.createdAt) {
    const now = new Date();
    const createdDate = new Date(product.createdAt);
    const daysOld =
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysOld < 7) {
      score += 20; // New products
    } else if (daysOld < 30) {
      score += 15;
    } else if (daysOld < 90) {
      score += 10;
    } else {
      score += 5;
    }
  }

  // Price range score (0-15 points) - premium products get slight boost
  if (product.retail_rate) {
    if (product.retail_rate > 50000) {
      score += 15; // Premium products
    } else if (product.retail_rate > 20000) {
      score += 10;
    } else if (product.retail_rate > 5000) {
      score += 5;
    }
  }

  // Discount score (0-10 points) - discounted items boost
  if (product.discount || product.tag === "discount") {
    score += 10;
  }

  // Store reliability (0-5 points) - established stores
  if (product.store_id && product.storeDetails?.store_name) {
    score += 5;
  }

  return Math.min(score, 100); // Cap at 100
}

/**
 * Main allocation algorithm
 * Distributes products into 4 sections ensuring no duplicates
 */
export function allocateProductsToSections(
  products: Product[],
): AllocationResult {
  if (!Array.isArray(products) || products.length === 0) {
    return {
      platinum: [],
      gold: [],
      silver: [],
      discounted: [],
      unallocated: [],
    };
  }

  // Remove duplicates
  const uniqueProducts = Array.from(
    new Map(products.map((p) => [p._id || p.pid, p])).values(),
  );

  // Score all products
  const scoredProducts: ProductScore[] = uniqueProducts
    .map((product) => {
      const productId = product._id || product.pid || product.id;
      return productId
        ? {
            productId,
            score: scoreProduct(product),
            reason: "scored",
          }
        : null;
    })
    .filter((item): item is ProductScore => item !== null);

  // Sort by score (descending)
  scoredProducts.sort((a, b) => b.score - a.score);

  // Define section allocations (percentages)
  const sections = {
    platinum: {
      count: Math.ceil(uniqueProducts.length * 0.15),
      items: [] as string[],
    }, // Top 15%
    gold: {
      count: Math.ceil(uniqueProducts.length * 0.25),
      items: [] as string[],
    }, // Next 25%
    silver: {
      count: Math.ceil(uniqueProducts.length * 0.3),
      items: [] as string[],
    }, // Next 30%
    discounted: {
      count: Math.ceil(uniqueProducts.length * 0.2),
      items: [] as string[],
    }, // Next 20%
  };

  // Track used product IDs
  const usedProductIds = new Set<string>();

  // Allocate to sections in order
  let productIndex = 0;

  // Platinum section (top tier - highest scores + ratings + premium)
  for (
    let i = 0;
    i < sections.platinum.count && productIndex < scoredProducts.length;
    i++
  ) {
    const productId = scoredProducts[productIndex].productId;
    if (!usedProductIds.has(productId)) {
      sections.platinum.items.push(productId);
      usedProductIds.add(productId);
    }
    productIndex++;
  }

  // Gold section
  for (
    let i = 0;
    i < sections.gold.count && productIndex < scoredProducts.length;
    i++
  ) {
    const productId = scoredProducts[productIndex].productId;
    if (!usedProductIds.has(productId)) {
      sections.gold.items.push(productId);
      usedProductIds.add(productId);
    }
    productIndex++;
  }

  // Silver section
  for (
    let i = 0;
    i < sections.silver.count && productIndex < scoredProducts.length;
    i++
  ) {
    const productId = scoredProducts[productIndex].productId;
    if (!usedProductIds.has(productId)) {
      sections.silver.items.push(productId);
      usedProductIds.add(productId);
    }
    productIndex++;
  }

  // Discounted section (special emphasis on discounted products)
  const discountedProducts = scoredProducts.filter(
    (p) =>
      !usedProductIds.has(p.productId) &&
      uniqueProducts.find(
        (prod) =>
          (prod._id || prod.pid) === p.productId &&
          (prod.discount || prod.tag === "discount"),
      ),
  );

  for (
    let i = 0;
    i < Math.min(discountedProducts.length, sections.discounted.count);
    i++
  ) {
    sections.discounted.items.push(discountedProducts[i].productId);
    usedProductIds.add(discountedProducts[i].productId);
  }

  // Fill remaining discounted slots with top products
  for (
    let i = sections.discounted.items.length;
    i < sections.discounted.count && productIndex < scoredProducts.length;
    i++
  ) {
    const productId = scoredProducts[productIndex].productId;
    if (!usedProductIds.has(productId)) {
      sections.discounted.items.push(productId);
      usedProductIds.add(productId);
    }
    productIndex++;
  }

  // Collect unallocated products
  const unallocated = scoredProducts
    .filter((p) => !usedProductIds.has(p.productId))
    .map((p) => p.productId);

  return {
    platinum: sections.platinum.items,
    gold: sections.gold.items,
    silver: sections.silver.items,
    discounted: sections.discounted.items,
    unallocated,
  };
}

/**
 * Smart rotation algorithm - alternates between new and old products
 * Ensures users see different products on each visit
 */
export function rotateProductsInSection(
  sectionProducts: string[],
  showNew: boolean,
  rotationIndex: number = 0,
): string[] {
  if (sectionProducts.length === 0) return [];

  const batchSize = Math.ceil(sectionProducts.length / 3);
  const startIdx = (rotationIndex * batchSize) % sectionProducts.length;

  // Rotate through the array
  const rotated = [
    ...sectionProducts.slice(startIdx),
    ...sectionProducts.slice(0, startIdx),
  ];

  return rotated;
}

/**
 * Filter products to ensure freshness
 */
export function ensureNoProductDuplicateAcrossSections(
  platinum: Product[],
  gold: Product[],
  silver: Product[],
  discounted: Product[],
): {
  platinum: Product[];
  gold: Product[];
  silver: Product[];
  discounted: Product[];
} {
  const usedIds = new Set<string>();

  const addUnique = (products: Product[]): Product[] => {
    return products.filter((p) => {
      const id = p._id || p.pid || p.id;
      if (!id || usedIds.has(id)) return false;
      usedIds.add(id);
      return true;
    });
  };

  return {
    platinum: addUnique(platinum),
    gold: addUnique(gold),
    silver: addUnique(silver),
    discounted: addUnique(discounted),
  };
}
