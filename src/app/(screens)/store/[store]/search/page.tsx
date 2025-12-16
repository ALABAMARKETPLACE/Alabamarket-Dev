"use client";
import { Row } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { Col } from "react-bootstrap";
import InfiniteScroll from "react-infinite-scroll-component";
import _ from "lodash";
import ProductItem from "@/components/productItem/page";
import SkelotonProductLoading from "@/components/skeleton";
import NoData from "@/components/noData";
import API from "@/config/API";
import { GET } from "@/util/apicall";
import { useParams, useSearchParams } from "next/navigation";
import useDidUpdateEffect from "@/shared/hook/useDidUpdate";

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

        if (response?.status == true) {
          setProducts((prod) => _.uniqBy([...prod, ...response?.data], "_id"));
          setMeta(response?.meta);
        } else {
          setProducts([]);
          throw new Error(response.message);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
  };
  const changePage = async (page: number) => {
    await getProducts(page);
    setPage(page);
    // window.scrollTo(0, 0);
  };
  useEffect(() => {
    getProducts(1);
    window.scrollTo(0, 0);
  }, []);

  function sortProductsByRetailRate(data: any[], price: string, order: string) {
    if (order == "DESC") {
      return _.orderBy(products, [(product) => Number(product._id)], ['desc']);
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
  }, [price, order, page]);
  return (
    <>
      {loading ? (
        <SkelotonProductLoading count={18} />
      ) : products.length ? (
        <InfiniteScroll
          dataLength={products.length}
          next={() => {
            changePage(page + 1);
          }}
          hasMore={meta?.hasNextPage ?? false}
          loader={<SkelotonProductLoading />}
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
              <h5 className="mt-md-0 mt-2 card-subtitle-text">{`${meta.itemCount} Results For "${search}"`}</h5>
            </Col>
            {products.map((item: any, index: number) => (
              <Col
                md="3"
                sm="4"
                className="ps-md-0 col-6 product-card-searchstore lg-25"
                key={index}
              >
                <ProductItem item={item} />
              </Col>
            ))}
          </Row>
        </InfiniteScroll>
      ) : (
        <NoData text1="No Products available" />
      )}
    </>
  );
}

export default StoreSearchPage;
