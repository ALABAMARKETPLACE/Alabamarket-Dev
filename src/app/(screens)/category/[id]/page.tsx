"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  usePathname,
} from "next/navigation";
import "./styles.scss";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import CategoryNav from "@/components/header/categoryNav";

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [Notifications, contextHolder] = notification.useNotification();
  const [meta, setMeta] = useState<any>({});
  const Settings = useSelector(reduxSettings);

  const [page, setPage] = useState(Number(searchParams?.get("page")) || 1);
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

  const categoryId = searchParams.get("id")
    ? getCategoryId(searchParams.get("id"))
    : "";
  const ogcategory = searchParams.get("ogCategory");
  const categoryIdParam = searchParams.get("categoryId");

  const updateSearchParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      router.replace(pathname + "?" + params.toString());
    },
    [searchParams, pathname, router]
  );

  const initialValues = [
    {
      status: searchParams.get("order") === "DESC",
      value: searchParams.get("order") || "ASC",
      title: "New",
    },
    {
      status:
        searchParams.get("price") === "DESC" &&
        searchParams.get("order") === "ASC",
      value: "ASC",
      title: "Price: High to Low",
    },
    {
      status:
        searchParams.get("price") === "ASC" &&
        searchParams.get("order") === "ASC",
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

    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("take", String(pageSize));
    params.set("price", price);
    params.set("order", order);

    // If categoryIdParam exists, use it to fetch all products for that category
    if (categoryIdParam) {
      params.set("category", categoryIdParam);
    } else if (!ogcategory && categoryId) {
      // Otherwise use subCategory if available
      params.set("subCategory", categoryId);
    }

    if (ogcategory && !categoryIdParam) {
      // Legacy support for ogCategory
      params.set("category", ogcategory);
    }

    const searchQuery = searchParams.get("query");
    if (searchQuery) {
      params.set("search", searchQuery);
    }

    if (!categoryId && !ogcategory && !categoryIdParam) {
      Notifications["warning"]({ message: "Please select a Category" });
      return;
    }

    try {
      setLoading(true);
      const response = await GET(
        `${API.PRODUCT_SEARCH_BOOSTED_CATEGORY}?${params.toString()}`
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
              title={searchParams.get("type")}
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
                  cname={searchParams.get("type")}
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
                text1={`No Products found for "${
                  searchParams.get("type") ?? ""
                }"`}
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
