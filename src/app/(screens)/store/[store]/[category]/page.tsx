"use client";
import { Row } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { Col } from "react-bootstrap";
import InfiniteScroll from "react-infinite-scroll-component";
import _ from "lodash";
import useMediaQuery from "@/shared/hook/useMediaQuery";
import ProductItem from "@/components/productItem/page";
import NoData from "@/components/noData";
import API from "@/config/API";
import { GET } from "@/util/apicall";
import SkelotonProductLoading from "@/components/skeleton";
import useDidUpdateEffect from "@/shared/hook/useDidUpdate";
import { useParams, useSearchParams } from "next/navigation";

function SecondPage() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const params = useParams();
  const searchParams = useSearchParams();
  const storeId = params?.store;
  const category = searchParams.get("cid") ?? "";
  const ogCategory = searchParams.get("ogCategory") ?? "";
  const categoryName = searchParams.get("type") || "";
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({});
  const [abortController, setAbortController] = useState<any>(null);
  const pageSize = 18;
  const price = searchParams.get("price") || "RAND";
  const order = searchParams.get("order") || "ASC";
  const mediaQuery = useMediaQuery(762);
  const getProductsByCategory = async (current: number) => {
    const url =
      API.PRODUCT_SEARCH_ITEM +
      storeId +
      `?subCategory=${category}&order=DESC&page=${current}&take=${pageSize}&category=${ogCategory}`;
    const controller = new AbortController();
    setAbortController(controller);
    const signal = controller.signal;
    if (storeId && (category || ogCategory)) {
      try {
        if (abortController) {
          abortController.abort();
        }
        const response: any = await GET(url,{}, signal);
        if (response.status) {
          setProducts((prod) => _.uniqBy([...prod, ...response?.data], "_id"));
          setMeta(response.meta);
        } else throw new Error(response.message);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
  };
  const changePage = async (page: number) => {
    await getProductsByCategory(page);
    setPage(page);
  };
  useEffect(() => {
    setPage(1);
    setProducts([]);
    setLoading(true);
    getProductsByCategory(1);
    window.scrollTo(0, 0);
  }, [category]);

  function sortProductsByRetailRate(data: any[], price: string, order: string) {
    if (order == "DESC") {
      return Array.isArray(data) ? _.orderBy(products, ["_id"], ["desc"]) : [];
    } else if (price == "ASC" || price == "DESC") {
      return Array.isArray(data)
        ? _.orderBy(
            products,
            ["retail_rate"],
            [price == "ASC" ? "asc" : "desc"]
          )
        : [];
    } else {
      return data;
    }
  }
  useDidUpdateEffect(() => {
    const sorted = sortProductsByRetailRate(products, price, order);
    setProducts(() => [...sorted]);
  }, [price, order,page]);
  return (
    <>
      {loading ? (
        <>
          <SkelotonProductLoading count={mediaQuery ? 6 : 18} />
        </>
      ) : products.length ? (
        <InfiniteScroll
          dataLength={products.length}
          next={() => {
            changePage(page + 1);
          }}
          hasMore={meta?.hasNextPage ?? false}
          loader={<SkelotonProductLoading count={mediaQuery ? 2 : 6} />}
          endMessage={
            <p className="fw-bold text-center mt-3">
              {products?.length > 18
                ? `Showing ${meta?.itemCount} of ${meta?.itemCount} Products`
                : ""}
            </p>
          }
        >
          <Row className="gy-2 gy-md-3 mx-0 gx-2 gx-md-3 ">
            <Col md="12">
              {" "}
              <h5 className="card-subtitle-text mt-md-0 mt-2">{`${categoryName} (${meta?.itemCount} items)`}</h5>
            </Col>
            {products?.map((item: any, index: number) => (
              <Col
                sm="4"
                md="3"
                className="ps-md-0 col-6 product-card-searchstore lg-25"
                key={index}
              >
                <ProductItem item={item} />
              </Col>
            ))}
          </Row>
        </InfiniteScroll>
      ) : (
        <NoData heading={"No Products "} text1="No Products available" />
      )}
    </>
  );
}

export default SecondPage;
