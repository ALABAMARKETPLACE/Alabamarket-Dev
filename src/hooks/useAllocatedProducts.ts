import { useMemo } from "react";
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 37193e2 (Done)
import {
  allocateProductsToSections,
  ensureNoProductDuplicateAcrossSections,
} from "@/lib/productAllocationAlgorithm";
<<<<<<< HEAD
=======
import { allocateProductsToSections, ensureNoProductDuplicateAcrossSections } from "@/lib/productAllocationAlgorithm";
>>>>>>> 2f2bb25 (Done)
=======
>>>>>>> 37193e2 (Done)

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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 37193e2 (Done)
  }, [
    position1Products,
    position2Products,
    position3Products,
    position4Products,
    recentFallback,
  ]);
<<<<<<< HEAD
=======
  }, [position1Products, position2Products, position3Products, position4Products, recentFallback]);
>>>>>>> 2f2bb25 (Done)
=======
>>>>>>> 37193e2 (Done)

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
<<<<<<< HEAD
<<<<<<< HEAD
      allProducts.map((p) => [p._id || p.pid || p.id, p]),
=======
      allProducts.map((p) => [p._id || p.pid || p.id, p])
>>>>>>> 2f2bb25 (Done)
=======
      allProducts.map((p) => [p._id || p.pid || p.id, p]),
>>>>>>> 37193e2 (Done)
    );

    // Get product objects for each section
    const sections = {
      platinum: allocation.platinum
        .map((id) => productMap.get(id))
        .filter(Boolean),
<<<<<<< HEAD
<<<<<<< HEAD
      gold: allocation.gold.map((id) => productMap.get(id)).filter(Boolean),
      silver: allocation.silver.map((id) => productMap.get(id)).filter(Boolean),
=======
      gold: allocation.gold
        .map((id) => productMap.get(id))
        .filter(Boolean),
      silver: allocation.silver
        .map((id) => productMap.get(id))
        .filter(Boolean),
>>>>>>> 2f2bb25 (Done)
=======
      gold: allocation.gold.map((id) => productMap.get(id)).filter(Boolean),
      silver: allocation.silver.map((id) => productMap.get(id)).filter(Boolean),
>>>>>>> 37193e2 (Done)
      discounted: allocation.discounted
        .map((id) => productMap.get(id))
        .filter(Boolean),
    };

    // Ensure no duplicates across sections
    return ensureNoProductDuplicateAcrossSections(
      sections.platinum,
      sections.gold,
      sections.silver,
<<<<<<< HEAD
<<<<<<< HEAD
      sections.discounted,
=======
      sections.discounted
>>>>>>> 2f2bb25 (Done)
=======
      sections.discounted,
>>>>>>> 37193e2 (Done)
    );
  }, [allProducts]);

  return allocatedProducts;
};
