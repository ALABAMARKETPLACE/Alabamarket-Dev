"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
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

  const sort        = searchParams.get("sort")        || "newest";
  const minPrice    = searchParams.get("minPrice")    || "";
  const maxPrice    = searchParams.get("maxPrice")    || "";
  const category    = searchParams.get("cid")         || "";
  const subCategory = searchParams.get("subCategory") || "";

  // Endpoint requires a numeric store ID — resolve from slug if necessary
  const [numericStoreId, setNumericStoreId] = useState<string | null>(
    /^\d+$/.test(slug) ? slug : null,
  );
  useEffect(() => {
    if (/^\d+$/.test(slug)) { setNumericStoreId(slug); return; }
    GET(`${API.STORE_SEARCH_GETINFO}${slug}`)
      .then((res: any) => {
        const id = res?.data?.store?._id ?? res?.data?.store?.id;
        if (id) setNumericStoreId(String(id));
      })
      .catch(() => {});
  }, [slug]);

  const [loading, setLoading]   = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage]         = useState(1);
  const [hasNext, setHasNext]   = useState(false);

  const seenIds = useRef(new Set<string>());

  const buildParams = useCallback(
    (pageNum: number) => {
      const p: Record<string, string | number> = {
        page: pageNum,
        take: PAGE_SIZE,
        sort,
      };
      if (minPrice)    p.minPrice    = Number(minPrice);
      if (maxPrice)    p.maxPrice    = Number(maxPrice);
      if (category)    p.category    = Number(category);
      if (subCategory) p.subCategory = Number(subCategory);
      return p;
    },
    [sort, minPrice, maxPrice, category, subCategory],
  );

  const fetchProducts = useCallback(
    async (pageNum: number, reset: boolean) => {
      if (!numericStoreId) return;
      if (reset) {
        setLoading(true);
        setProducts([]);
        seenIds.current = new Set();
      }

      try {
        const url = `${API.MARKETPLACE_FEED_STORE_PRODUCTS}/${numericStoreId}/products`;
        const res: any = await GET(url, buildParams(pageNum));

        if (res?.status) {
          const incoming: any[] = Array.isArray(res.data) ? res.data : [];

          // Deduplicate across pages
          const fresh = incoming.filter((item) => {
            const id = String(item?._id ?? item?.id ?? "");
            if (!id || seenIds.current.has(id)) return false;
            seenIds.current.add(id);
            return true;
          });

          setProducts((prev) => (reset ? fresh : [...prev, ...fresh]));
          setHasNext(res?.meta?.hasNextPage ?? false);
          setPage(pageNum);
        }
      } catch {
        // silent — NoData shown when array is empty
      } finally {
        setLoading(false);
      }
    },
    [numericStoreId, buildParams],
  );

  // Reset on filter change
  const filtersKey = `${sort}|${minPrice}|${maxPrice}|${category}|${subCategory}`;
  const prevFiltersKey = useRef(filtersKey);
  useEffect(() => {
    if (prevFiltersKey.current !== filtersKey) {
      prevFiltersKey.current = filtersKey;
      if (numericStoreId) fetchProducts(1, true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, numericStoreId]);

  // Load once numeric ID is resolved (covers initial load and slug→id resolution)
  useEffect(() => {
    if (numericStoreId) fetchProducts(1, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericStoreId]);

  return (
    <div className="mt-3">
      {loading ? (
        <SkelotonProductLoading count={18} />
      ) : products.length ? (
        <InfiniteScroll
          style={{ margin: 0, padding: 0, overflow: "initial" }}
          dataLength={products.length}
          next={() => fetchProducts(page + 1, false)}
          hasMore={hasNext}
          loader={<SkelotonProductLoading count={6} />}
          endMessage={
            products.length > PAGE_SIZE ? (
              <p className="fw-bold text-center mt-3">
                Showing {products.length} products
              </p>
            ) : null
          }
        >
          <Row className="gy-2 gy-md-3 mx-0 gx-2 gx-md-3">
            {products.map((item: any, index: number) => (
              <Col
                key={item?._id ?? item?.id ?? index}
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
