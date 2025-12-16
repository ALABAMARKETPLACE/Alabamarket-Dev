"use client";
import React, { useEffect, useState } from "react";
import "./style.scss";
import InfiniteScroll from "react-infinite-scroll-component";
import _ from "lodash";
import NoData from "@/components/noData";
import useDidUpdateEffect from "@/shared/hook/useDidUpdate";
import API from "@/config/API";
import { GET } from "@/util/apicall";
import SkelotonProductLoading from "@/components/skeleton";
import StoreAllProducts from "@/components/storeAllProducts/storeAllProducts";
import { useParams, useSearchParams } from "next/navigation";
function StoreFront() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({});
  const pageSize = 10;
  const storeId = params?.store;
  const searchParams = useSearchParams();
  const price = searchParams.get("price") || "RAND";
  const order = searchParams.get("order") || "ASC";

  const getProductsByStore = async (current: number = page) => {
    const url =
      API.PRODUCT_SEARCH_ALL_CATEGORIES +
      storeId +
      `?order=${order}&page=${current}&take=${pageSize}&price=${price}`;
    if (storeId) {
      try {
        const response: any = await GET(url);
        if (response.status) {
          setProducts((prod) => _.uniqBy([...prod, ...response?.data], "_id"));
          setMeta(response?.meta);
        } else throw new Error(response.message);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
  };

  const changePage = async (page: number) => {
    await getProductsByStore(page);
    setPage(page);
  };

  useEffect(() => {
    getProductsByStore(page);
  }, []);
  function sortProductsByRetailRate(data: any[], price: string, order: string) {
    if (order == "DESC") {
      return Array.isArray(data)
        ? data.map((category) => {
            return {
              ...category,
              products: _.orderBy(category?.products, ["_id"], ["desc"]),
            };
          })
        : [];
    } else if (price == "ASC" || price == "DESC") {
      return Array.isArray(data)
        ? data.map((category) => {
            return {
              ...category,
              products: _.orderBy(
                category?.products,
                ["retail_rate"],
                [price == "ASC" ? "asc" : "desc"]
              ),
            };
          })
        : [];
    } else {
      return data;
    }
  }
  useDidUpdateEffect(() => {
    const newP = sortProductsByRetailRate(products, price, order);
    setProducts((produ) => [...newP]);
  }, [price, order, page]);
  return (
    <div className="mt-3">
      {loading ? (
        <SkelotonProductLoading count={18} />
      ) : products.length ? (
        <InfiniteScroll
          style={{ margin: "0px", padding: "0px", overflow: "initial" }}
          dataLength={products.length}
          next={() => {
            changePage(page + 1);
          }}
          hasMore={meta?.hasNextPage ?? false}
          loader={<SkelotonProductLoading />}
          endMessage={
            <p className="fw-bold text-center mt-3">
              {products?.length > 18
                ? `Showing ${meta?.itemCount} of ${meta?.itemCount} Categories`
                : ""}
            </p>
          }
        >
          {products.map((item: any) => (
            <StoreAllProducts data={item} />
          ))}
        </InfiniteScroll>
      ) : (
        <NoData header={"No Products Available"} />
      )}
      {/* <div className="d-flex justify-content-center mt-3">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={meta?.itemCount || 0}
          defaultCurrent={1}
          responsive={true}
          defaultPageSize={pageSize}
          disabled={false}
          hideOnSinglePage={true}
          onChange={(current: any, size: any) => {
            changePage(current);
          }}
        />
      </div> */}
    </div>
  );
}

export default StoreFront;
