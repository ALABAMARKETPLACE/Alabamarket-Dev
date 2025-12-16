import React from "react";
import DataTable from "../tables/dataTable.products";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";
import useCreateQueryString from "@/shared/hook/useCreateQueryString";

function Products({ id }: { id: string }) {
  const [searchParams, setQuery] = useCreateQueryString();
  const page = Number(searchParams.get("page")) || 1;
  const take = Number(searchParams.get("take")) || 10;
  const query = searchParams.get("query") || "";

  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryFn: ({ queryKey, signal }) =>
      GET(API.PRODUCTS_BYSTORE + "/" + id, queryKey[1] as object, signal),
    queryKey: ["admin_products_bystore", { page, take, query }, id],
  });
  return (
    <>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={error?.message} />
      ) : (
        <DataTable
          data={Array.isArray(products?.data) ? products?.data : []}
          count={products?.meta?.itemCount ?? 0}
          setPage={(p, t) => setQuery({ page: p, take: t })}
          pageSize={take}
          page={page}
        />
      )}
    </>
  );
}

export default Products;
