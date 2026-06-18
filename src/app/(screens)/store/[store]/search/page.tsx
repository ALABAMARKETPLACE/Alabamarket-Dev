"use client";
import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import uniqBy from "lodash/uniqBy";
import orderBy from "lodash/orderBy";
import ProductItem from "@/components/productItem/page";
import NoData from "@/components/noData";
import API from "@/config/API";
import { GET } from "@/util/apicall";
import { useParams, useSearchParams } from "next/navigation";
import useDidUpdateEffect from "@/shared/hook/useDidUpdate";
import "./styles.scss";

const SKELETON_COUNT = 12;

function SkeletonGrid() {
  return (
    <div className="store-search-skeleton-grid">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <div key={i} className="store-search-skeleton-card">
          <div className="store-search-skeleton-img" />
          <div className="store-search-skeleton-line" />
          <div className="store-search-skeleton-line store-search-skeleton-line--short" />
        </div>
      ))}
    </div>
  );
}

function StoreSearchPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const search = searchParams.get("qs") || "";
  const params = useParams();
  const storeId = params?.store;
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({});
  const pageSize = 18;
  const price = searchParams.get("price") || "RAND";
  const order = searchParams.get("order") || "ASC";

  const getProducts = async (current: number) => {
    const url =
      API.PRODUCT_SEARCH_ITEM +
      storeId +
      `?query=${search}&order=DESC&price=ASC&page=${current}&take=${pageSize}`;
    if (storeId && search) {
      try {
        const response: any = await GET(url);
        if (response?.status === true) {
          setProducts((prod) =>uniqBy([...prod, ...response?.data], "_id"));
          setMeta(response?.meta);
        } else {
          setProducts([]);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
  };

  const changePage = async (pg: number) => {
    await getProducts(pg);
    setPage(pg);
  };

  useEffect(() => {
    getProducts(1);
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sortProductsByRetailRate(data: any[], price: string, order: string) {
    if (order === "DESC") {
      return orderBy(data, [(p) => Number(p._id)], ["desc"]);
    } else if (price === "ASC" || price === "DESC") {
      return orderBy(data, ["retail_rate"], [price === "ASC" ? "asc" : "desc"]);
    }
    return data;
  }

  useDidUpdateEffect(() => {
    const sorted = sortProductsByRetailRate(products, price, order);
    setProducts([...sorted]);
  }, [price, order, page]);

  if (loading) return <SkeletonGrid />;

  if (!products.length) return <NoData text1="No Products available" />;

  return (
    <div className="store-search-page">
      {/* Results header */}
      <div className="store-search-header">
        <span className="store-search-title">
          Results for &ldquo;<span style={{ color: "var(--primary, #FF5F15)" }}>{search}</span>&rdquo;
        </span>
        {meta?.itemCount ? (
          <span className="store-search-count">{meta.itemCount} product{meta.itemCount !== 1 ? "s" : ""} found</span>
        ) : null}
      </div>

      <InfiniteScroll
        dataLength={products.length}
        next={() => changePage(page + 1)}
        hasMore={meta?.hasNextPage ?? false}
        loader={<SkeletonGrid />}
        endMessage={
          products.length > pageSize ? (
            <p className="store-search-end-msg">
              Showing all {meta?.itemCount} products
            </p>
          ) : null
        }
      >
        <div className="store-search-grid">
          {products.map((item: any, index: number) => (
            <div key={item?._id ?? index} className="store-search-card">
              <ProductItem item={item} />
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}

export default StoreSearchPage;
