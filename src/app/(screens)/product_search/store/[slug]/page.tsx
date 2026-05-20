"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import uniqBy from "lodash/uniqBy";
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

  const sort = searchParams.get("sort") || "newest";
  const cid  = searchParams.get("cid")  || "";

  const [loading, setLoading]   = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage]         = useState(1);
  const [meta, setMeta]         = useState<any>({});

  const filtersRef = useRef({ sort, cid });

  const buildUrl = useCallback(
    (pageNum: number) => {
      const qs = new URLSearchParams();
      qs.set("page", String(pageNum));
      qs.set("take", String(PAGE_SIZE));
      qs.set("sort", sort);
      if (cid) qs.set("category", cid);
      return `${API.MARKETPLACE_FEED_STORE_PRODUCTS}/${slug}/products?${qs.toString()}`;
    },
    [slug, sort, cid],
  );

  const fetchProducts = useCallback(
    async (pageNum: number, reset: boolean) => {
      if (!slug) return;
      if (reset) {
        setLoading(true);
        setProducts([]);
      }
      try {
        const response: any = await GET(buildUrl(pageNum));
        if (response?.status) {
          const incoming: any[] = response?.data ?? [];
          setProducts((prev) =>
            reset ? incoming : uniqBy([...prev, ...incoming], "_id"),
          );
          setMeta(response?.meta ?? {});
          setPage(pageNum);
        }
      } catch {
        // silent — NoData shown when array is empty
      } finally {
        setLoading(false);
      }
    },
    [buildUrl, slug],
  );

  // Reset + refetch when filters change
  useEffect(() => {
    const prev = filtersRef.current;
    const changed = prev.sort !== sort || prev.cid !== cid;
    filtersRef.current = { sort, cid };
    if (changed) fetchProducts(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, cid]);

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
          style={{ margin: 0, padding: 0, overflow: "initial" }}
          dataLength={products.length}
          next={() => fetchProducts(page + 1, false)}
          hasMore={meta?.hasNextPage ?? false}
          loader={<SkelotonProductLoading count={6} />}
          endMessage={
            products.length > PAGE_SIZE ? (
              <p className="fw-bold text-center mt-3">
                Showing all {meta?.itemCount ?? products.length} products
              </p>
            ) : null
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
        <NoData header="No Products Available" />
      )}
    </div>
  );
}

export default StoreFront;
