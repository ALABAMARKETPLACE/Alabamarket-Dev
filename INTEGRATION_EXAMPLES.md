<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 37193e2 (Done)
/\*\*

- EXAMPLE INTEGRATION: How to use the Product Allocation Algorithm in Home Page
-
- This file demonstrates how to integrate the allocation algorithm into the existing
- home page component. Choose one of the implementation patterns below.
  \*/
<<<<<<< HEAD
=======
/**
 * EXAMPLE INTEGRATION: How to use the Product Allocation Algorithm in Home Page
 * 
 * This file demonstrates how to integrate the allocation algorithm into the existing
 * home page component. Choose one of the implementation patterns below.
 */
>>>>>>> 2f2bb25 (Done)
=======
>>>>>>> 37193e2 (Done)

// ============================================================================
// PATTERN 1: Hook-Based Integration (RECOMMENDED - No API calls)
// ============================================================================

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 37193e2 (Done)
/\*\*

- Updated home page with hook-based allocation
- Use this approach for best performance - calculation happens in-component
  \*/
<<<<<<< HEAD
=======
/**
 * Updated home page with hook-based allocation
 * Use this approach for best performance - calculation happens in-component
 */
>>>>>>> 2f2bb25 (Done)
=======
>>>>>>> 37193e2 (Done)

import { useAllocatedProducts } from "@/hooks/useAllocatedProducts";

export function HomeWithHookAllocation() {
<<<<<<< HEAD
<<<<<<< HEAD
// ... existing code ...

// After all your existing useState and useQuery hooks, add:
const allocated = useAllocatedProducts({
position1Products: featuredProducts[1] || [],
position2Products: featuredProducts[2] || [],
position3Products: featuredProducts[3] || [],
position4Products: featuredProducts[4] || [],
recentFallback: recentFallback || [],
showNewProducts,
});

// Then use allocated.platinum, allocated.gold, etc. in your render:
return (
<div className="page-Box">
{Banner?.length ? (
<>
<Banners data={Banner} />
<div className="HomeSCreen-space" />
</>
) : null}
=======
  // ... existing code ...
  
  // After all your existing useState and useQuery hooks, add:
  const allocated = useAllocatedProducts({
    position1Products: featuredProducts[1] || [],
    position2Products: featuredProducts[2] || [],
    position3Products: featuredProducts[3] || [],
    position4Products: featuredProducts[4] || [],
    recentFallback: recentFallback || [],
    showNewProducts,
  });

  // Then use allocated.platinum, allocated.gold, etc. in your render:
  return (
    <div className="page-Box">
      {Banner?.length ? (
        <>
          <Banners data={Banner} />
          <div className="HomeSCreen-space" />
        </>
      ) : null}
>>>>>>> 2f2bb25 (Done)
=======
// ... existing code ...

// After all your existing useState and useQuery hooks, add:
const allocated = useAllocatedProducts({
position1Products: featuredProducts[1] || [],
position2Products: featuredProducts[2] || [],
position3Products: featuredProducts[3] || [],
position4Products: featuredProducts[4] || [],
recentFallback: recentFallback || [],
showNewProducts,
});

// Then use allocated.platinum, allocated.gold, etc. in your render:
return (
<div className="page-Box">
{Banner?.length ? (
<>
<Banners data={Banner} />
<div className="HomeSCreen-space" />
</>
) : null}
>>>>>>> 37193e2 (Done)

      {allocated.discounted.length > 0 && (
        <>
          <DiscountedDealsSection products={allocated.discounted} />
          <div className="HomeSCreen-space" />
        </>
      )}

      {allocated.platinum.length > 0 && (
        <>
          <PlatinumSection products={allocated.platinum} />
          <div className="HomeSCreen-space" />
        </>
      )}

      {allocated.gold.length > 0 && (
        <>
          <GoldSection products={allocated.gold} />
          <div className="HomeSCreen-space" />
        </>
      )}

      {allocated.silver.length > 0 && (
        <>
          <SilverSection products={allocated.silver} />
          <div className="HomeSCreen-space" />
        </>
      )}

      <FeaturedItems />
      {/* ... rest of component ... */}
    </div>
<<<<<<< HEAD
<<<<<<< HEAD

);
=======
  );
>>>>>>> 2f2bb25 (Done)
=======

);
>>>>>>> 37193e2 (Done)
}

// ============================================================================
// PATTERN 2: API-Based Integration (For backend synchronization)
// ============================================================================

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 37193e2 (Done)
/\*\*

- Use this approach if you want to centralize allocation logic on backend
- Useful for logging, analytics, and consistent behavior across devices
  \*/
<<<<<<< HEAD
=======
/**
 * Use this approach if you want to centralize allocation logic on backend
 * Useful for logging, analytics, and consistent behavior across devices
 */
>>>>>>> 2f2bb25 (Done)
=======
>>>>>>> 37193e2 (Done)

import { useEffect, useState } from "react";

interface AllocationResult {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 37193e2 (Done)
platinum: any[];
gold: any[];
silver: any[];
discounted: any[];
<<<<<<< HEAD
}

export function HomeWithApiAllocation() {
const [allocated, setAllocated] = useState<AllocationResult>({
platinum: [],
gold: [],
silver: [],
discounted: [],
});
const [isAllocating, setIsAllocating] = useState(false);

// Collect all products from all positions
const allProductsData = useMemo(() => {
const combined = [
...(featuredProducts[1] || []),
...(featuredProducts[2] || []),
...(featuredProducts[3] || []),
...(featuredProducts[4] || []),
...(recentFallback || []),
];
=======
  platinum: any[];
  gold: any[];
  silver: any[];
  discounted: any[];
=======
>>>>>>> 37193e2 (Done)
}

export function HomeWithApiAllocation() {
const [allocated, setAllocated] = useState<AllocationResult>({
platinum: [],
gold: [],
silver: [],
discounted: [],
});
const [isAllocating, setIsAllocating] = useState(false);

<<<<<<< HEAD
  // Collect all products from all positions
  const allProductsData = useMemo(() => {
    const combined = [
      ...(featuredProducts[1] || []),
      ...(featuredProducts[2] || []),
      ...(featuredProducts[3] || []),
      ...(featuredProducts[4] || []),
      ...(recentFallback || []),
    ];
>>>>>>> 2f2bb25 (Done)
=======
// Collect all products from all positions
const allProductsData = useMemo(() => {
const combined = [
...(featuredProducts[1] || []),
...(featuredProducts[2] || []),
...(featuredProducts[3] || []),
...(featuredProducts[4] || []),
...(recentFallback || []),
];
>>>>>>> 37193e2 (Done)

    // Remove duplicates
    const seen = new Set();
    return combined.filter((product) => {
      const id = product?._id || product?.pid || product?.id;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
<<<<<<< HEAD
<<<<<<< HEAD

}, [featuredProducts, recentFallback]);

// Call allocation API when data changes
useEffect(() => {
if (allProductsData.length === 0) {
setAllocated({
platinum: [],
gold: [],
silver: [],
discounted: [],
});
return;
}
=======
  }, [featuredProducts, recentFallback]);

  // Call allocation API when data changes
  useEffect(() => {
    if (allProductsData.length === 0) {
      setAllocated({
        platinum: [],
        gold: [],
        silver: [],
        discounted: [],
      });
      return;
    }
>>>>>>> 2f2bb25 (Done)
=======

}, [featuredProducts, recentFallback]);

// Call allocation API when data changes
useEffect(() => {
if (allProductsData.length === 0) {
setAllocated({
platinum: [],
gold: [],
silver: [],
discounted: [],
});
return;
}
>>>>>>> 37193e2 (Done)

    const performAllocation = async () => {
      setIsAllocating(true);
      try {
        const response = await fetch("/api/products/allocate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            products: allProductsData,
            showNew: showNewProducts,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setAllocated({
              platinum: result.sections.platinum.products,
              gold: result.sections.gold.products,
              silver: result.sections.silver.products,
              discounted: result.sections.discounted.products,
            });

            // Log allocation stats
            console.log("Product Allocation Stats:", result.summary);
          }
        }
      } catch (error) {
        console.error("Failed to allocate products:", error);
        // Fallback to original products
        setAllocated({
          platinum: featuredProducts[1] || [],
          gold: featuredProducts[2] || [],
          silver: featuredProducts[3] || [],
          discounted: featuredProducts[4] || [],
        });
      } finally {
        setIsAllocating(false);
      }
    };

    performAllocation();
<<<<<<< HEAD
<<<<<<< HEAD

}, [allProductsData, showNewProducts]);

// Rest of component same as Pattern 1...
=======
  }, [allProductsData, showNewProducts]);

  // Rest of component same as Pattern 1...
>>>>>>> 2f2bb25 (Done)
=======

}, [allProductsData, showNewProducts]);

// Rest of component same as Pattern 1...
>>>>>>> 37193e2 (Done)
}

// ============================================================================
// PATTERN 3: Hybrid Approach (Best for Production)
// ============================================================================

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 37193e2 (Done)
/\*\*

- Use hook for immediate allocation, refresh from API periodically
- This gives you best of both worlds: performance + backend sync
  \*/
<<<<<<< HEAD
=======
/**
 * Use hook for immediate allocation, refresh from API periodically
 * This gives you best of both worlds: performance + backend sync
 */
>>>>>>> 2f2bb25 (Done)
=======
>>>>>>> 37193e2 (Done)

import { useAllocatedProducts } from "@/hooks/useAllocatedProducts";

export function HomeHybridAllocation() {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 37193e2 (Done)
// Immediate allocation using hook
const allocated = useAllocatedProducts({
position1Products: featuredProducts[1] || [],
position2Products: featuredProducts[2] || [],
position3Products: featuredProducts[3] || [],
position4Products: featuredProducts[4] || [],
recentFallback: recentFallback || [],
showNewProducts,
});
<<<<<<< HEAD

// Sync with backend every 5 minutes for analytics/logging
useEffect(() => {
const syncWithBackend = async () => {
try {
await fetch("/api/products/allocate/sync", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
platinumCount: allocated.platinum.length,
goldCount: allocated.gold.length,
silverCount: allocated.silver.length,
discountedCount: allocated.discounted.length,
timestamp: new Date().toISOString(),
}),
});
} catch (error) {
console.error("Failed to sync allocation stats:", error);
}
};

    const syncInterval = setInterval(syncWithBackend, 5 * 60 * 1000);
    return () => clearInterval(syncInterval);

}, [allocated]);

// Render using allocated products (same as Pattern 1)
return (
<div className="page-Box">
{/_ ... render code ... _/}
</div>
);
=======
  // Immediate allocation using hook
  const allocated = useAllocatedProducts({
    position1Products: featuredProducts[1] || [],
    position2Products: featuredProducts[2] || [],
    position3Products: featuredProducts[3] || [],
    position4Products: featuredProducts[4] || [],
    recentFallback: recentFallback || [],
    showNewProducts,
  });
=======
>>>>>>> 37193e2 (Done)

// Sync with backend every 5 minutes for analytics/logging
useEffect(() => {
const syncWithBackend = async () => {
try {
await fetch("/api/products/allocate/sync", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
platinumCount: allocated.platinum.length,
goldCount: allocated.gold.length,
silverCount: allocated.silver.length,
discountedCount: allocated.discounted.length,
timestamp: new Date().toISOString(),
}),
});
} catch (error) {
console.error("Failed to sync allocation stats:", error);
}
};

    const syncInterval = setInterval(syncWithBackend, 5 * 60 * 1000);
    return () => clearInterval(syncInterval);

<<<<<<< HEAD
  // Render using allocated products (same as Pattern 1)
  return (
    <div className="page-Box">
      {/* ... render code ... */}
    </div>
  );
>>>>>>> 2f2bb25 (Done)
=======
}, [allocated]);

// Render using allocated products (same as Pattern 1)
return (
<div className="page-Box">
{/_ ... render code ... _/}
</div>
);
>>>>>>> 37193e2 (Done)
}

// ============================================================================
// STEP-BY-STEP INTEGRATION INSTRUCTIONS
// ============================================================================

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 37193e2 (Done)
/\*\*

- To integrate into your home page:
-
- 1.  IMPORT the hook at the top of src/app/(screens)/home/page.tsx:
- import { useAllocatedProducts } from "@/hooks/useAllocatedProducts";
-
- 2.  REPLACE your positionItems useMemo with:
- const allocated = useAllocatedProducts({
-      position1Products: featuredProducts[1] || [],
-      position2Products: featuredProducts[2] || [],
-      position3Products: featuredProducts[3] || [],
-      position4Products: featuredProducts[4] || [],
-      recentFallback: recentFallback || [],
-      showNewProducts,
- });
-
- 3.  REMOVE the old positionItems logic (lines 222-264 in current version)
-
- 4.  UPDATE all section references:
- Old: <PlatinumSection products={position1Items} />
- New: <PlatinumSection products={allocated.platinum} />
-
- Old: <GoldSection products={position2Items} />
- New: <GoldSection products={allocated.gold} />
-
- Old: <SilverSection products={position3Items} />
- New: <SilverSection products={allocated.silver} />
-
- Old: <DiscountedDealsSection products={position4Items} />
- New: <DiscountedDealsSection products={allocated.discounted} />
-
- 5.  TEST:
- - Check that no products appear in multiple sections
- - Verify all 4 sections render with correct products
- - Test rotation every 30 seconds
- - Monitor performance in browser DevTools
-
- 6.  VERIFY INTEGRATION:
- - Open home page
- - Check each section in console (verify product IDs)
- - Wait 30 seconds and verify rotation
- - Check allocation distribution (platinum should have ~15%)
    \*/
<<<<<<< HEAD
=======
/**
 * To integrate into your home page:
 * 
 * 1. IMPORT the hook at the top of src/app/(screens)/home/page.tsx:
 *    import { useAllocatedProducts } from "@/hooks/useAllocatedProducts";
 * 
 * 2. REPLACE your positionItems useMemo with:
 *    const allocated = useAllocatedProducts({
 *      position1Products: featuredProducts[1] || [],
 *      position2Products: featuredProducts[2] || [],
 *      position3Products: featuredProducts[3] || [],
 *      position4Products: featuredProducts[4] || [],
 *      recentFallback: recentFallback || [],
 *      showNewProducts,
 *    });
 * 
 * 3. REMOVE the old positionItems logic (lines 222-264 in current version)
 * 
 * 4. UPDATE all section references:
 *    Old: <PlatinumSection products={position1Items} />
 *    New: <PlatinumSection products={allocated.platinum} />
 *    
 *    Old: <GoldSection products={position2Items} />
 *    New: <GoldSection products={allocated.gold} />
 *    
 *    Old: <SilverSection products={position3Items} />
 *    New: <SilverSection products={allocated.silver} />
 *    
 *    Old: <DiscountedDealsSection products={position4Items} />
 *    New: <DiscountedDealsSection products={allocated.discounted} />
 * 
 * 5. TEST:
 *    - Check that no products appear in multiple sections
 *    - Verify all 4 sections render with correct products
 *    - Test rotation every 30 seconds
 *    - Monitor performance in browser DevTools
 * 
 * 6. VERIFY INTEGRATION:
 *    - Open home page
 *    - Check each section in console (verify product IDs)
 *    - Wait 30 seconds and verify rotation
 *    - Check allocation distribution (platinum should have ~15%)
 */
>>>>>>> 2f2bb25 (Done)
=======
>>>>>>> 37193e2 (Done)

// ============================================================================
// LOGGING & DEBUGGING HELPERS
// ============================================================================

export const logAllocationStats = (allocated: AllocationResult, allProducts: any[]) => {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 37193e2 (Done)
const stats = {
total: allProducts.length,
platinum: {
count: allocated.platinum.length,
percentage: ((allocated.platinum.length / allProducts.length) _ 100).toFixed(2) + "%",
avgScore: allocated.platinum.reduce((sum, p) => sum + (p.score || 0), 0) / allocated.platinum.length,
},
gold: {
count: allocated.gold.length,
percentage: ((allocated.gold.length / allProducts.length) _ 100).toFixed(2) + "%",
avgScore: allocated.gold.reduce((sum, p) => sum + (p.score || 0), 0) / allocated.gold.length,
},
silver: {
count: allocated.silver.length,
percentage: ((allocated.silver.length / allProducts.length) _ 100).toFixed(2) + "%",
avgScore: allocated.silver.reduce((sum, p) => sum + (p.score || 0), 0) / allocated.silver.length,
},
discounted: {
count: allocated.discounted.length,
percentage: ((allocated.discounted.length / allProducts.length) _ 100).toFixed(2) + "%",
avgScore: allocated.discounted.reduce((sum, p) => sum + (p.score || 0), 0) / allocated.discounted.length,
},
};
<<<<<<< HEAD

console.table(stats);
return stats;
};

export const verifyNoProductDuplicates = (allocated: AllocationResult) => {
const allIds = [
...allocated.platinum.map(p => p._id || p.id),
...allocated.gold.map(p => p._id || p.id),
...allocated.silver.map(p => p._id || p.id),
...allocated.discounted.map(p => p._id || p.id),
];

const uniqueIds = new Set(allIds);
const hasDuplicates = allIds.length !== uniqueIds.size;

console.log(`Duplicate Check: ${hasDuplicates ? "❌ FAILED" : "✅ PASSED"}`);
console.log(`Total product references: ${allIds.length}, Unique: ${uniqueIds.size}`);

if (hasDuplicates) {
const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);
console.warn("Duplicate product IDs:", [...new Set(duplicates)]);
}

return !hasDuplicates;
=======
  const stats = {
    total: allProducts.length,
    platinum: {
      count: allocated.platinum.length,
      percentage: ((allocated.platinum.length / allProducts.length) * 100).toFixed(2) + "%",
      avgScore: allocated.platinum.reduce((sum, p) => sum + (p.score || 0), 0) / allocated.platinum.length,
    },
    gold: {
      count: allocated.gold.length,
      percentage: ((allocated.gold.length / allProducts.length) * 100).toFixed(2) + "%",
      avgScore: allocated.gold.reduce((sum, p) => sum + (p.score || 0), 0) / allocated.gold.length,
    },
    silver: {
      count: allocated.silver.length,
      percentage: ((allocated.silver.length / allProducts.length) * 100).toFixed(2) + "%",
      avgScore: allocated.silver.reduce((sum, p) => sum + (p.score || 0), 0) / allocated.silver.length,
    },
    discounted: {
      count: allocated.discounted.length,
      percentage: ((allocated.discounted.length / allProducts.length) * 100).toFixed(2) + "%",
      avgScore: allocated.discounted.reduce((sum, p) => sum + (p.score || 0), 0) / allocated.discounted.length,
    },
  };
=======
>>>>>>> 37193e2 (Done)

console.table(stats);
return stats;
};

export const verifyNoProductDuplicates = (allocated: AllocationResult) => {
const allIds = [
...allocated.platinum.map(p => p._id || p.id),
...allocated.gold.map(p => p._id || p.id),
...allocated.silver.map(p => p._id || p.id),
...allocated.discounted.map(p => p._id || p.id),
];

const uniqueIds = new Set(allIds);
const hasDuplicates = allIds.length !== uniqueIds.size;

console.log(`Duplicate Check: ${hasDuplicates ? "❌ FAILED" : "✅ PASSED"}`);
console.log(`Total product references: ${allIds.length}, Unique: ${uniqueIds.size}`);

if (hasDuplicates) {
const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);
console.warn("Duplicate product IDs:", [...new Set(duplicates)]);
}

<<<<<<< HEAD
  return !hasDuplicates;
>>>>>>> 2f2bb25 (Done)
=======
return !hasDuplicates;
>>>>>>> 37193e2 (Done)
};
