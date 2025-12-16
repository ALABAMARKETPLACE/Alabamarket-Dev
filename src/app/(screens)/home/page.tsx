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
import GoldSection from "./_components/goldSection";
import SilverSection from "./_components/silverSection";

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
      } as Record<1 | 2 | 3, string>),
    []
  );

  const featuredTakeLimits = useMemo(
    () =>
      ({
        1: 10,
        2: 12,
        3: 30,
      } as Record<1 | 2 | 3, number>),
    []
  );

  const minItemsByPosition = useMemo(
    () =>
      ({
        1: 5,
        2: 8,
        3: 20,
      } as Record<1 | 2 | 3, number>),
    []
  );

  const featuredPositions = useMemo(() => [1, 2, 3] as const, []);

  const [delayedPositions, setDelayedPositions] = useState<number[]>([]);

  // Stagger the queries: Position 1 immediately, Position 2 after 200ms, Position 3 after 400ms
  useEffect(() => {
    setDelayedPositions([1]);
    const timer2 = setTimeout(() => setDelayedPositions((prev) => [...prev, 2]), 200);
    const timer3 = setTimeout(() => setDelayedPositions((prev) => [...prev, 3]), 400);
    return () => {
      clearTimeout(timer2);
      clearTimeout(timer3);
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
        const response: any = await GET(url, {
          take: featuredTakeLimits[position],
        });
        if (response?.status && Array.isArray(response?.data)) {
          return response.data;
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

  const featuredProducts = useMemo<Record<1 | 2 | 3, any[]>>(
    () => ({
      1: featuredQueries[0]?.data ?? [],
      2: featuredQueries[1]?.data ?? [],
      3: featuredQueries[2]?.data ?? [],
    }),
    [
      featuredQueries[0]?.data,
      featuredQueries[1]?.data,
      featuredQueries[2]?.data,
    ]
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

  useEffect(() => {
    getBanners();
    getUserHistory();
  }, [data, token]);

  const positionItems = useMemo(() => {
    const buildItems = (position: 1 | 2 | 3) => {
      const featured = featuredProducts[position] || [];
      const minRequired = minItemsByPosition[position] ?? 6;

      if (!featured.length) {
        return recentFallback || [];
      }

      if (!recentFallback?.length) {
        return featured;
      }

      if (featured.length >= minRequired) {
        return featured;
      }

      const featuredIds = new Set(
        featured.map((item: any) => item?.id ?? item?._id ?? item?.slug)
      );

      const fillers = recentFallback.filter((item: any) => {
        const identifier = item?.id ?? item?._id ?? item?.slug;
        return identifier ? !featuredIds.has(identifier) : true;
      });

      const combined = [...featured, ...fillers];
      return combined.slice(0, minRequired);
    };

    return {
      1: buildItems(1),
      2: buildItems(2),
      3: buildItems(3),
    };
  }, [featuredProducts, recentFallback, minItemsByPosition]);

  const position1Items = positionItems[1];
  const position2Items = positionItems[2];
  const position3Items = positionItems[3];
  const recentVisitedPreview = useMemo(
    () => (Array.isArray(history) ? history.slice(0, 7) : []),
    [history]
  );
  const allProducts =
    (allProductsResponse?.data as any[]) ??
    (Array.isArray(allProductsResponse) ? allProductsResponse : []);

  const showPosition1 = position1Items.length > 0;
  const showPosition2 = position2Items.length > 0;
  const showPosition3 = position3Items.length > 0;

  return (
    <div className="page-Box">
      {/* FEATURED PRODUCTS - POSITION 1 (Top Featured Section - ABOVE Banner) */}
      {subCategories?.length ? (
        <>
          <SubCategoryList data={subCategories} />
          {/* <div className="HomeSCreen-space" /> */}
        </>
      ) : null}

      {Banner?.length ? (
        <>
          <Banners data={Banner} />
          <div className="HomeSCreen-space" />
        </>
      ) : null}

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
