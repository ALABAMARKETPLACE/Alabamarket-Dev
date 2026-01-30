import { useMemo } from "react";
import { allocateProductsToSections, ensureNoProductDuplicateAcrossSections } from "@/lib/productAllocationAlgorithm";

interface Product {
  _id?: string;
  pid?: string;
  id?: string;
  [key: string]: unknown;
}

interface UseAllocatedProductsParams {
  position1Products?: Product[];
  position2Products?: Product[];
  position3Products?: Product[];
  position4Products?: Product[];
  recentFallback?: Product[];
  showNewProducts?: boolean;
}

interface AllocatedSections {
  platinum: Product[];
  gold: Product[];
  silver: Product[];
  discounted: Product[];
}

/**
 * Hook to intelligently allocate products to featured sections without duplicates
 * Uses multi-criteria scoring to determine optimal product placement
 */
export const useAllocatedProducts = ({
  position1Products = [],
  position2Products = [],
  position3Products = [],
  position4Products = [],
  recentFallback = [],
}: UseAllocatedProductsParams): AllocatedSections => {
  // Combine all products from all sources
  const allProducts = useMemo(() => {
    const combined = [
      ...position1Products,
      ...position2Products,
      ...position3Products,
      ...position4Products,
      ...recentFallback,
    ];

    // Remove duplicates based on ID
    const uniqueMap = new Map();
    combined.forEach((product) => {
      const id = product?._id || product?.pid || product?.id;
      if (id && !uniqueMap.has(id)) {
        uniqueMap.set(id, product);
      }
    });

    return Array.from(uniqueMap.values());
  }, [position1Products, position2Products, position3Products, position4Products, recentFallback]);

  // Allocate products intelligently
  const allocatedProducts = useMemo(() => {
    if (allProducts.length === 0) {
      return {
        platinum: [],
        gold: [],
        silver: [],
        discounted: [],
      };
    }

    const allocation = allocateProductsToSections(allProducts);
    const productMap = new Map(
      allProducts.map((p) => [p._id || p.pid || p.id, p])
    );

    // Get product objects for each section
    const sections = {
      platinum: allocation.platinum
        .map((id) => productMap.get(id))
        .filter(Boolean),
      gold: allocation.gold
        .map((id) => productMap.get(id))
        .filter(Boolean),
      silver: allocation.silver
        .map((id) => productMap.get(id))
        .filter(Boolean),
      discounted: allocation.discounted
        .map((id) => productMap.get(id))
        .filter(Boolean),
    };

    // Ensure no duplicates across sections
    return ensureNoProductDuplicateAcrossSections(
      sections.platinum,
      sections.gold,
      sections.silver,
      sections.discounted
    );
  }, [allProducts]);

  return allocatedProducts;
};
