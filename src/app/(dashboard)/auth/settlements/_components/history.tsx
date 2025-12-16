import React, { useState } from "react";
import DataTable from "./dataTable";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";

function History() {
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);

  const {
    data: settlement,
    isLoading,
    isError,
  } = useQuery({
    queryFn: ({ queryKey }) =>
      GET(API.SETTLEMENT_HISTORY, queryKey[1] as object),
    queryKey: ["admin_settlement_history", { order: "DESC", page, take }],
    select: (data) => {
      if (data?.status) return data;
      return null;
    },
  });

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error />
      ) : (
        <DataTable
          page={page}
          data={Array.isArray(settlement?.data) ? settlement?.data : []}
          count={settlement?.meta?.itemCount}
          setPage={setPage}
          setTake={setTake}
          pageSize={take}
        />
      )}
    </>
  );
}

export default History;
