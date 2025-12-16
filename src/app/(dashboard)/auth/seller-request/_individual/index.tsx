"use client";
import React, { forwardRef, Ref, useImperativeHandle, useState } from "react";
import Loading from "@/app/(dashboard)/_components/loading";
import DataTable from "./table";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import useDebounceQuery from "@/shared/hook/useDebounceQuery";
import API from "@/config/API_ADMIN";
import Error from "@/app/(dashboard)/_components/error";
type ResetType = {
  query: (query: string) => void;
};
function Individual(props: any, ref: Ref<ResetType>) {
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);
  const [query, , handleChange] = useDebounceQuery("", 300);

  const {
    data: sellers,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryFn: ({ queryKey }) =>
      GET(API.INDIVIDUAL_STORE_GETALL, queryKey[1] as object),
    queryKey: [
      "admin_seller_request_individual",
      { page, query, take, order: "DESC" },
    ],
  });

  useImperativeHandle(ref, () => ({
    query: function (query: string) {
      handleChange(query);
      setPage(1);
    },
  }));
  return (
    <div style={{ marginTop: -5 }}>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={error?.message} />
      ) : (
        <DataTable
          data={
            Array.isArray(sellers?.data)
              ? sellers?.data?.filter((s: any) => s?.status === "pending")
              : []
          }
          count={sellers?.meta?.itemCount}
          setPage={setPage}
          setTake={setTake}
          pageSize={take}
          page={page}
        />
      )}
    </div>
  );
}

export default forwardRef(Individual);
