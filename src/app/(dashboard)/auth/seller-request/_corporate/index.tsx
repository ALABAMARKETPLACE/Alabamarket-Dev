"use client";
import React, { forwardRef, Ref, useImperativeHandle, useState } from "react";
import Loading from "@/app/(dashboard)/_components/loading";
import DataTable from "./table";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import useDebounceQuery from "@/shared/hook/useDebounceQuery";
import Error from "@/app/(dashboard)/_components/error";
type ResetType = {
  query: (query: string) => void;
  date: (query: string) => void;
};

function Corporate(props: any, ref: Ref<ResetType>) {
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);
  const [name, , handleChange] = useDebounceQuery("", 300);

  const {
    data: sellers,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryFn: ({ queryKey }) =>
      GET(API.CORPORATE_STORE_GETALL + "pending", queryKey[1] as object),
    queryKey: ["admin_seller_request", { page, take, name, order: "DESC" }],
  });

  useImperativeHandle(ref, () => ({
    query: function (query: string) {
      handleChange(query);
      setPage(1);
    },
    date: function (date: string) {},
  }));
  return (
    <div style={{ marginTop: -5 }}>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={error?.message} />
      ) : (
        <DataTable
          data={Array.isArray(sellers?.data) ? sellers?.data : []}
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

export default forwardRef(Corporate);
