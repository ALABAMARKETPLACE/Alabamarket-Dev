"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Col, Row } from "react-bootstrap";
import { notification } from "antd";
import { useSelector } from "react-redux";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import useDidUpdateEffect from "@/shared/hook/useDidUpdate";
import ProductItem from "@/components/productItem/page";
import NoData from "@/components/noData";
import MultiSearchProductList from "@/components/multiSearchCard/productSlider";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import "./styles.scss";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { reduxCategoryItems } from "@/redux/slice/categorySlice";
import { IoChevronForward, IoHomeOutline } from "react-icons/io5";

const getCategoryId = (cid: any): string => {
  try {
    return window.atob(String(cid));
  } catch {
    return "0";
  }
};

// ── Sort bar ──────────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { label: "New Arrivals", orderVal: "DESC", priceVal: null },
  { label: "Price: High → Low", orderVal: "ASC",  priceVal: "DESC" },
  { label: "Price: Low → High", orderVal: "ASC",  priceVal: "ASC"  },
];

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="cat-skeleton-card">
      <div className="cat-skeleton-img" />
      <div className="cat-skeleton-body">
        <span className="cat-skeleton-line w80" />
        <span className="cat-skeleton-line w55" />
        <span className="cat-skeleton-line w40" />
      </div>
    </div>
  );
}

const ProductByCategory = () => {
  const pageSize = 100;
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const snap = useRef<Record<string, string | null> | null>(null);
  if (!snap.current) {
    const fromUrl = {
      id: searchParams.get("id"),
      ogCategory: searchParams.get("ogCategory"),
      categoryId: searchParams.get("categoryId"),
      type: searchParams.get("type"),
      order: searchParams.get("order"),
      price: searchParams.get("price"),
      page: searchParams.get("page"),
      query: searchParams.get("query"),
    };
    if (fromUrl.type) {
      try { sessionStorage.setItem("category_snap", JSON.stringify(fromUrl)); } catch { /* */ }
      snap.current = fromUrl;
    } else {
      try {
        const stored = sessionStorage.getItem("category_snap");
        snap.current = stored ? JSON.parse(stored) : fromUrl;
      } catch { snap.current = fromUrl; }
    }
  }

  const [products, setProducts]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);
  const [initial, setInitial]     = useState(true);
  const [meta, setMeta]           = useState<any>({});
  const [sortIdx, setSortIdx]     = useState(0);
  const [page, setPage]           = useState(Number(snap.current?.page) || 1);

  const [Notifications, contextHolder] = notification.useNotification();
  const Settings   = useSelector(reduxSettings);
  const categories = useSelector(reduxCategoryItems);

  const groupedProducts = useMemo<any[]>(() => {
    if (Settings?.type !== "multi" || !Array.isArray(products)) return [];
    return products.filter((item: any) => Array.isArray(item?.productList) && item.productList.length > 0);
  }, [Settings?.type, products]);

  const shouldUseMultiLayout = groupedProducts.length > 0;

  const flatProducts = useMemo(() => {
    if (shouldUseMultiLayout || !Array.isArray(products)) return [];
    return products;
  }, [products, shouldUseMultiLayout]);

  const visibleProductCount = useMemo(() => {
    if (shouldUseMultiLayout)
      return groupedProducts.reduce((t, g) => t + (Array.isArray(g?.productList) ? g.productList.length : 0), 0);
    return Array.isArray(products) ? products.length : 0;
  }, [shouldUseMultiLayout, groupedProducts, products]);

  const hasNextPage = useMemo(() => {
    if (typeof meta?.hasNextPage === "boolean") return meta.hasNextPage;
    if (meta?.pageCount)  return page < meta.pageCount;
    if (meta?.totalPages) return page < meta.totalPages;
    if (meta?.itemCount)  return page * pageSize < meta.itemCount;
    return false;
  }, [meta, page, pageSize]);

  const categoryId      = snap.current?.id ? getCategoryId(snap.current.id) : "";
  const ogcategory      = snap.current?.ogCategory ?? null;
  const categoryIdParam = snap.current?.categoryId ?? null;
  const categoryName    = (snap.current?.type ?? "").replace(/\s*line\s*$/i, "");

  const dedupeList = (items: any[]) => {
    if (!Array.isArray(items) || !items.length) return [];
    const seen = new Set<string>();
    return items.filter((item) => {
      const id = String(item?.id ?? item?._id ?? item?.pid ?? item?.slug ?? "");
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  };

  const getSubCategoryIdsForCategory = (catId: string) => {
    if (!catId || !Array.isArray(categories)) return [];
    const match = categories.find((cat: any) => String(cat?.id ?? cat?._id) === String(catId));
    return (Array.isArray(match?.sub_categories) ? match.sub_categories : [])
      .map((sub: any) => sub?.id ?? sub?._id)
      .filter(Boolean)
      .map(String);
  };

  const updateSearchParams = useCallback(() => {
    window.history.replaceState(null, "", "/category");
  }, []);

  const fetchProducts = async (currentPage: number, idx: number) => {
    const opt = SORT_OPTIONS[idx];
    const price = opt.priceVal ?? "RAND";
    const order = opt.orderVal;

    const baseParams = new URLSearchParams();
    baseParams.set("page",  String(currentPage));
    baseParams.set("take",  String(pageSize));
    baseParams.set("price", price);
    baseParams.set("order", order);

    if (categoryIdParam) {
      const subIds = getSubCategoryIdsForCategory(categoryIdParam);
      if (subIds.length > 0) {
        if (snap.current?.query) baseParams.set("search", snap.current.query);
        try {
          setLoading(true);
          const results = await Promise.allSettled(
            subIds.map((subId: string) =>
              GET(`${API.PRODUCT_SEARCH_BOOSTED_CATEGORY}?${(() => {
                const p = new URLSearchParams(baseParams.toString());
                p.set("subCategory", subId);
                return p.toString();
              })()}`)
            )
          );
          const collected: any[] = [];
          const metas: any[] = [];
          for (const res of results) {
            if (res.status !== "fulfilled") continue;
            const payload: any = res.value;
            if (!payload?.status) continue;
            if (Array.isArray(payload?.data)) collected.push(...payload.data);
            if (payload?.meta) metas.push(payload.meta);
          }
          setProducts(dedupeList(collected));
          setMeta({ hasNextPage: metas.some(m => m?.hasNextPage), page: currentPage, itemCount: metas.reduce((s, m) => s + (Number(m?.itemCount) || 0), 0) });
        } catch (err: any) {
          Notifications.error({ message: "Unable to load products.", description: err.message });
          setProducts([]); setMeta({});
        } finally { setLoading(false); setInitial(false); }
        return;
      }
      baseParams.set("category", categoryIdParam);
    } else if (!ogcategory && categoryId) {
      baseParams.set("subCategory", categoryId);
    }
    if (ogcategory && !categoryIdParam) baseParams.set("category", ogcategory);
    if (snap.current?.query) baseParams.set("search", snap.current.query);
    if (!categoryId && !ogcategory && !categoryIdParam) { Notifications.warning({ message: "Please select a Category" }); return; }

    try {
      setLoading(true);
      const response = await GET(`${API.PRODUCT_SEARCH_BOOSTED_CATEGORY}?${baseParams.toString()}`);
      if (response?.status) { setProducts(response.data ?? []); setMeta(response.meta ?? {}); }
      else { setProducts([]); setMeta({}); }
    } catch (err: any) {
      Notifications.error({ message: "Unable to load products.", description: err.message });
      setProducts([]);
    } finally { setLoading(false); setInitial(false); }
  };

  const handleSortChange = (idx: number) => {
    setSortIdx(idx);
    setPage(1);
    updateSearchParams();
  };

  const handlePageChange = async (newPage: number) => {
    setPage(newPage);
    updateSearchParams();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useDidUpdateEffect(() => { fetchProducts(page, sortIdx); }, [sortIdx]);
  useDidUpdateEffect(() => { fetchProducts(page, sortIdx); }, [page]);

  useEffect(() => { window.history.replaceState(null, "", "/category"); }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProducts(1, sortIdx);
    setPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, categoryIdParam, params.id]);

  const totalItems  = meta?.itemCount ?? 0;
  const totalPages  = meta?.pageCount ?? meta?.totalPages ?? (totalItems ? Math.ceil(totalItems / pageSize) : 0);
  const displayedCount = initial ? null : visibleProductCount;

  return (
    <div className="cat-page">
      {contextHolder}

      {/* ── Page header ── */}
      <div className="cat-page-header">
        <div className="cat-page-header-inner">
          {/* Breadcrumb */}
          <div className="cat-breadcrumb">
            <span className="cat-breadcrumb-item" onClick={() => router.push("/")}>
              <IoHomeOutline size={13} /> Home
            </span>
            <IoChevronForward size={11} className="cat-breadcrumb-sep" />
            <span className="cat-breadcrumb-item cat-breadcrumb-active">{categoryName || "Category"}</span>
          </div>

          {/* Title row */}
          <div className="cat-title-row">
            <div>
              <h1 className="cat-page-title">{categoryName || "Category"}</h1>
            </div>

            {/* Sort bar */}
            <div className="cat-sort-bar">
              <span className="cat-sort-label">Sort:</span>
              {SORT_OPTIONS.map((opt, i) => (
                <button
                  key={i}
                  className={`cat-sort-btn${sortIdx === i ? " active" : ""}`}
                  onClick={() => handleSortChange(i)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="cat-page-body">
        {loading ? (
          <Row className="gy-3 gx-2 gx-md-3">
            {Array.from({ length: 20 }).map((_, i) => (
              <Col xs={6} sm={4} md={3} lg={3} key={i}><SkeletonCard /></Col>
            ))}
          </Row>
        ) : shouldUseMultiLayout ? (
          groupedProducts.map((item: any, index: number) => (
            <MultiSearchProductList
              key={item?.id ?? item?._id ?? index}
              data={item}
              type="category"
              cid={categoryId}
              cname={snap.current?.type}
              count={3}
              ogcategory={ogcategory}
            />
          ))
        ) : flatProducts.length ? (
          <Row className="gy-3 gx-2 gx-md-3">
            {flatProducts.map((item: any, i: number) => (
              <Col xs={6} sm={4} md={3} lg={3} key={item?.id ?? item?._id ?? i}>
                <ProductItem item={item} />
              </Col>
            ))}
          </Row>
        ) : (
          <div className="cat-empty">
            <NoData
              header="No Products"
              text1={`No products found for "${categoryName}"`}
            />
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && (flatProducts.length > 0 || shouldUseMultiLayout) && (
          <div className="cat-pagination">
            <button
              className="cat-page-btn"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              ← Previous
            </button>
            <span className="cat-page-info">
              Page {page}{totalPages > 0 ? ` of ${totalPages}` : ""}
            </span>
            <button
              className="cat-page-btn"
              onClick={() => handlePageChange(page + 1)}
              disabled={!hasNextPage}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductByCategory;
