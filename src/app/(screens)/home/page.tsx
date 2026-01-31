"use client";
import { useEffect, useMemo, useState } from "react";
import Banners from "./_components/banner";
import API from "../../../config/API";
import { useSelector } from "react-redux";
import { reduxLatLong } from "../../../redux/slice/locationSlice";
import { GET } from "../../../util/apicall";
import "./style.scss";
import PopularItems from "./_components/popularItems";
import FeaturedItems from "./_components/featured_items";
import { reduxAccessToken } from "../../../redux/slice/authSlice";
import { jwtDecode } from "jwt-decode";
import { useQueries, useQuery } from "@tanstack/react-query";
import PlatinumSection from "./_components/platinumSection";
import DiscountedDealsSection from "./_components/discountedDealsSection";
import GoldSection from "./_components/goldSection";
import SilverSection from "./_components/silverSection";
// import CategoryFeaturedProducts from "./_components/categoryFeaturedProducts";

type Product = {
  id?: string | number;
  _id?: string | number;
  pid?: string | number;
  slug?: string;
  name?: string;
  createdAt?: string | number;
  status?: boolean;
  unit?: number | string;
  categoryName?: { name?: string };
  subCategoryName?: { name?: string };
  [key: string]: unknown;
};

type ApiResponse = {
  status?: boolean;
  data?: unknown;
};

function getSuccessfulArrayData(response: unknown) {
  if (!response || typeof response !== "object") return [];
  const res = response as ApiResponse;
  if (res.status !== true) return [];
  if (!Array.isArray(res.data)) return [];
  return res.data;
}

function isDisplayableProduct(item: unknown): item is Product {
  if (!item || typeof item !== "object") return false;
  const product = item as Product;
  if (product.status === false) return false;

  const unitNumber = Number(product.unit);
  if (Number.isFinite(unitNumber) && unitNumber <= 0) return false;

  return true;
}

function filterDisplayableProducts(items: unknown): Product[] {
  if (!Array.isArray(items) || items.length === 0) return [];
  return items.filter(isDisplayableProduct);
}

function getProductIdentifier(item: Product) {
  const raw = item.id ?? item._id ?? item.pid ?? item.slug;
  if (raw === undefined || raw === null) return null;
  return String(raw);
}

function getCategoryKey(item: Product) {
  const raw =
    item.categoryId ??
    item.category_id ??
    item.categoryName?.name ??
    item.subCategoryName?.name;
  if (raw === undefined || raw === null) return null;
  const key = String(raw).trim();
  return key.length > 0 ? key : null;
}

const PREFERRED_CATEGORY_TOKENS = [
  "handset",
  "television",
  "refrigerator",
  "kitchen",
  "generator",
  "electronics",
  "electrical",
  "furniture",
  "funiture",
] as const;

function normalizeCategoryText(value: unknown) {
  if (value === undefined || value === null) return "";
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function productMatchesCategoryToken(item: Product, token: string) {
  const tokenNorm = normalizeCategoryText(token);
  if (!tokenNorm) return false;

  const categoryName = normalizeCategoryText(item.categoryName?.name);
  const subCategoryName = normalizeCategoryText(item.subCategoryName?.name);
  const categoryKey = normalizeCategoryText(getCategoryKey(item));

  return (
    (categoryName.length > 0 && categoryName.includes(tokenNorm)) ||
    (subCategoryName.length > 0 && subCategoryName.includes(tokenNorm)) ||
    (categoryKey.length > 0 && categoryKey.includes(tokenNorm))
  );
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dedupeProducts(items: Product[]) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const seen = new Set<string>();
  const unique: Product[] = [];
  for (const item of items) {
    const id = getProductIdentifier(item);
    if (!id) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    unique.push(item);
  }

  return unique;
}

function shuffleCandidates(items: Product[], seed: number) {
  const unique = dedupeProducts(items);
  if (unique.length === 0) return [];

  const rand = mulberry32(seed);
  return unique
    .map((item) => ({ item, tiebreak: rand() }))
    .sort((a, b) => a.tiebreak - b.tiebreak)
    .map((x) => x.item);
}

function getCreatedAtMs(item: Product) {
  if (typeof item.createdAt === "number") return item.createdAt;
  if (typeof item.createdAt === "string") {
    const parsed = Date.parse(item.createdAt);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function splitNewOldPools(items: Product[]) {
  const unique = dedupeProducts(items);
  if (unique.length === 0) return { newPool: [], oldPool: [] };

  const byCreatedAt = [...unique].sort(
    (a, b) => getCreatedAtMs(b) - getCreatedAtMs(a),
  );
  const newSize = Math.ceil(byCreatedAt.length * 0.3);
  return {
    newPool: byCreatedAt.slice(0, newSize),
    oldPool: byCreatedAt.slice(newSize),
  };
}

function takeUniqueProducts(
  candidates: Product[],
  used: Set<string>,
  count: number,
  fallbackCandidates: Product[],
) {
  const result: Product[] = [];

  const tryAdd = (item: Product) => {
    const id = getProductIdentifier(item);
    if (!id) return false;
    if (used.has(id)) return false;
    used.add(id);
    result.push(item);
    return true;
  };

  for (const item of candidates) {
    if (result.length >= count) break;
    tryAdd(item);
  }

  if (result.length < count && Array.isArray(fallbackCandidates)) {
    for (const item of fallbackCandidates) {
      if (result.length >= count) break;
      tryAdd(item);
    }
  }

  return result;
}

function takeUniqueProductsByCategory(
  candidates: Product[],
  used: Set<string>,
  count: number,
  fallbackCandidates: Product[],
  categoryCounts: Map<string, number>,
  maxPerCategory: number,
) {
  const result: Product[] = [];

  const tryAdd = (item: Product) => {
    const id = getProductIdentifier(item);
    if (!id) return false;
    if (used.has(id)) return false;

    const categoryKey = getCategoryKey(item);
    if (categoryKey) {
      const current = categoryCounts.get(categoryKey) ?? 0;
      if (current >= maxPerCategory) return false;
      categoryCounts.set(categoryKey, current + 1);
    }

    used.add(id);
    result.push(item);
    return true;
  };

  for (const item of candidates) {
    if (result.length >= count) break;
    tryAdd(item);
  }

  if (result.length < count && Array.isArray(fallbackCandidates)) {
    for (const item of fallbackCandidates) {
      if (result.length >= count) break;
      tryAdd(item);
    }
  }

  return result;
}

function Home() {
  const [rotationSeed, setRotationSeed] = useState(0);
  const data = useSelector(reduxLatLong);
  const token = useSelector(reduxAccessToken);

  const { data: banners = [] } = useQuery<unknown[]>({
    queryKey: ["home-banners", data?.latitude ?? null, data?.longitude ?? null],
    queryFn: async () => {
      const response = await GET(API.GET_HOMESCREEN, {});
      return getSuccessfulArrayData(response);
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    gcTime: 10 * 60 * 1000,
  });

  const { data: history = [] } = useQuery<Product[]>({
    queryKey: ["user-history", token ?? null],
    queryFn: async () => {
      if (!token) return [];
      try {
        const decoded = jwtDecode<{ exp?: number }>(token);
        if (typeof decoded?.exp === "number") {
          if (decoded.exp * 1000 + 10000 <= Date.now()) return [];
        }
      } catch {
        return [];
      }
      const response = await GET(API.USER_HISTORY);
      return filterDisplayableProducts(getSuccessfulArrayData(response));
    },
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    gcTime: 10 * 60 * 1000,
  });

  const featuredEndpoints = useMemo(
    () =>
      ({
        1: API.FEATURED_POSITION_1,
        2: API.FEATURED_POSITION_2,
        3: API.FEATURED_POSITION_3,
        4: API.FEATURED_POSITION_4,
      }) as Record<1 | 2 | 3 | 4, string>,
    [],
  );

  const featuredTakeLimits = useMemo(
    () =>
      ({
        1: 25,
        2: 12,
        3: 36,
        4: 36,
      }) as Record<1 | 2 | 3 | 4, number>,
    [],
  );

  const minItemsByPosition = useMemo(
    () =>
      ({
        1: 5,
        2: 8,
        3: 24,
        4: 24,
      }) as Record<1 | 2 | 3 | 4, number>,
    [],
  );

  const featuredPositions = useMemo(() => [1, 2, 3, 4] as const, []);

  const [delayedPositions, setDelayedPositions] = useState<number[]>([1]);

  // Stagger the queries: Position 1 immediately, Position 2 after 200ms, Position 3 after 400ms, Position 4 after 600ms
  useEffect(() => {
    const timer2 = setTimeout(
      () => setDelayedPositions((prev) => [...prev, 2]),
      200,
    );
    const timer3 = setTimeout(
      () => setDelayedPositions((prev) => [...prev, 3]),
      400,
    );
    const timer4 = setTimeout(
      () => setDelayedPositions((prev) => [...prev, 4]),
      600,
    );
    return () => {
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const featuredQueries = useQueries({
    queries: featuredPositions.map((position) => ({
      queryKey: [
        "featured-position",
        position,
        data?.latitude ?? null,
        data?.longitude ?? null,
      ],
      queryFn: async () => {
        const url = featuredEndpoints[position];
        try {
          const response = await GET(url, {
            take: featuredTakeLimits[position],
          });
          return filterDisplayableProducts(getSuccessfulArrayData(response));
        } catch (err) {
          void err;
          if (position === 4) {
            const fallbackUrl =
              API.PRODUCT_SEARCH_NEW_SINGLE +
              `?take=${featuredTakeLimits[position]}&tag=discount`;
            const fallbackResponse = await GET(fallbackUrl);
            return filterDisplayableProducts(
              getSuccessfulArrayData(fallbackResponse),
            );
          }
        }
        return [];
      },
      enabled: delayedPositions.includes(position),
      refetchInterval: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })),
  });

  const featuredLoading = featuredQueries.some((query) => query.isLoading);

  const featuredProducts = useMemo<Record<1 | 2 | 3 | 4, Product[]>>(
    () => ({
      1: filterDisplayableProducts(featuredQueries[0]?.data),
      2: filterDisplayableProducts(featuredQueries[1]?.data),
      3: filterDisplayableProducts(featuredQueries[2]?.data),
      4: filterDisplayableProducts(featuredQueries[3]?.data),
    }),
    [featuredQueries],
  );

  const needsRecent = useMemo(() => {
    if (featuredLoading) return false;
    return featuredPositions.some((position) => {
      const minRequired = minItemsByPosition[position];
      return (featuredProducts[position]?.length ?? 0) < minRequired;
    });
  }, [
    featuredLoading,
    featuredPositions,
    minItemsByPosition,
    featuredProducts,
  ]);

  const { data: recentFallback = [] } = useQuery({
    queryKey: ["featured-recent-fallback"],
    queryFn: async () => {
      const url = API.PRODUCT_SEARCH_NEW_SINGLE + `?take=10&tag=recent`;
      const response = await GET(url);
      return filterDisplayableProducts(getSuccessfulArrayData(response));
    },
    enabled: needsRecent,
    refetchInterval: needsRecent ? 5 * 60 * 1000 : false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: allProductsPool = [] } = useQuery<Product[]>({
    queryKey: ["home-products-pool"],
    queryFn: async () => {
      const pageSize = 50;
      const maxPages = 50;

      const collected: Product[] = [];
      let page = 1;

      while (page <= maxPages) {
        const response = (await GET(API.FEATURED_ALL_PRODUCTS, {
          page,
          take: pageSize,
          order: "DESC",
        })) as unknown;

        if (!response || typeof response !== "object") break;
        const res = response as {
          status?: boolean;
          data?: unknown;
          meta?: { hasNextPage?: boolean };
        };

        if (res.status !== true) break;

        const pageItems = Array.isArray(res.data)
          ? res.data
          : res.data &&
              typeof res.data === "object" &&
              "data" in (res.data as Record<string, unknown>) &&
              Array.isArray((res.data as { data?: unknown }).data)
            ? ((res.data as { data?: unknown }).data as unknown[])
            : [];

        collected.push(...filterDisplayableProducts(pageItems));

        const hasNext =
          typeof res.meta?.hasNextPage === "boolean"
            ? res.meta.hasNextPage
            : pageItems.length >= pageSize;

        if (!hasNext) break;
        page += 1;
      }

      return dedupeProducts(collected);
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setRotationSeed((prev) => prev + 1);
    }, 30000);
    return () => clearInterval(rotationInterval);
  }, []);

  const positionItems = useMemo(() => {
    const desiredCounts = { 1: 25, 2: 24, 3: 36, 4: 36 } as const;
    const recent = filterDisplayableProducts(recentFallback);

    const featuredByPosition = {
      1: featuredProducts[1],
      2: featuredProducts[2],
      3: featuredProducts[3],
      4: featuredProducts[4],
    } as const;

    const globalPool = dedupeProducts([
      ...allProductsPool,
      ...recent,
      ...featuredByPosition[1],
      ...featuredByPosition[2],
      ...featuredByPosition[3],
      ...featuredByPosition[4],
    ]);

    const { newPool, oldPool } = splitNewOldPools(globalPool);

    const shuffledNew = shuffleCandidates(newPool, rotationSeed + 10);
    const shuffledOld = shuffleCandidates(oldPool, rotationSeed + 20);
    const shuffledAll = shuffleCandidates(globalPool, rotationSeed + 30);

    const used = new Set<string>();
    const allocationOrder: Array<1 | 2 | 3 | 4> = [4, 1, 2, 3];

    const results: Record<1 | 2 | 3 | 4, Product[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
    };

<<<<<<< HEAD
    const filterAvailableProducts = (products: any[]) => {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 3dcf364 (Done)
      if (!Array.isArray(products)) return [];
<<<<<<< HEAD
      return products.filter((item) => {
        // Check if product is available
        const isAvailable =
          item?.status === true ||
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 802ee6b (Done)
          (typeof item?.status === "string" &&
            item.status.toLowerCase() === "active");
        const hasStock = (item?.unit ?? 0) > 0;
        return isAvailable && hasStock;
=======
      return products.filter(isProductAvailable);
    };
=======
    const buildMixedSection = (position: 1 | 2 | 3 | 4) => {
      const desired = desiredCounts[position];
      const desiredNew = Math.round(desired * 0.3);
      const desiredOld = desired - desiredNew;
      const maxPerCategory = desired >= 30 ? 3 : 2;
      const categoryCounts = new Map<string, number>();
>>>>>>> cd8c0a7 (Update home sections: fill grids and mix categories)

      const pickedNew = takeUniqueProductsByCategory(
        shuffledNew,
        used,
        desiredNew,
        [],
        categoryCounts,
        maxPerCategory,
      );
      const pickedOld = takeUniqueProductsByCategory(
        shuffledOld,
        used,
        desiredOld,
        [],
        categoryCounts,
        maxPerCategory,
      );

      const combined = [...pickedOld, ...pickedNew];

      if (combined.length < desired) {
        const fillers = takeUniqueProductsByCategory(
          shuffledAll,
          used,
          desired - combined.length,
          [],
          categoryCounts,
          maxPerCategory,
        );
        combined.push(...fillers);
      }

      if (combined.length < desired) {
        const fillers = takeUniqueProducts(
          shuffledAll,
          used,
          desired - combined.length,
          [],
        );
        combined.push(...fillers);
      }

      const normalizedPreferredTokens = Array.from(
        new Set(
          PREFERRED_CATEGORY_TOKENS.map((token) =>
            normalizeCategoryText(token),
          ),
        ),
      ).filter(Boolean);

      const recomputeCategoryCounts = () => {
        const map = new Map<string, number>();
        for (const item of combined) {
          const key = getCategoryKey(item);
          if (!key) continue;
          map.set(key, (map.get(key) ?? 0) + 1);
        }
        return map;
      };

      const sectionCounts = recomputeCategoryCounts();

      for (const token of normalizedPreferredTokens) {
        const alreadyHas = combined.some((item) =>
          productMatchesCategoryToken(item, token),
        );
        if (alreadyHas) continue;

        const candidate = shuffledAll.find((item) => {
          const id = getProductIdentifier(item);
          if (!id) return false;
          if (used.has(id)) return false;
          return productMatchesCategoryToken(item, token);
        });

        if (!candidate) continue;

        if (combined.length < desired) {
          const id = getProductIdentifier(candidate);
          if (id) used.add(id);
          combined.push(candidate);
          const key = getCategoryKey(candidate);
          if (key) sectionCounts.set(key, (sectionCounts.get(key) ?? 0) + 1);
          continue;
        }

        const removableIndex = combined.findIndex((item) => {
          const isPreferred = normalizedPreferredTokens.some((preferred) =>
            productMatchesCategoryToken(item, preferred),
          );
          if (isPreferred) return false;
          const key = getCategoryKey(item);
          if (!key) return true;
          return (sectionCounts.get(key) ?? 0) > 1;
        });

        if (removableIndex < 0) continue;

        const removed = combined.splice(removableIndex, 1)[0];
        const removedId = removed ? getProductIdentifier(removed) : null;
        if (removedId) used.delete(removedId);
        const removedKey = removed ? getCategoryKey(removed) : null;
        if (removedKey) {
          const next = (sectionCounts.get(removedKey) ?? 1) - 1;
          if (next <= 0) sectionCounts.delete(removedKey);
          else sectionCounts.set(removedKey, next);
        }

        const candidateId = getProductIdentifier(candidate);
        if (candidateId) used.add(candidateId);
        combined.push(candidate);
        const candidateKey = getCategoryKey(candidate);
        if (candidateKey) {
          sectionCounts.set(
            candidateKey,
            (sectionCounts.get(candidateKey) ?? 0) + 1,
          );
        }
      }

<<<<<<< HEAD
      const categories = seededShuffle(Array.from(byCategory.keys()), seed).sort((a, b) => {
        const wa = categoryWeight.get(a) ?? 0;
        const wb = categoryWeight.get(b) ?? 0;
        return wb - wa;
>>>>>>> 2df6f5a (Done)
      });
      const groups = categories.map((cat, idx) => ({
        cat,
        items: seededShuffle(byCategory.get(cat) ?? [], seed + (idx + 1) * 97),
        cursor: 0,
        weight: categoryWeight.get(cat) ?? 0,
      }));

      const result: any[] = [];
      while (result.length < take) {
        let progressed = false;
        for (const g of groups) {
          if (result.length >= take) break;
          const pullsThisRound = g.weight > 0 ? 2 : 1;
          for (let p = 0; p < pullsThisRound && result.length < take; p++) {
            if (g.cursor < g.items.length) {
              result.push(g.items[g.cursor]);
              g.cursor += 1;
              progressed = true;
            }
          }
        }
        if (!progressed) break;
      }

      return result;
=======
      return shuffleCandidates(combined, rotationSeed + position * 1000);
>>>>>>> cd8c0a7 (Update home sections: fill grids and mix categories)
    };

    for (const position of allocationOrder) {
      results[position] = buildMixedSection(position);
    }

<<<<<<< HEAD
    const isNewProduct = (item: any, nowMs: number) => {
      const createdAt = item?.createdAt ?? item?.created_at ?? item?.created;
      if (!createdAt) return false;
      const t = new Date(createdAt).getTime();
      if (!Number.isFinite(t)) return false;
      return nowMs - t <= 7 * 24 * 60 * 60 * 1000;
    };

    const mergeMostlyOld = (oldItems: any[], newItems: any[], seed: number) => {
      const result: any[] = [];
      const old = seededShuffle(oldItems, seed + 401);
      const neu = seededShuffle(newItems, seed + 701);
      let oi = 0;
      let ni = 0;
      while (oi < old.length || ni < neu.length) {
        for (let k = 0; k < 2 && oi < old.length; k++) {
          result.push(old[oi]);
          oi += 1;
        }
        if (ni < neu.length) {
          result.push(neu[ni]);
          ni += 1;
        }
        if (oi >= old.length && ni >= neu.length) break;
      }
      return result;
    };

    const buildItems = (position: 1 | 2 | 3 | 4) => {
      const featured = filterAvailableProducts(
        featuredProducts[position] || [],
      );
=======
      return products.filter(
        (item) =>
          item?.status !== false && // Product must be active
          item?.unit !== 0, // Product must have stock
      );
=======
          (typeof item?.status === "string" && item.status.toLowerCase() === "active");
        const hasStock = (item?.unit ?? 0) > 0;
        return isAvailable && hasStock;
      });
>>>>>>> 3dcf364 (Done)
    };

    const buildItems = (position: 1 | 2 | 3 | 4) => {
<<<<<<< HEAD
      const featured = filterAvailableProducts(featuredProducts[position] || []);
>>>>>>> 2680899 (Done)
=======
      const featured = filterAvailableProducts(
        featuredProducts[position] || [],
      );
>>>>>>> 4c3b678 (Done)
      const fallback = filterAvailableProducts(recentFallback || []);
      const minRequired = minItemsByPosition[position] ?? 6;
      const desiredCount = displayCountByPosition[position] ?? minRequired;

      // Create unique seed for each position to ensure different products in each section
      // Combines rotation time with position number for consistent but different randomization
      const positionSeed = rotationTime + position * 100;
      const nowMs = Date.now();

      const combinedPool = [...featured, ...fallback];
      const seen = new Set<string>();
      const uniquePool = combinedPool.filter((item) => {
        const id = getIdentifier(item);
        const key = id == null ? "" : String(id);
        if (!key) return true;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

<<<<<<< HEAD
        if (shuffledFeatured.length >= minRequired) {
          return shuffledFeatured.slice(0, minRequired);
        }

        if (!fallback?.length) {
          return shuffledFeatured;
        }

        const featuredIds = new Set(
<<<<<<< HEAD
<<<<<<< HEAD
          shuffledFeatured.map(
            (item: any) => item?.id ?? item?._id ?? item?.slug,
          ),
=======
          shuffledFeatured.map((item: any) => item?.id ?? item?._id ?? item?.slug),
>>>>>>> 2680899 (Done)
=======
          shuffledFeatured.map(
            (item: any) => item?.id ?? item?._id ?? item?.slug,
          ),
>>>>>>> 4c3b678 (Done)
        );

        const shuffledFallback = seededShuffle(fallback, positionSeed * 2);
        const fillers = shuffledFallback.filter((item: any) => {
          const identifier = item?.id ?? item?._id ?? item?.slug;
          return identifier ? !featuredIds.has(identifier) : true;
        });

        const combined = [...shuffledFeatured, ...fillers];
        return combined.slice(0, minRequired);
      } else {
        // If showing old products, prioritize recent/fallback with randomization
        const shuffledFallback = seededShuffle(fallback, positionSeed * 3);

        if (!shuffledFallback?.length) {
          return seededShuffle(featured, positionSeed);
        }

        if (featured.length >= minRequired) {
          const shuffledFeatured = seededShuffle(featured, positionSeed * 4);
          const featuredIds = new Set(
<<<<<<< HEAD
<<<<<<< HEAD
            shuffledFeatured.map(
              (item: any) => item?.id ?? item?._id ?? item?.slug,
            ),
=======
            shuffledFeatured.map((item: any) => item?.id ?? item?._id ?? item?.slug),
>>>>>>> 2680899 (Done)
=======
            shuffledFeatured.map(
              (item: any) => item?.id ?? item?._id ?? item?.slug,
            ),
>>>>>>> 4c3b678 (Done)
          );

          const uniqueFeatured = shuffledFeatured.filter((item: any) => {
            const identifier = item?.id ?? item?._id ?? item?.slug;
            return identifier
              ? !shuffledFallback.some((r: any) => {
                  const rid = r?.id ?? r?._id ?? r?.slug;
                  return rid === identifier;
                })
              : true;
          });

          const combined = [...shuffledFallback, ...uniqueFeatured];
          return combined.slice(0, minRequired);
        }

        return shuffledFallback.slice(0, minRequired);
=======
      if (uniquePool.length < minRequired) {
        return seededShuffle(uniquePool, positionSeed).slice(0, desiredCount);
>>>>>>> 2df6f5a (Done)
      }

      const newPool = uniquePool.filter((item) => isNewProduct(item, nowMs));
      const oldPool = uniquePool.filter((item) => !isNewProduct(item, nowMs));

      const oldTarget = Math.max(0, Math.min(desiredCount, Math.ceil(desiredCount * 0.6)));
      const newTarget = Math.max(0, desiredCount - oldTarget);

      const pickedOld = diversifyByCategory(oldPool, positionSeed + 17, oldTarget);
      const pickedNew = diversifyByCategory(newPool, positionSeed + 31, newTarget);

      const merged = mergeMostlyOld(pickedOld, pickedNew, positionSeed + 43);
      const mergedSeen = new Set<string>();
      const mergedUnique = merged.filter((item) => {
        const id = getIdentifier(item);
        const key = id == null ? "" : String(id);
        if (!key) return true;
        if (mergedSeen.has(key)) return false;
        mergedSeen.add(key);
        return true;
      });

      if (mergedUnique.length >= desiredCount) {
        return mergedUnique.slice(0, desiredCount);
      }

      const remainder = uniquePool.filter((item) => {
        const id = getIdentifier(item);
        const key = id == null ? "" : String(id);
        return key ? !mergedSeen.has(key) : true;
      });
      const filler = diversifyByCategory(remainder, positionSeed + 59, desiredCount - mergedUnique.length);
      return [...mergedUnique, ...filler].slice(0, desiredCount);
    };

    return {
      1: buildItems(1),
      2: buildItems(2),
      3: buildItems(3),
      4: buildItems(4),
    };
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 4c3b678 (Done)
  }, [
    featuredProducts,
    recentFallback,
    minItemsByPosition,
    displayCountByPosition,
    rotationTime,
  ]);
<<<<<<< HEAD
=======
  }, [featuredProducts, recentFallback, minItemsByPosition, showNewProducts, rotationTime]);
>>>>>>> 2680899 (Done)
=======
>>>>>>> 4c3b678 (Done)
=======
    return results;
  }, [featuredProducts, recentFallback, rotationSeed, allProductsPool]);
>>>>>>> cd8c0a7 (Update home sections: fill grids and mix categories)

  const position1Items = positionItems[1];
  const position2Items = positionItems[2];
  const position3Items = positionItems[3];
  const position4Items = positionItems[4];
  const recentVisitedPreview = useMemo(() => {
<<<<<<< HEAD
    const recent = Array.isArray(history) ? history.slice(0, 7) : [];
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 3dcf364 (Done)
    // Filter out unavailable products from recent history
    const filtered = recent.filter((item) => {
      // Check if product is available
      const status = item?.status;
      const isAvailable =
<<<<<<< HEAD
        item?.status === true ||
<<<<<<< HEAD
<<<<<<< HEAD
        (typeof item?.status === "string" &&
          item.status.toLowerCase() === "active");
      const hasStock = (item?.unit ?? 0) > 0;
=======
        status === true ||
        status === 1 ||
        (typeof status === "string" && status.toLowerCase() === "active");
      const unitCount = Number(item?.unit ?? 0);
      const hasStock = Number.isFinite(unitCount) && unitCount > 0;
>>>>>>> 2df6f5a (Done)
      return isAvailable && hasStock;
    });
    // Randomize recent products with different seed to show variety
    const recentSeed = rotationTime + 250;
    return seededShuffle(filtered, recentSeed);
=======
    // Randomize recent products with different seed to show variety
    const recentSeed = rotationTime + 250;
    return seededShuffle(recent, recentSeed);
>>>>>>> 2680899 (Done)
=======
        (typeof item?.status === "string" && item.status.toLowerCase() === "active");
=======
        (typeof item?.status === "string" &&
          item.status.toLowerCase() === "active");
>>>>>>> 802ee6b (Done)
      const hasStock = (item?.unit ?? 0) > 0;
      return isAvailable && hasStock;
    });
    // Randomize recent products with different seed to show variety
    const recentSeed = rotationTime + 250;
    return seededShuffle(filtered, recentSeed);
>>>>>>> 3dcf364 (Done)
  }, [history, rotationTime]);

  // Filter out unavailable products from all products with randomization
  const allProducts = useMemo(() => {
    const rawProducts =
      (allProductsResponse?.data as any[]) ??
      (Array.isArray(allProductsResponse) ? allProductsResponse : []);

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 3dcf364 (Done)
    if (!Array.isArray(rawProducts)) return [];

    const filtered = rawProducts.filter((item) => {
      // Check if product is available
      const status = item?.status;
      const isAvailable =
<<<<<<< HEAD
        item?.status === true ||
<<<<<<< HEAD
<<<<<<< HEAD
        (typeof item?.status === "string" &&
          item.status.toLowerCase() === "active");
      const hasStock = (item?.unit ?? 0) > 0;
=======
        status === true ||
        status === 1 ||
        (typeof status === "string" && status.toLowerCase() === "active");
      const unitCount = Number(item?.unit ?? 0);
      const hasStock = Number.isFinite(unitCount) && unitCount > 0;
>>>>>>> 2df6f5a (Done)
      return isAvailable && hasStock;
    });
=======
    const filtered = rawProducts.filter(
      (item) =>
        item?.status !== false && // Product must be active
        item?.unit !== 0, // Product must have stock
    );
>>>>>>> 2680899 (Done)
=======
        (typeof item?.status === "string" && item.status.toLowerCase() === "active");
=======
        (typeof item?.status === "string" &&
          item.status.toLowerCase() === "active");
>>>>>>> 802ee6b (Done)
      const hasStock = (item?.unit ?? 0) > 0;
      return isAvailable && hasStock;
    });
>>>>>>> 3dcf364 (Done)

    // Randomize the order of all products using rotation time as seed
    // This creates a unique but deterministic randomization per time period
    const allProductSeed = rotationTime + 500;
    return seededShuffle(filtered, allProductSeed);
  }, [allProductsResponse, rotationTime]);
=======
    const items = filterDisplayableProducts(
      Array.isArray(history) ? history : [],
    );
    return items.slice(0, 7);
  }, [history]);
>>>>>>> cd8c0a7 (Update home sections: fill grids and mix categories)

  const showPosition1 = position1Items.length > 0;
  const showPosition2 = position2Items.length > 0;
  const showPosition3 = position3Items.length > 0;
  const showPosition4 = position4Items.length > 0;
  const allProductsPreview = useMemo(
    () => shuffleCandidates(allProductsPool, rotationSeed + 777).slice(0, 20),
    [allProductsPool, rotationSeed],
  );

  return (
    <div className="page-Box">
      {/* FEATURED PRODUCTS - POSITION 1 (Top Featured Section - ABOVE Banner) */}
      {/* CategoryNav is now responsible for all category navigation and scrolling */}

      {banners.length ? (
        <>
          <Banners data={banners} />
          <div className="HomeSCreen-space" />
        </>
      ) : null}

      {showPosition4 && (
        <>
          <DiscountedDealsSection products={position4Items} />
          <div className="HomeSCreen-space" />
        </>
      )}

      {showPosition1 && (
        <>
          <PlatinumSection products={position1Items} />
          <div className="HomeSCreen-space" />
        </>
      )}

      {showPosition2 && (
        <>
          <GoldSection products={position2Items} />
          <div className="HomeSCreen-space" />
        </>
      )}

      {/* TopSellingStore - Commented out as requested */}
      {/* <TopSellingStore /> */}
      {/* <div className="HomeSCreen-space" /> */}

      {showPosition3 && (
        <>
          <SilverSection products={position3Items} />
          <div className="HomeSCreen-space" />
        </>
      )}

      {/* Category Featured Products Section - Removed as requested */}
      {/* {subCategories?.length > 0 && (
        <>
          <CategoryFeaturedProducts categories={subCategories} />
          <div className="HomeSCreen-space" />
        </>
      )} */}

      <FeaturedItems />
      {allProductsPreview.length > 0 && (
        <>
          {/* <div className="HomeSCreen-space" /> */}
          <PopularItems
            data={allProductsPreview}
            title="All Products"
            type="all"
          />
        </>
      )}
      {history.length > 0 && token ? (
        <>
          <div className="HomeSCreen-space" />
          <PopularItems
            data={recentVisitedPreview}
            title="Recently Visited Products"
            type="visited"
          />
        </>
      ) : null}
      <div className="HomeSCreen-space" />
    </div>
  );
}

export default Home;
