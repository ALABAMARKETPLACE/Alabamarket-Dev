"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import _ from "lodash";
import NoData from "@/components/noData";
import API from "@/config/API";
import { GET } from "@/util/apicall";
import SkelotonProductLoading from "@/components/skeleton";
import ProductItem from "@/components/productItem/page";
import { useParams, useSearchParams } from "next/navigation";
import { Col, Row } from "react-bootstrap";

const PAGE_SIZE = 18;

function StoreFront() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;

  const order = searchParams.get("order") || "ASC";
  const price = searchParams.get("price") || "RAND";
  const cid = searchParams.get("cid") || "";
  const subCategory = searchParams.get("subCategory") || "";
  const query = searchParams.get("query") || "";

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({});

  const filtersRef = useRef({ order, price, cid, subCategory, query });

  const buildUrl = useCallback(
    (pageNum: number) => {
      const qs = new URLSearchParams();
      qs.set("storeId", slug);
      qs.set("page", String(pageNum));
      qs.set("take", String(PAGE_SIZE));
      qs.set("order", order);
      if (price === "ASC" || price === "DESC") qs.set("price", price);
      if (cid) qs.set("category", cid);
      if (subCategory) qs.set("subCategory", subCategory);
      if (query) qs.set("query", query);
      return `${API.PRODUCT_SEARCH_NEW_SINGLE}?${qs.toString()}`;
    },
    [slug, order, price, cid, subCategory, query]
  );

  const fetchProducts = useCallback(
    async (pageNum: number, reset: boolean) => {
      if (!slug) return;
      if (reset) {
        setLoading(true);
        setProducts([]);
      }

      try {
        const url = buildUrl(pageNum);
        const response: any = await GET(url);
        if (response?.status) {
          const incoming: any[] = response?.data ?? [];
          setProducts((prev) =>
            reset
              ? incoming
              : _.uniqBy([...prev, ...incoming], "_id")
          );
          setMeta(response?.meta ?? {});
          setPage(pageNum);
        }
      } catch (err) {
        // silent — NoData shown when products array is empty
      } finally {
        setLoading(false);
      }
    },
    [buildUrl, slug]
  );

  // Reset + refetch whenever any filter/category changes
  useEffect(() => {
    const prev = filtersRef.current;
    const changed =
      prev.order !== order ||
      prev.price !== price ||
      prev.cid !== cid ||
      prev.subCategory !== subCategory ||
      prev.query !== query;

    filtersRef.current = { order, price, cid, subCategory, query };

    if (changed) {
      fetchProducts(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, price, cid, subCategory, query]);

  // Initial load
  useEffect(() => {
    fetchProducts(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-3">
      {loading ? (
        <SkelotonProductLoading count={18} />
      ) : products.length ? (
        <InfiniteScroll
          style={{ margin: "0px", padding: "0px", overflow: "initial" }}
          dataLength={products.length}
          next={() => fetchProducts(page + 1, false)}
          hasMore={meta?.hasNextPage ?? false}
          loader={<SkelotonProductLoading count={6} />}
          endMessage={
            <p className="fw-bold text-center mt-3">
              {products.length > PAGE_SIZE
                ? `Showing ${meta?.itemCount ?? products.length} products`
                : ""}
            </p>
          }
        >
          <Row className="gy-2 gy-md-3 mx-0 gx-2 gx-md-3">
            {products.map((item: any, index: number) => (
              <Col
                key={item?._id ?? index}
                sm={4}
                md={3}
                className="ps-md-0 col-6 product-card-searchstore lg-25"
              >
                <ProductItem item={item} />
              </Col>
            ))}
          </Row>
        </InfiniteScroll>
      ) : (
        <NoData header={"No Products Available"} />
      )}
    </div>
  );
}

export default StoreFront;
