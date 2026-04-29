"use client";
import API from "@/config/API";
import "./style.scss";
import useDidUpdateEffect from "@/shared/hook/useDidUpdate";
import { GET } from "@/util/apicall";
import { getRatingInfo } from "@/util/ratingUtils";
import { Avatar, Card, Rate, Skeleton } from "antd";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";

// ── Store banner SVG ──────────────────────────────────────────────────────────
function StoreBannerSVG({ name, hue }: { name: string; hue: number }) {
  const safe = name
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const h2 = (hue + 38) % 360;
  const h3 = (hue + 72) % 360;
  const id = `sb${hue}`;

  // Scale font so long names still fit
  const fs = name.length > 38 ? 19 : name.length > 28 ? 25 : name.length > 18 ? 31 : 37;
  const nameY = 72 + fs * 1.25;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 180"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        <linearGradient id={`bg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={`hsl(${hue},72%,36%)`} />
          <stop offset="55%"  stopColor={`hsl(${h2},68%,48%)`} />
          <stop offset="100%" stopColor={`hsl(${h3},76%,60%)`} />
        </linearGradient>
        <pattern id={`d-${id}`} x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="14" cy="14" r="1.3" fill="rgba(255,255,255,0.14)" />
        </pattern>
      </defs>

      {/* Background */}
      <rect width="1200" height="180" fill={`url(#bg-${id})`} />
      <rect width="1200" height="180" fill={`url(#d-${id})`} />

      {/* Decorative circles */}
      <circle cx="1190" cy="-30"  r="210" fill="rgba(255,255,255,0.07)" />
      <circle cx="1080" cy="210"  r="140" fill="rgba(255,255,255,0.05)" />
      <circle cx="-50"  cy="210"  r="150" fill="rgba(0,0,0,0.1)" />
      <circle cx="600"  cy="-60"  r="100" fill="rgba(255,255,255,0.04)" />

      {/* Ghost initials watermark */}
      <text
        x="1080" y="185"
        fontSize="230" fontWeight="900"
        fill="rgba(255,255,255,0.07)"
        fontFamily="Arial Black, Arial, sans-serif"
        textAnchor="middle" letterSpacing="-6"
      >{initials}</text>

      {/* Vertical accent bar — starts at x=160 to clear the avatar overlap area */}
      <rect x="160" y="68" width="4" height={fs * 1.9} rx="2" fill="rgba(255,255,255,0.75)" />

      {/* Store name */}
      <text
        x="176" y={nameY}
        fontSize={fs} fontWeight="800"
        fill="white"
        fontFamily="Arial, Helvetica, sans-serif"
        letterSpacing="0.4"
      >{safe}</text>

      {/* "OFFICIAL STORE" label */}
      <text
        x="178" y={nameY + 22}
        fontSize="11.5"
        fill="rgba(255,255,255,0.62)"
        fontFamily="Arial, sans-serif"
        letterSpacing="3"
      >OFFICIAL STORE</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function StoreLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loadingStore, setLoadingStore] = useState(true);
  const [store, setStore] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]);

  const selectedCid = searchParams.get("cid") || "";
  const sort = searchParams.get("sort") || "newest";
  const storeNameParam = searchParams.get("storeName") || "";

  const slug = params?.slug as string;

  const SORT_VALUES = ["newest", "price_high", "price_low"] as const;
  const SORT_LABELS = ["New", "Price: High to Low", "Price: Low to High"];

  const initialTags = SORT_VALUES.map((val, i) => ({
    title: SORT_LABELS[i],
    active: sort === val,
  }));
  const [selectedTags, setSelectedTags] = useState(initialTags);

  const getStoreDetails = async () => {
    // store_search/info only accepts text slugs; derive one from storeName when slug is numeric
    const textSlug = /^\d+$/.test(slug)
      ? storeNameParam.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      : slug;
    try {
      const response: any = await GET(`${API.STORE_SEARCH_GETINFO}${textSlug}`);
      if (response?.status) {
        setStore(response.data?.store ?? { store_name: storeNameParam });
        const cats = (response.data?.category ?? []).map((cat: any) => ({
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
        }));
        setCategories(cats);
        return;
      }
    } catch {
      // fall back silently
    } finally {
      setLoadingStore(false);
    }
    if (storeNameParam) {
      setStore({ store_name: storeNameParam });
    }
  };

  useEffect(() => {
    getStoreDetails();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep tag active states in sync when URL changes externally
  useDidUpdateEffect(() => {
    setSelectedTags(SORT_VALUES.map((val, i) => ({ title: SORT_LABELS[i], active: sort === val })));
  }, [sort]);

  // Navigate to the same page keeping existing params, toggling the clicked filter
  const handleFilterChange = (index: number) => {
    const next = selectedTags.map((t, i) => ({
      ...t,
      active: i === index ? !t.active : false,
    }));
    setSelectedTags(next);

    const activeIndex = next.findIndex((t) => t.active);
    const newSort = activeIndex >= 0 ? SORT_VALUES[activeIndex] : "newest";

    const qs = new URLSearchParams(searchParams.toString());
    qs.set("sort", newSort);
    qs.delete("order");
    qs.delete("price");
    router.push(`/product_search/store/${slug}?${qs.toString()}`);
  };

  // Select a category: stay on the same page, just update ?cid=
  const handleCategoryClick = (categoryId: string) => {
    const qs = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      qs.set("cid", categoryId);
    } else {
      qs.delete("cid");
    }
    router.push(`/product_search/store/${slug}?${qs.toString()}`);
  };

  // ── Derived visuals ────────────────────────────────────────────────────────
  const storeName: string = store?.store_name ?? storeNameParam ?? "";

  // Initials: up to 2 words → first letter of each
  const initials = storeName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? "")
    .join("");

  // Deterministic hue from store name so every store has a unique palette
  const hue = storeName
    .split("")
    .reduce((acc: number, ch: string) => acc + ch.charCodeAt(0), 0) % 360;

  const avatarBg = `hsl(${hue},60%,44%)`;

  // logo_upload is always set (default → "profileicon.png"), so treat known
  // placeholder URLs as absent and fall through to the initials avatar
  const PLACEHOLDER_PATTERNS = ["profileicon", "default_avatar", "placeholder"];
  const hasRealLogo =
    !!store?.logo_upload &&
    !PLACEHOLDER_PATTERNS.some((p) => store.logo_upload.includes(p));

  const apiRating = isNaN(Number(store?.averageRating)) ? 0 : Number(store?.averageRating);
  const apiCount  = Number(store?.ratings) || 0;

  // Fall back to a deterministic generated rating when the store has no real reviews yet
  const generated = getRatingInfo(String(store?.id ?? store?._id ?? slug));
  const ratingValue = apiRating > 0 ? apiRating   : generated.rating;
  const ratingCount = apiCount  > 0 ? apiCount    : generated.reviews;

  return (
    <div className="Screen-box py-2">
      <button className="store-back-btn" onClick={() => router.back()}>
        <IoArrowBack size={16} /> Back
      </button>

      <Card className="store-header-card">
        {loadingStore ? (
          <div style={{ padding: "16px 20px" }}>
            <Skeleton avatar={{ size: 64 }} paragraph={{ rows: 2 }} active />
          </div>
        ) : (
          <>
            {/* Banner */}
            <div className="store-banner">
              {store?.cover_image
                ? <img className="store-banner-img" src={store.cover_image} alt="" />
                : <StoreBannerSVG name={storeName || "Store"} hue={hue} />
              }
            </div>

            {/* Store info row */}
            <div className="store-info-row">
              <div className="store-avatar-wrap">
                {hasRealLogo ? (
                  <Avatar src={store.logo_upload} size={66} />
                ) : (
                  <Avatar
                    size={66}
                    style={{
                      background: avatarBg,
                      color: "#fff",
                      fontSize: initials.length > 1 ? 22 : 28,
                      fontWeight: 700,
                      letterSpacing: 1,
                      border: "none",
                    }}
                  >
                    {initials || "?"}
                  </Avatar>
                )}
              </div>
              <div className="store-meta">
                <p className="store-name">{storeName}</p>
                <div className="store-rating">
                  <Rate
                    disabled
                    allowHalf
                    value={ratingValue}
                    style={{ fontSize: 13, color: "#f5a623" }}
                  />
                  <span className="store-rating-score">
                    {ratingValue > 0 ? ratingValue.toFixed(1) : "No ratings yet"}
                  </span>
                  {ratingCount > 0 && (
                    <span className="store-rating-count">
                      ({ratingCount} {ratingCount === 1 ? "review" : "reviews"})
                    </span>
                  )}
                </div>
                <p className="store-tagline">
                  {Array.isArray(store?.business_types) && store.business_types.length
                    ? store.business_types.join(" · ")
                    : "Official Store"}
                </p>
              </div>
            </div>

            <hr className="store-divider" />

            {/* Toolbar: categories + filters */}
            <div className="store-toolbar">
              <div className="store-categories">
                <div
                  className={`store-cat-chip${!selectedCid ? " active" : ""}`}
                  onClick={() => handleCategoryClick("")}
                >
                  All
                </div>
                {categories.map((item: any, index: number) => (
                  <div
                    key={index}
                    className={`store-cat-chip${String(item._id) === selectedCid ? " active" : ""}`}
                    onClick={() => handleCategoryClick(String(item._id))}
                  >
                    {item?.name}
                  </div>
                ))}
              </div>

              <div className="store-filters">
                <span className="filter-label">Sort:</span>
                {selectedTags.map((tag, i) => (
                  <div
                    key={i}
                    className={`store-filter-chip${tag.active ? " active" : ""}`}
                    onClick={() => handleFilterChange(i)}
                  >
                    {tag.title}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </Card>

      <main>{children}</main>
    </div>
  );
}

export default StoreLayout;
