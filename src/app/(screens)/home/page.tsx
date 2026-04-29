"use client";
import { useEffect, useRef, useState } from "react";
import Banners from "./_components/banner";
import API from "../../../config/API";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { GET } from "../../../util/apicall";
import "./style.scss";
import PopularItems from "./_components/popularItems";
import ProductItem from "../../../components/productItem/page";
import { Col, Container, Row } from "react-bootstrap";
import { reduxAccessToken } from "../../../redux/slice/authSlice";
import { jwtDecode } from "jwt-decode";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import CategorySidebar from "./_components/categorySidebar";
import {
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiHeadphones,
} from "react-icons/fi";
import { reduxCategoryItems } from "../../../redux/slice/categorySlice";

type Product = {
  id?: string | number;
  _id?: string | number;
  pid?: string | number;
  slug?: string;
  status?: boolean;
  unit?: number | string;
  [key: string]: unknown;
};

function isDisplayable(item: unknown): item is Product {
  if (!item || typeof item !== "object") return false;
  const p = item as Product;
  if (p.status === false) return false;
  const unit = Number(p.unit);
  if (Number.isFinite(unit) && unit <= 0) return false;
  return true;
}

function filterDisplayable(items: unknown): Product[] {
  if (!Array.isArray(items)) return [];
  return items.filter(isDisplayable);
}

function getArrayData(response: unknown): unknown[] {
  if (!response || typeof response !== "object") return [];
  const r = response as { status?: boolean; data?: unknown };
  if (r.status !== true || !Array.isArray(r.data)) return [];
  return r.data;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="home-skeleton-card">
      <div className="home-skeleton-img" />
      <div className="home-skeleton-info">
        <span className="home-skeleton-name" />
        <span className="home-skeleton-price" />
      </div>
    </div>
  );
}

function SkeletonGrid({ count = 20 }: { count?: number }) {
  return (
    <div className="home-skeleton-section">
      <div className="home-skeleton-grid">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

// ── Trust Bar ─────────────────────────────────────────────────────────────────
const TRUST_ITEMS = [
  { Icon: FiTruck,      title: "Free Delivery",   sub: "On orders over ₦10,000"  },
  { Icon: FiShield,     title: "Secure Payment",  sub: "100% protected checkout" },
  { Icon: FiRefreshCw,  title: "Easy Returns",    sub: "7-day return policy"     },
  { Icon: FiHeadphones, title: "24/7 Support",    sub: "Always here to help"     },
];

function TrustBar() {
  return (
    <div className="home-trust-bar">
      {TRUST_ITEMS.map(({ Icon, title, sub }, i) => (
        <div key={i} className="home-trust-item">
          <div className="home-trust-icon">
            <Icon size={20} />
          </div>
          <div className="home-trust-text">
            <div className="home-trust-title">{title}</div>
            <div className="home-trust-sub">{sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Category Grid ─────────────────────────────────────────────────────────────

const PREFERRED_COLS = [7, 8, 6, 9, 5, 4];

function getOptimalCols(n: number): { cols: number; addViewAll: boolean } {
  // Exact fit — no filler needed
  for (const c of PREFERRED_COLS) if (n % c === 0) return { cols: c, addViewAll: false };
  // Adding one "View All" card creates a perfect grid
  for (const c of PREFERRED_COLS) if ((n + 1) % c === 0) return { cols: c, addViewAll: true };
  // Fallback: 7 columns, pad with View All regardless
  return { cols: 7, addViewAll: true };
}

function CategoryStrip({ categories }: { categories: any[] }) {
  const router = useRouter();

  const handleCatClick = (cat: any) => {
    const idRaw = cat?._id ?? cat?.id;
    if (!idRaw) return;
    const catId   = String(idRaw);
    const encoded = typeof window !== "undefined" ? window.btoa(catId) : catId;
    const name    = (cat?.name ?? "").replace(/\s*line\s*$/i, "");
    router.push(
      `/category/${catId}?id=${encoded}&type=${encodeURIComponent(name)}&categoryId=${encodeURIComponent(catId)}`
    );
  };

  const { cols, addViewAll } = getOptimalCols(categories.length);
  const items = addViewAll
    ? [...categories, { _id: "__view_all__", name: "View All", image: null, isViewAll: true }]
    : categories;

  return (
    <div className="home-categories-wrap">
      <div className="home-section-row">
        <span className="home-section-label">Shop by Category</span>
      </div>
      <div
        className="home-cat-grid"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {items.map((cat: any, i: number) =>
          cat.isViewAll ? (
            <div
              key="__view_all__"
              className="home-cat-card home-cat-card--view-all"
              onClick={() => router.push("/explore-all")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && router.push("/explore-all")}
            >
              <div className="home-cat-card-img-wrap home-cat-card-img-wrap--view-all">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <span className="home-cat-card-label">View All</span>
            </div>
          ) : (
            <div
              key={cat._id ?? cat.id ?? i}
              className="home-cat-card"
              onClick={() => handleCatClick(cat)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCatClick(cat)}
            >
              <div className="home-cat-card-img-wrap">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="home-cat-card-img"
                    loading="lazy"
                  />
                ) : (
                  <span className="home-cat-card-initial">
                    {(cat.name?.[0] ?? "?").toUpperCase()}
                  </span>
                )}
              </div>
              <span className="home-cat-card-label">
                {(cat.name ?? "").replace(/\s*line\s*$/i, "")}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ── Sort Bar ──────────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "random",     label: "✦ Discover"        },
  { value: "newest",     label: "New Arrivals"       },
  { value: "price_low",  label: "Price ↑"            },
  { value: "price_high", label: "Price ↓"            },
];

function SortBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="home-sort-bar">
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          className={`home-sort-btn${value === opt.value ? " active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const QUERY_OPTS = {
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  refetchInterval: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
} as const;

function Home() {
  const token      = useSelector(reduxAccessToken);
  const categories = useSelector(reduxCategoryItems) as any[];
  const [feedSort, setFeedSort] = useState("random");

  // ── Banners ───────────────────────────────────────────────────────────────
  const { data: banners = [] } = useQuery<unknown[]>({
    queryKey: ["home-banners"],
    queryFn: () => GET(API.GET_HOMESCREEN, {}).then(getArrayData),
    ...QUERY_OPTS,
  });

  // ── Recently visited (authenticated only) ─────────────────────────────────
  const { data: history = [] } = useQuery<Product[]>({
    queryKey: ["user-history", token ?? null],
    queryFn: async () => {
      if (!token) return [];
      try {
        const decoded = jwtDecode<{ exp?: number }>(token);
        if (
          typeof decoded?.exp === "number" &&
          decoded.exp * 1000 + 10_000 <= Date.now()
        )
          return [];
      } catch {
        return [];
      }
      return filterDisplayable(getArrayData(await GET(API.USER_HISTORY)));
    },
    enabled: Boolean(token),
    ...QUERY_OPTS,
  });

  // ── Marketplace feed — infinite scroll ────────────────────────────────────
  const {
    data: feedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: feedLoading,
  } = useInfiniteQuery({
    queryKey: ["marketplace-feed", feedSort],
    queryFn: async ({ pageParam }) => {
      const res = (await GET(API.MARKETPLACE_FEED_PRODUCTS, {
        page: pageParam,
        take: 20,
        perStoreLimit: 3,
        sort: feedSort,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })) as { status?: boolean; data?: unknown[]; meta?: Record<string, any> } | null;

      const items = filterDisplayable(Array.isArray(res?.data) ? res.data : []);
      const meta = res?.meta ?? {};
      const hasNext: boolean =
        meta?.hasNextPage ??
        (meta?.page != null && meta?.totalPages != null
          ? Number(meta.page) < Number(meta.totalPages)
          : false);

      return {
        items,
        nextPage: hasNext ? (pageParam as number) + 1 : undefined,
        totalCount: meta?.itemCount as number | undefined,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (last) => last.nextPage,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const feedItems = (() => {
    const all = feedData?.pages.flatMap((p) => p.items) ?? [];
    const seen = new Set<string>();
    return all.filter((item) => {
      const id = String(item._id ?? item.id ?? item.pid ?? "");
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  })();

  const totalCount = feedData?.pages[0]?.totalCount;

  // Auto-scroll silently until 100 products are visible,
  // then hand off to a "Load More" button so the footer stays reachable.
  const shouldAutoLoad = feedItems.length < 80;

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!shouldAutoLoad) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage)
          fetchNextPage();
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, shouldAutoLoad]);

  return (
    <div className="home-page">

      {/* ── Hero Banner ── */}
      {banners.length > 0 && (
        <div className="home-banner-wrap">
          <Banners data={banners} />
        </div>
      )}

      {/* ── Body: sidebar + main ── */}
      <div className="home-body">
        <CategorySidebar />

        <div className="home-main">

          {/* ── Category Grid ── */}
          {categories.length > 0 && (
            <div className="home-section-container mt-1">
              <CategoryStrip categories={categories} />
            </div>
          )}

          {/* ── Products Feed ── */}
          <div className="home-section-container mt-2 mb-5">
            <div className="home-feed-header">
              <div className="home-feed-title-group">
                <div className="home-feed-accent" />
                <div>
                  <h2 className="home-feed-title">What&apos;s Hot Right Now 🔥</h2>
                  <p className="home-feed-subtitle">Thousands of deals. One marketplace. Don&apos;t miss out.</p>
                </div>
              </div>
              <SortBar value={feedSort} onChange={setFeedSort} />
            </div>

            {feedLoading ? (
              <SkeletonGrid count={20} />
            ) : (
              <>
                <Row className="gy-3 gx-2 gx-md-3">
                  {feedItems.map((item, i) => (
                    <Col
                      xs={6}
                      sm={4}
                      md={3}
                      lg={3}
                      key={(item._id ?? item.id ?? item.pid ?? i) as string}
                    >
                      <ProductItem item={item} />
                    </Col>
                  ))}
                </Row>

                {/* Sentinel — only active during the first AUTO_LOAD_PAGES pages */}
                {shouldAutoLoad && <div ref={sentinelRef} style={{ height: 1 }} />}

                {isFetchingNextPage && <SkeletonGrid count={12} />}

                {/* After auto-load limit: show a button so the footer stays reachable */}
                {hasNextPage && !isFetchingNextPage && !shouldAutoLoad && (
                  <div className="home-load-more">
                    <div className="home-load-more-divider">
                      <span className="home-load-more-divider-line" />
                      <span className="home-load-more-divider-text">
                        {totalCount != null && feedItems.length < totalCount
                          ? `${(totalCount - feedItems.length).toLocaleString()} more products`
                          : "More products"}
                      </span>
                      <span className="home-load-more-divider-line" />
                    </div>
                    <button className="home-load-more-btn" onClick={() => fetchNextPage()}>
                      <span className="home-load-more-btn-icon">↓</span>
                      Load More Products
                    </button>
                  </div>
                )}

                {!hasNextPage && feedItems.length > 20 && (
                  <div className="home-feed-end">
                    <span>✓ You&apos;ve explored {feedItems.length.toLocaleString()} products</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Recently Visited ── */}
          {history.length > 0 && token && (
            <div className="home-section-container mb-4">
              <PopularItems data={history.slice(0, 7)} title="Recently Visited" type="visited" />
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default Home;
