"use client";
import React, { useEffect, useMemo, useState } from "react";
import Banners from "./_components/banner";
import API from "../../../config/API";
import { useSelector } from "react-redux";
import { reduxLatLong } from "../../../redux/slice/locationSlice";
import { GET } from "../../../util/apicall";
import "./style.scss";
import SubCategoryList from "./_components/subCategoryList";
import { reduxSubcategoryItems } from "../../../redux/slice/categorySlice";
import PopularItems from "./_components/popularItems";
import FeaturedItems from "./_components/featured_items";
import { reduxAccessToken } from "../../../redux/slice/authSlice";
import { jwtDecode } from "jwt-decode";
import { useQueries, useQuery } from "@tanstack/react-query";
import FeaturedPosition from "./_components/featuredPosition";
import PlatinumSection from "./_components/platinumSection";
import DiscountedDealsSection from "./_components/discountedDealsSection";
import GoldSection from "./_components/goldSection";
import SilverSection from "./_components/silverSection";
// import CategoryFeaturedProducts from "./_components/categoryFeaturedProducts";

function Home() {
  const [Banner, setBanners] = useState([]);
  const data = useSelector(reduxLatLong);
  const subCategories = useSelector(reduxSubcategoryItems);
  const [history, setHistory] = useState<any[]>([]);
  const token = useSelector(reduxAccessToken);

  const getBanners = async () => {
    const url = API.GET_HOMESCREEN;
    try {
      const banners: any = await GET(url, {});
      if (banners.status) {
        setBanners(banners.data);
      }
    } catch (err) {
      console.log("failed to get banneers");
    }
  };

  const getUserHistory = async () => {
    const url = API.USER_HISTORY;
    try {
      let currentDate = new Date();
      if (!token) return;
      const decoded: any = jwtDecode(token);
      if (decoded.exp && decoded.exp * 1000 + 10000 > currentDate.getTime()) {
        const response: any = await GET(url);
        if (response?.status) {
          setHistory(response?.data);
        }
      }
    } catch (err) {}
  };

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
        1: 40,
        2: 40,
        3: 60,
        4: 40,
      }) as Record<1 | 2 | 3 | 4, number>,
    [],
  );

  const displayCountByPosition = useMemo(
    () =>
      ({
        1: 16,
        2: 16,
        3: 16,
        4: 16,
      }) as Record<1 | 2 | 3 | 4, number>,
    [],
  );

  const minItemsByPosition = useMemo(
    () =>
      ({
        1: 16,
        2: 16,
        3: 16,
        4: 16,
      }) as Record<1 | 2 | 3 | 4, number>,
    [],
  );

  const featuredPositions = useMemo(() => [1, 2, 3, 4] as const, []);

  const [delayedPositions, setDelayedPositions] = useState<number[]>([]);

  // Stagger the queries: Position 1 immediately, Position 2 after 200ms, Position 3 after 400ms, Position 4 after 600ms
  useEffect(() => {
    setDelayedPositions([1]);
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
        // For position 4, add fallback to discount tag
        try {
          const response: any = await GET(url, {
            take: featuredTakeLimits[position],
          });
          if (response?.status && Array.isArray(response?.data)) {
            return response.data;
          }
        } catch (err) {
          if (position === 4) {
            // Fallback to discount tag for position 4
            const fallbackUrl =
              API.PRODUCT_SEARCH_NEW_SINGLE +
              `?take=${featuredTakeLimits[position]}&tag=discount`;
            const fallbackResponse: any = await GET(fallbackUrl);
            if (
              fallbackResponse?.status &&
              Array.isArray(fallbackResponse?.data)
            ) {
              return fallbackResponse.data;
            }
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

  const featuredProducts = useMemo<Record<1 | 2 | 3 | 4, any[]>>(
    () => ({
      1: featuredQueries[0]?.data ?? [],
      2: featuredQueries[1]?.data ?? [],
      3: featuredQueries[2]?.data ?? [],
      4: featuredQueries[3]?.data ?? [],
    }),
    [
      featuredQueries[0]?.data,
      featuredQueries[1]?.data,
      featuredQueries[2]?.data,
      featuredQueries[3]?.data,
    ],
  );

  const { data: recentFallback = [] } = useQuery({
    queryKey: ["featured-recent-fallback"],
    queryFn: async () => {
      const url = API.PRODUCT_SEARCH_NEW_SINGLE + `?take=80&tag=recent`;
      const response: any = await GET(url);
      if (response?.status && Array.isArray(response?.data)) {
        return response.data;
      }
      return [];
    },
    enabled: true,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: allProductsResponse } = useQuery({
    queryKey: ["featured-products-all"],
    queryFn: async () => {
      const response: any = await GET(API.FEATURED_ALL_PRODUCTS, {
        page: 1,
        take: 20,
        order: "DESC",
      });
      if (response?.status && Array.isArray(response?.data)) {
        return response;
      }
      return { data: [] };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    gcTime: 10 * 60 * 1000,
  });

  // State to track rotation time for consistent random selection
  const [rotationTime, setRotationTime] = useState(() =>
    Math.floor(Date.now() / 30000),
  );

  useEffect(() => {
    getBanners();
    getUserHistory();
    // Rotate products every 30 seconds - different sections get different products
    const rotationInterval = setInterval(() => {
      setRotationTime(Math.floor(Date.now() / 30000));
    }, 30000);
    return () => clearInterval(rotationInterval);
  }, [data, token]);

  // Helper function to create a seeded random shuffle based on time and section
  const seededShuffle = (array: any[], seed: number): any[] => {
    if (!array || array.length === 0) return [];
    const shuffled = [...array];
    let t = (seed | 0) + 0x6d2b79f5;
    const rand = () => {
      t += 0x6d2b79f5;
      let x = Math.imul(t ^ (t >>> 15), 1 | t);
      x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const positionItems = useMemo(() => {
    const isProductAvailable = (item: any) => {
      const status = item?.status;
      const isAvailable =
        status === true ||
        status === 1 ||
        (typeof status === "string" && status.toLowerCase() === "active");
      const unitCount = Number(item?.unit ?? 0);
      const hasStock = Number.isFinite(unitCount) && unitCount > 0;
      return isAvailable && hasStock;
    };

    const filterAvailableProducts = (products: any[]) => {
      if (!Array.isArray(products)) return [];
      return products.filter(isProductAvailable);
    };

    const getCategoryKey = (item: any) => {
      const raw =
        item?.categoryId ??
        item?.category_id ??
        item?.category?._id ??
        item?.category?.id ??
        item?.category?.slug ??
        item?.subCategoryId ??
        item?.subCategory_id ??
        item?.subCategory?._id ??
        item?.subCategory?.id ??
        item?.subCategory?.slug ??
        item?.subcategoryId ??
        item?.subcategory_id ??
        item?.subcategory?._id ??
        item?.subcategory?.id ??
        item?.subcategory?.slug;
      const key = raw == null ? "" : String(raw);
      return key || "uncategorized";
    };

    const getCategoryLabel = (item: any) => {
      const raw =
        item?.categoryName ??
        item?.category_name ??
        item?.category?.name ??
        item?.category?.title ??
        item?.subCategoryName ??
        item?.subCategory_name ??
        item?.subCategory?.name ??
        item?.subCategory?.title ??
        item?.subcategoryName ??
        item?.subcategory_name ??
        item?.subcategory?.name ??
        item?.subcategory?.title;
      return typeof raw === "string" ? raw : "";
    };

    const diversifyByCategory = (items: any[], seed: number, take: number) => {
      if (!Array.isArray(items) || items.length === 0) return [];
      const byCategory = new Map<string, any[]>();
      const categoryWeight = new Map<string, number>();

      const weightFromLabel = (label: string) => {
        const t = label.toLowerCase();
        let weight = 0;
        if (t.includes("phone") || t.includes("mobile")) weight = Math.max(weight, 3);
        if (t.includes("solar")) weight = Math.max(weight, 3);
        if (t.includes("electronic")) weight = Math.max(weight, 2);
        return weight;
      };

      for (const item of items) {
        const key = getCategoryKey(item);
        const list = byCategory.get(key);
        if (list) list.push(item);
        else byCategory.set(key, [item]);

        const labelWeight = weightFromLabel(getCategoryLabel(item));
        if (labelWeight > (categoryWeight.get(key) ?? 0)) {
          categoryWeight.set(key, labelWeight);
        }
      }

      const categories = seededShuffle(Array.from(byCategory.keys()), seed).sort((a, b) => {
        const wa = categoryWeight.get(a) ?? 0;
        const wb = categoryWeight.get(b) ?? 0;
        return wb - wa;
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
    };

    const getIdentifier = (item: any) =>
      item?.id ?? item?._id ?? item?.slug ?? item?.pid ?? null;

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

      if (uniquePool.length < minRequired) {
        return seededShuffle(uniquePool, positionSeed).slice(0, desiredCount);
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
  }, [
    featuredProducts,
    recentFallback,
    minItemsByPosition,
    displayCountByPosition,
    rotationTime,
  ]);

  const position1Items = positionItems[1];
  const position2Items = positionItems[2];
  const position3Items = positionItems[3];
  const position4Items = positionItems[4];
  const recentVisitedPreview = useMemo(() => {
    const recent = Array.isArray(history) ? history.slice(0, 7) : [];
    // Filter out unavailable products from recent history
    const filtered = recent.filter((item) => {
      // Check if product is available
      const status = item?.status;
      const isAvailable =
        status === true ||
        status === 1 ||
        (typeof status === "string" && status.toLowerCase() === "active");
      const unitCount = Number(item?.unit ?? 0);
      const hasStock = Number.isFinite(unitCount) && unitCount > 0;
      return isAvailable && hasStock;
    });
    // Randomize recent products with different seed to show variety
    const recentSeed = rotationTime + 250;
    return seededShuffle(filtered, recentSeed);
  }, [history, rotationTime]);

  // Filter out unavailable products from all products with randomization
  const allProducts = useMemo(() => {
    const rawProducts =
      (allProductsResponse?.data as any[]) ??
      (Array.isArray(allProductsResponse) ? allProductsResponse : []);

    if (!Array.isArray(rawProducts)) return [];

    const filtered = rawProducts.filter((item) => {
      // Check if product is available
      const status = item?.status;
      const isAvailable =
        status === true ||
        status === 1 ||
        (typeof status === "string" && status.toLowerCase() === "active");
      const unitCount = Number(item?.unit ?? 0);
      const hasStock = Number.isFinite(unitCount) && unitCount > 0;
      return isAvailable && hasStock;
    });

    // Randomize the order of all products using rotation time as seed
    // This creates a unique but deterministic randomization per time period
    const allProductSeed = rotationTime + 500;
    return seededShuffle(filtered, allProductSeed);
  }, [allProductsResponse, rotationTime]);

  const showPosition1 = position1Items.length > 0;
  const showPosition2 = position2Items.length > 0;
  const showPosition3 = position3Items.length > 0;
  const showPosition4 = position4Items.length > 0;

  return (
    <div className="page-Box">
      {/* FEATURED PRODUCTS - POSITION 1 (Top Featured Section - ABOVE Banner) */}
      {/* CategoryNav is now responsible for all category navigation and scrolling */}

      {Banner?.length ? (
        <>
          <Banners data={Banner} />
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
      {Array.isArray(allProducts) && allProducts.length > 0 && (
        <>
          {/* <div className="HomeSCreen-space" /> */}
          <PopularItems data={allProducts} title="All Products" type="all" />
        </>
      )}
      {history?.length > 0 && token ? (
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
