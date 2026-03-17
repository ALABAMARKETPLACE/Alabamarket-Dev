"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Col, Container, Row } from "react-bootstrap";
import PageHeader from "./_components/pageHeader";
import { Space, Tag, notification, Button } from "antd";
import { useSelector } from "react-redux";
import PageSider from "./_components/pageSider";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import Loading from "@/components/loading";
import useDidUpdateEffect from "@/shared/hook/useDidUpdate";
import ProductItem from "@/components/productItem/page";
import NoData from "@/components/noData";
import MultiSearchProductList from "@/components/multiSearchCard/productSlider";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import "./styles.scss";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import CategoryNav from "@/components/header/categoryNav";
import { reduxCategoryItems } from "@/redux/slice/categorySlice";

const getCategoryId = (cid: any): string => {
  try {
    return window.atob(String(cid));
  } catch (err) {
    return "0";
  }
};

const ProductByCategory = () => {
  const pageSize = 100;
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  // Snapshot all URL params on first render — replaceState clears useSearchParams()
  // so we freeze the original values here before the useEffect fires.
  // On back/forward navigation the URL is bare "/category" (no params), so we
  // fall back to the values we saved in sessionStorage on the original visit.
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
      // Fresh navigation — persist to sessionStorage so back/forward can recover
      try {
        sessionStorage.setItem("category_snap", JSON.stringify(fromUrl));
      } catch (_) { /* ignore */ }
      snap.current = fromUrl;
    } else {
      // Back/forward navigation — URL params were erased by replaceState; restore
      try {
        const stored = sessionStorage.getItem("category_snap");
        snap.current = stored ? JSON.parse(stored) : fromUrl;
      } catch (_) {
        snap.current = fromUrl;
      }
    }
  }
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [Notifications, contextHolder] = notification.useNotification();
  const [meta, setMeta] = useState<any>({});
  const Settings = useSelector(reduxSettings);
  const categories = useSelector(reduxCategoryItems);

  const [page, setPage] = useState(Number(snap.current?.page) || 1);
  const [initial, setInitial] = useState(true);

  const groupedProducts = useMemo<any[]>(() => {
    if (Settings?.type !== "multi" || !Array.isArray(products)) {
      return [];
    }
    return products.filter(
      (item: any) =>
        Array.isArray(item?.productList) && item.productList.length > 0
    );
  }, [Settings?.type, products]);

  const shouldUseMultiLayout = groupedProducts.length > 0;

  const flatProducts = useMemo(() => {
    if (shouldUseMultiLayout || !Array.isArray(products)) {
      return [];
    }
    return products;
  }, [products, shouldUseMultiLayout]);

  const visibleProductCount = useMemo(() => {
    if (shouldUseMultiLayout) {
      return groupedProducts.reduce((total, group) => {
        if (!Array.isArray(group?.productList)) {
          return total;
        }
        return total + group.productList.length;
      }, 0);
    }
    return Array.isArray(products) ? products.length : 0;
  }, [shouldUseMultiLayout, groupedProducts, products]);

  const hasNextPage = useMemo(() => {
    if (typeof meta?.hasNextPage === "boolean") return meta.hasNextPage;
    if (meta?.pageCount) return page < meta.pageCount;
    if (meta?.totalPages) return page < meta.totalPages;
    if (meta?.itemCount) return page * pageSize < meta.itemCount;
    return false;
  }, [meta, page, pageSize]);

  const categoryId = snap.current?.id ? getCategoryId(snap.current.id) : "";
  const ogcategory = snap.current?.ogCategory ?? null;
  const categoryIdParam = snap.current?.categoryId ?? null;

  const getItemId = (item: any) => {
    const raw = item?.id ?? item?._id ?? item?.pid ?? item?.slug;
    if (raw === undefined || raw === null) return null;
    return String(raw);
  };

  const dedupeList = (items: any[]) => {
    if (!Array.isArray(items) || items.length === 0) return [];
    const seen = new Set<string>();
    const result: any[] = [];
    for (const item of items) {
      const id = getItemId(item);
      if (!id) {
        result.push(item);
        continue;
      }
      if (seen.has(id)) continue;
      seen.add(id);
      result.push(item);
    }
    return result;
  };

  const getSubCategoryIdsForCategory = (catId: string) => {
    if (!catId || !Array.isArray(categories)) return [];
    const match = categories.find((cat: any) => {
      const id = cat?.id ?? cat?._id;
      return id != null && String(id) === String(catId);
    });
    const subs = Array.isArray(match?.sub_categories) ? match.sub_categories : [];
    return subs
      .map((sub: any) => sub?.id ?? sub?._id)
      .filter((id: any) => id != null)
      .map((id: any) => String(id));
  };

  const updateSearchParams = useCallback(
    (_updates: Record<string, string>) => {
      // URL is intentionally hidden — keep address bar clean
      window.history.replaceState(null, "", "/category");
    },
    []
  );

  const initialValues = [
    {
      status: snap.current?.order === "DESC",
      value: snap.current?.order || "ASC",
      title: "New",
    },
    {
      status:
        snap.current?.price === "DESC" && snap.current?.order === "ASC",
      value: "ASC",
      title: "Price: High to Low",
    },
    {
      status:
        snap.current?.price === "ASC" && snap.current?.order === "ASC",
      value: "ASC",
      title: "Price: Low to High",
    },
  ];

  const [selectedTags, setSelectedTags] = useState(initialValues);

  const getProductsBySubCategory = async (currentPage: number) => {
    const price = selectedTags[1].status
      ? "DESC"
      : selectedTags[2].status
      ? "ASC"
      : "RAND";
    const order = selectedTags[0].value;

    const baseParams = new URLSearchParams();
    baseParams.set("page", String(currentPage));
    baseParams.set("take", String(pageSize));
    baseParams.set("price", price);
    baseParams.set("order", order);

    // If categoryIdParam exists, use it to fetch all products for that category
    if (categoryIdParam) {
      const subCategoryIds = getSubCategoryIdsForCategory(categoryIdParam);
      if (subCategoryIds.length > 0) {
        const searchQuery = snap.current?.query;
        if (searchQuery) {
          baseParams.set("search", searchQuery);
        }

        try {
          setLoading(true);
          const results = await Promise.allSettled(
            subCategoryIds.map((subId: string) =>
              GET(
                `${API.PRODUCT_SEARCH_BOOSTED_CATEGORY}?${(() => {
                  const p = new URLSearchParams(baseParams.toString());
                  p.set("subCategory", subId);
                  return p.toString();
                })()}`,
              ),
            ),
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

          const mergedMeta = {
            hasNextPage: metas.some((m) => m?.hasNextPage === true),
            page: currentPage,
          };

          setProducts(dedupeList(collected));
          setMeta(mergedMeta);
        } catch (err: any) {
          Notifications["error"]({
            message: "Something went wrong",
            description: err.message,
          });
          setProducts([]);
          setMeta({});
        } finally {
          setLoading(false);
          setInitial(false);
        }
        return;
      }

      baseParams.set("category", categoryIdParam);
    } else if (!ogcategory && categoryId) {
      // Otherwise use subCategory if available
      baseParams.set("subCategory", categoryId);
    }

    if (ogcategory && !categoryIdParam) {
      // Legacy support for ogCategory
      baseParams.set("category", ogcategory);
    }

    const searchQuery = snap.current?.query;
    if (searchQuery) {
      baseParams.set("search", searchQuery);
    }

    if (!categoryId && !ogcategory && !categoryIdParam) {
      Notifications["warning"]({ message: "Please select a Category" });
      return;
    }

    try {
      setLoading(true);
      const response = await GET(
        `${API.PRODUCT_SEARCH_BOOSTED_CATEGORY}?${baseParams.toString()}`
      );
      if (response?.status) {
        setProducts(response.data ?? []);
        setMeta(response.meta ?? {});
      } else {
        setProducts([]);
        setMeta({});
      }
    } catch (err: any) {
      Notifications["error"]({
        message: "Something went wrong",
        description: err.message,
      });
      setProducts([]);
    } finally {
      setLoading(false);
      setInitial(false);
    }
  };

  const handleChange = (index: number) => {
    const newTags = [...selectedTags];
    const activeIndex = newTags.findIndex((item) => item.status);

    if (activeIndex !== -1 && activeIndex !== index) {
      newTags[activeIndex].status = false;
      newTags[activeIndex].value = "ASC";
    }

    newTags[index].status = !newTags[index].status;
    newTags[index].value = newTags[index].status ? "DESC" : "ASC";

    setSelectedTags(newTags);
    updateSearchParams({
      order: newTags[0].value,
      price: newTags[1].status ? "DESC" : newTags[2].status ? "ASC" : "RAND",
      page: "1",
    });
  };

  const handlePageChange = async (newPage: number) => {
    await getProductsBySubCategory(newPage);
    setPage(newPage);
    updateSearchParams({ page: String(newPage) });
    window.scrollTo(0, 0);
  };

  useDidUpdateEffect(() => {
    getProductsBySubCategory(page);
    window.scrollTo(0, 0);
  }, [selectedTags]);

  // Hide /[id]?id=...&type=...&categoryId=... — address bar shows /category
  useEffect(() => {
    window.history.replaceState(null, "", "/category");
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    getProductsBySubCategory(1);
    setPage(1);
  }, [categoryId, categoryIdParam, params.id]);

  return (
    <div className="Screen-box">
      {contextHolder}
      <div className="category-nav-section" style={{ padding: "10px 0" }}>
        <CategoryNav />
      </div>
      <Container fluid>
        <Row>
          <Col lg={12} style={{ margin: 0 }}>
            <PageHeader
              title={snap.current?.type}
              page={page}
              pageSize={pageSize}
              meta={meta}
              initial={initial}
              type={Settings?.type}
              count={visibleProductCount}
            >
              <Space wrap>
                {selectedTags.map((tag, i) => (
                  <Tag
                    key={i}
                    color={tag.status ? API.COLOR : ""}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleChange(i)}
                  >
                    {tag.title}
                  </Tag>
                ))}
              </Space>
            </PageHeader>
            {loading ? (
              <Loading />
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
              <Row className="gy-3 py-3">
                {flatProducts.map((item: any, i: number) => (
                  <Col xs={6} key={item?.id ?? item?._id ?? i} md="4" lg="3">
                    <ProductItem item={item} />
                  </Col>
                ))}
              </Row>
            ) : (
              <NoData
                header="No Products"
                text1={`No Products found for "${snap.current?.type ?? ""}"`}
              />
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 20,
                gap: "10px",
              }}
            >
              <Button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || loading}
              >
                Previous
              </Button>
              <Button
                onClick={() => handlePageChange(page + 1)}
                disabled={!hasNextPage || loading}
              >
                Next
              </Button>
            </div>
            <br />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProductByCategory;
