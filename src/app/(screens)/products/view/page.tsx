"use client";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import SkelotonProductLoading from "../../../../components/skeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import ProductItem from "../../../../components/productItem/page";
import { Col, Row } from "react-bootstrap";
import { notification } from "antd";
import { useSelector } from "react-redux";
import { reduxLocation } from "../../../../redux/slice/locationSlice";
import { reduxSettings } from "../../../../redux/slice/settingsSlice";
import API from "../../../../config/API";
import { GET } from "../../../../util/apicall";
import _ from "lodash";
import useMediaQuery from "../../../../shared/hook/useMediaQuery";
import NoData from "../../../../components/noData";
import "./styles.scss";
const result: any = {
  recent: "Recently Launched Products",
  toprated: "Top Rated Products",
  visited: "Recently Visited Products",
  featured: "Featured Products",
  all: "All Products",
};

function Page() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [Notifications, contextHolder] = notification.useNotification();
  const Location = useSelector(reduxLocation);
  const Settings = useSelector(reduxSettings);
  const lattitude = Settings?.isLocation === true ? Location.latitude : "";
  const longitude = Settings?.isLocation === true ? Location.longitude : "";
  const [loading, setLoading] = useState(true);
  const mediaQuery = useMediaQuery(762);
  const [meta, setMeta] = useState<any>({});
  const [page, setPage] = useState(1);
  const [headerTitle, setHeaderTitle] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [fallbackPage, setFallbackPage] = useState(0);
  const [fallbackHasMore, setFallbackHasMore] = useState(true);
  const [hasFeaturedMore, setHasFeaturedMore] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const featuredPageSize = 20;
  const allProductsPageSize = 20;
  //==================
  const urls: any = {
    recent:
      API.PRODUCT_SEARCH_NEW_SINGLE +
      `?lattitude=${lattitude}&longitude=${longitude}&take=18&radius=${Settings?.radius}&tag=recent`,
    toprated:
      API.PRODUCT_SEARCH_NEW_SINGLE +
      `?lattitude=${lattitude}&longitude=${longitude}&take=18&radius=${Settings?.radius}&tag=top`,
    visited: API.USER_HISTORY + `?take=18`,
  };
  //=====================
  const typeParam = useMemo(
    () => searchParams.get("type") ?? "",
    [searchParams]
  );
  const positionParam = useMemo(
    () => searchParams.get("position") ?? "",
    [searchParams]
  );
  const isFeaturedView = typeParam === "featured";
  const isAllProductsView = typeParam === "all";

  const normalizeMeta = (
    metaData: any,
    options: {
      isFeatured: boolean;
      responseData: any;
      pageNumber: number;
      pageSize: number;
      itemCount: number;
    }
  ) => {
    const { isFeatured, responseData, pageNumber, pageSize, itemCount } =
      options;
    const normalized = {
      page: metaData?.page ?? pageNumber,
      take: metaData?.take ?? pageSize,
      itemCount: metaData?.itemCount ?? itemCount,
      totalPages: metaData?.totalPages,
      hasPreviousPage:
        typeof metaData?.hasPreviousPage === "boolean"
          ? metaData?.hasPreviousPage
          : (metaData?.page ?? pageNumber) > 1,
      hasNextPage: metaData?.hasNextPage,
    } as any;

    if (typeof normalized.hasNextPage !== "boolean") {
      if (isFeatured) {
        const total = Number(responseData?.total ?? 0);
        if (total > 0) {
          normalized.hasNextPage =
            normalized.page * (normalized.take || pageSize) < total;
        } else {
          normalized.hasNextPage = itemCount === (normalized.take || pageSize);
        }
      } else if (
        typeof normalized.totalPages === "number" &&
        normalized.totalPages > 0
      ) {
        normalized.hasNextPage = normalized.page < normalized.totalPages;
      } else if (
        typeof normalized.itemCount === "number" &&
        typeof normalized.take === "number"
      ) {
        normalized.hasNextPage = normalized.itemCount >= normalized.take;
      } else {
        normalized.hasNextPage = false;
      }
    }

    return normalized;
  };

  const getProducts = async (pageNumber: number, currentType: string) => {
    const isFeatured = currentType === "featured";
    const isAllProducts = currentType === "all";
    let url = "";

    if (isFeatured && pageNumber === 1) {
      setUsingFallback(false);
      setFallbackPage(0);
      setFallbackHasMore(true);
    }

    if (isFeatured) {
      if (!positionParam) {
        Notifications["error"]({
          message: "Missing featured position",
          description: "",
        });
        if (pageNumber === 1) {
          setLoading(false);
        }
        return;
      }
      url = `${API.FEATURED_POSITION_PRODUCTS}/${positionParam}/products?page=${pageNumber}&take=${featuredPageSize}`;
    } else if (isAllProducts) {
      const params = new URLSearchParams({
        page: String(pageNumber),
        take: String(allProductsPageSize),
        order: "DESC",
      });
      url = `${API.FEATURED_ALL_PRODUCTS}?${params.toString()}`;
    } else {
      const baseUrl = urls[currentType];
      if (!baseUrl) {
        if (pageNumber === 1) {
          setLoading(false);
          setHeaderTitle("Products");
        }
        return;
      }
      url = `${baseUrl}&page=${pageNumber}`;
    }

    if (pageNumber === 1) {
      setLoading(true);
    } else if (isFeatured || isAllProducts) {
      setLoadingMore(true);
    }

    try {
      const response: any = await GET(url);
      if (response?.status) {
        const fetchedProducts = isFeatured
          ? response?.data?.products ?? []
          : Array.isArray(response?.data)
          ? response?.data
          : Array.isArray(response?.data?.data)
          ? response?.data?.data
          : [];

        setProducts((prev) =>
          pageNumber === 1
            ? fetchedProducts
            : _.uniqBy([...prev, ...fetchedProducts], "_id")
        );

        const metaData = response.meta ?? {
          page: pageNumber,
          take: isFeatured ? featuredPageSize : fetchedProducts.length,
          itemCount: fetchedProducts.length,
          totalPages: 1,
          hasPreviousPage: pageNumber > 1,
          hasNextPage: false,
        };
        const normalizedMeta = normalizeMeta(metaData, {
          isFeatured,
          responseData: response?.data,
          pageNumber,
          pageSize: isFeatured
            ? featuredPageSize
            : isAllProducts
            ? allProductsPageSize
            : fetchedProducts.length || featuredPageSize,
          itemCount: fetchedProducts.length,
        });
        setMeta(normalizedMeta);
        if (isFeatured) {
          setHasFeaturedMore(Boolean(normalizedMeta?.hasNextPage));
        }

        setHeaderTitle(
          isFeatured
            ? response?.data?.planName
              ? `${response?.data?.planName} Products`
              : result.featured
            : result[currentType] ?? "Products"
        );

        if (isFeatured && pageNumber === 1 && fetchedProducts.length === 0) {
          await loadFallbackProducts(1, true);
        }
      } else {
        Notifications["error"]({
          message: response?.message,
          description: "",
        });
      }
    } catch (err) {
      Notifications["error"]({
        message: "Something went wrong.",
        description: "",
      });
    } finally {
      if ((isFeatured || isAllProducts) && pageNumber > 1) {
        setLoadingMore(false);
      }
      if (pageNumber === 1) {
        setLoading(false);
      }
    }
  };
  const changePage = async (nextPage: number) => {
    await getProducts(nextPage, typeParam);
    setPage(nextPage);
  };

  const loadFallbackProducts = async (
    nextPage: number,
    reset: boolean = false
  ) => {
    if (loadingMore) return;
    setHasFeaturedMore(false);
    setUsingFallback(true);
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const url =
        API.PRODUCT_SEARCH_NEW_SINGLE +
        `?take=${featuredPageSize}&tag=recent&page=${nextPage}`;
      const response: any = await GET(url);
      if (response?.status) {
        const fallbackData = response?.data ?? [];
        setProducts((prev) =>
          reset ? fallbackData : _.uniqBy([...prev, ...fallbackData], "_id")
        );
        setFallbackHasMore(response?.meta?.hasNextPage ?? false);
        setFallbackPage(nextPage);
        if (reset) {
          setMeta(
            response?.meta ?? {
              page: 1,
              take: featuredPageSize,
              hasNextPage: response?.meta?.hasNextPage ?? false,
            }
          );
        } else if (response?.meta) {
          setMeta(response.meta);
        }
      } else {
        Notifications["error"]({
          message: response?.message,
          description: "",
        });
      }
    } catch (err) {
      Notifications["error"]({
        message: "Something went wrong.",
        description: "",
      });
    } finally {
      if (reset) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  const handleShowMore = () => {
    if (isFeaturedView) {
      if (loadingMore) return;
      if (hasFeaturedMore) {
        changePage(page + 1);
        return;
      }
      if (fallbackHasMore) {
        setPage((prev) => prev + 1);
        loadFallbackProducts(fallbackPage + 1);
      }
      return;
    }
    if (isAllProductsView && loadingMore) {
      return;
    }
    changePage(page + 1);
  };
  useEffect(() => {
    setProducts([]);
    setMeta({});
    setHeaderTitle(undefined);
    setPage(1);
    setLoading(true);
    setFallbackPage(0);
    setFallbackHasMore(true);
    setUsingFallback(false);
    setHasFeaturedMore(true);
    getProducts(1, isFeaturedView ? "featured" : typeParam);
    // window.scrollTo(0, 0);
  }, [typeParam, positionParam, lattitude, longitude, isFeaturedView]);
  return (
    <div className="Screen-box products-page py-3">
      {contextHolder}
      <PageHeader
        title={headerTitle ?? result[typeParam] ?? "Products"}
        plain={true}
        page={page}
        // pageSize={pageSize}
        meta={meta}
        // initial={initial}
        type={Settings?.type}
        count={products?.length}
      ></PageHeader>
      {loading ? (
        <SkelotonProductLoading count={mediaQuery ? 6 : 18} />
      ) : products?.length ? (
        isFeaturedView ? (
          <>
            <Row className="gy-2 gy-md-3 mx-0 gx-2 gx-md-3 mt-md-3">
              {products?.map((item: any, index: number) => (
                <Col
                  lg="2"
                  sm="4"
                  className="ps-md-0 col-6 product-card-searchstore lg-25"
                  key={index}
                >
                  <ProductItem item={item} />
                </Col>
              ))}
            </Row>
            {loadingMore ? (
              <div className="text-center mt-3">
                <SkelotonProductLoading count={mediaQuery ? 2 : 6} />
              </div>
            ) : null}
            {(hasFeaturedMore || fallbackHasMore) && (
              <div className="d-flex justify-content-center mt-4 mb-3">
                <button
                  className="btn show-more-btn"
                  style={{
                    border: "2px solid #ff8c42",
                    color: "#ff8c42",
                    backgroundColor: "#ffffff",
                    padding: "12px 32px",
                    borderRadius: "50px",
                    fontSize: "16px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                  onClick={handleShowMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Show More"}
                </button>
              </div>
            )}
          </>
        ) : isAllProductsView ? (
          <>
            <Row className="gy-2 gy-md-3 mx-0 gx-2 gx-md-3 mt-md-3">
              {products?.map((item: any, index: number) => (
                <Col
                  lg="2"
                  sm="4"
                  className="ps-md-0 col-6 product-card-searchstore lg-25"
                  key={index}
                >
                  <ProductItem item={item} />
                </Col>
              ))}
            </Row>
            {(meta?.hasNextPage ?? false) && (
              <div className="d-flex justify-content-center mt-4 mb-3">
                <button
                  className="btn show-more-btn"
                  style={{
                    border: "2px solid #ff8c42",
                    color: "#ff8c42",
                    backgroundColor: "#ffffff",
                    padding: "12px 32px",
                    borderRadius: "50px",
                    fontSize: "16px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                  onClick={handleShowMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Show More"}
                </button>
              </div>
            )}
          </>
        ) : (
          <InfiniteScroll
            dataLength={products.length}
            next={() => {
              changePage(page + 1);
            }}
            hasMore={meta?.hasNextPage ?? false}
            loader={<SkelotonProductLoading count={mediaQuery ? 2 : 6} />}
            endMessage={
              <p className="fw-bold text-center mt-3">
                {meta?.hasNextPage ? "" : products?.length ? `` : ""}
              </p>
            }
          >
            <Row className="gy-2 gy-md-3 mx-0 gx-2 gx-md-3 mt-md-3">
              {products?.map((item: any, index: number) => (
                <Col
                  lg="2"
                  sm="4"
                  className="ps-md-0 col-6 product-card-searchstore lg-25"
                  key={index}
                >
                  <ProductItem item={item} />
                </Col>
              ))}
            </Row>
          </InfiniteScroll>
        )
      ) : (
        <NoData header={"No Products Found"} />
      )}
    </div>
  );
}

export default function P() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Page />
    </Suspense>
  );
}
