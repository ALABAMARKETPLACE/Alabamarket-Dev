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

function StoreLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loadingStore, setLoadingStore] = useState(true);
  const [store, setStore] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]);

  const selectedCid = searchParams.get("cid") || "";
  const price = searchParams.get("price") || "RAND";
  const order = searchParams.get("order") || "ASC";
  const storeNameParam = searchParams.get("storeName") || "";

  const slug = params?.slug as string;

  const initialTags = [
    {
      title: "New",
      // "New" means order=DESC
      active: searchParams.get("order") === "DESC",
    },
    {
      title: "Price: High to Low",
      // price=DESC, order=ASC
      active:
        searchParams.get("price") === "DESC" &&
        searchParams.get("order") !== "DESC",
    },
    {
      title: "Price: Low to High",
      // price=ASC, order=ASC
      active:
        searchParams.get("price") === "ASC" &&
        searchParams.get("order") !== "DESC",
    },
  ];
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
    setSelectedTags([
      { title: "New", active: order === "DESC" },
      {
        title: "Price: High to Low",
        active: price === "DESC" && order !== "DESC",
      },
      {
        title: "Price: Low to High",
        active: price === "ASC" && order !== "DESC",
      },
    ]);
  }, [price, order]);

  // Navigate to the same page keeping existing params, toggling the clicked filter
  const handleFilterChange = (index: number) => {
    const next = selectedTags.map((t, i) => ({
      ...t,
      active: i === index ? !t.active : false,
    }));
    setSelectedTags(next);

    const newOrder = next[0].active ? "DESC" : "ASC";
    const newPrice = next[1].active ? "DESC" : next[2].active ? "ASC" : "RAND";

    const qs = new URLSearchParams(searchParams.toString());
    qs.set("order", newOrder);
    qs.set("price", newPrice);
    // preserve cid if one is selected
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
              {store?.cover_image && (
                <img className="store-banner-img" src={store.cover_image} alt="" />
              )}
            </div>

            {/* Store info row */}
            <div className="store-info-row">
              <div className="store-avatar-wrap">
                <Avatar src={store?.logo_upload} size={66} />
              </div>
              <div className="store-meta">
                <p className="store-name">{store?.store_name ?? storeNameParam}</p>
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
