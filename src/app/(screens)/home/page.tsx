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
  const [showNewProducts, setShowNewProducts] = useState(true);
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
        1: 10,
        2: 12,
        3: 30,
        4: 12,
      }) as Record<1 | 2 | 3 | 4, number>,
    [],
  );

  const minItemsByPosition = useMemo(
    () =>
      ({
        1: 5,
        2: 8,
        3: 20,
        4: 12,
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

  const featuredLoading = featuredQueries.some((query) => query.isLoading);

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

  const needsRecent = useMemo(() => {
    if (featuredLoading) {
      return false;
    }
    return featuredPositions.some((position) => {
      const minRequired = minItemsByPosition[position];
      return (featuredProducts[position]?.length ?? 0) < minRequired;
    });
  }, [
    featuredLoading,
    featuredProducts,
    featuredPositions,
    minItemsByPosition,
  ]);

  const { data: recentFallback = [], isLoading: recentLoading } = useQuery({
    queryKey: ["featured-recent-fallback"],
    queryFn: async () => {
      const url = API.PRODUCT_SEARCH_NEW_SINGLE + `?take=10&tag=recent`;
      const response: any = await GET(url);
      if (response?.status && Array.isArray(response?.data)) {
        return response.data;
      }
      return [];
    },
    enabled: needsRecent,
    refetchInterval: needsRecent ? 5 * 60 * 1000 : false,
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
      setShowNewProducts((prev) => !prev);
    }, 30000);
    return () => clearInterval(rotationInterval);
  }, [data, token]);

  // Helper function to create a seeded random shuffle based on time and section
  const seededShuffle = (array: any[], seed: number): any[] => {
    if (!array || array.length === 0) return [];
    const shuffled = [...array];
    // Simple seeded random using seed value
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(((seed * (i + 1)) % 997) * (i + 1)) % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const positionItems = useMemo(() => {
    // Helper function to filter out unavailable products
    const filterAvailableProducts = (products: any[]) => {
      if (!Array.isArray(products)) return [];
      return products.filter((item) => {
        // Check if product is available
        const isAvailable =
          item?.status === true ||
          (typeof item?.status === "string" && item.status.toLowerCase() === "active");
        const hasStock = (item?.unit ?? 0) > 0;
        return isAvailable && hasStock;
      });
    };

    const buildItems = (position: 1 | 2 | 3 | 4) => {
      const featured = filterAvailableProducts(
        featuredProducts[position] || [],
      );
      const fallback = filterAvailableProducts(recentFallback || []);
      const minRequired = minItemsByPosition[position] ?? 6;

      // Create unique seed for each position to ensure different products in each section
      // Combines rotation time with position number for consistent but different randomization
      const positionSeed = rotationTime + position * 100;

      // If showing new products, prioritize featured with randomization
      if (showNewProducts) {
        // Shuffle featured products for this position
        const shuffledFeatured = seededShuffle(featured, positionSeed);

        if (shuffledFeatured.length >= minRequired) {
          return shuffledFeatured.slice(0, minRequired);
        }

        if (!fallback?.length) {
          return shuffledFeatured;
        }

        const featuredIds = new Set(
          shuffledFeatured.map(
            (item: any) => item?.id ?? item?._id ?? item?.slug,
          ),
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
            shuffledFeatured.map(
              (item: any) => item?.id ?? item?._id ?? item?.slug,
            ),
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
      }
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
    showNewProducts,
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
      const isAvailable =
        item?.status === true ||
        (typeof item?.status === "string" && item.status.toLowerCase() === "active");
      const hasStock = (item?.unit ?? 0) > 0;
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
      const isAvailable =
        item?.status === true ||
        (typeof item?.status === "string" && item.status.toLowerCase() === "active");
      const hasStock = (item?.unit ?? 0) > 0;
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
