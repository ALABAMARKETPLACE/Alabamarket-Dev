import React from "react";
import DataTable from "../tables/dataTable.history";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import Loading from "@/app/(dashboard)/_components/loading";
import useCreateQueryString from "@/shared/hook/useCreateQueryString";
import Error from "@/app/(dashboard)/_components/error";

function SettlementHistory({ id }: { id: string | number }) {
  const [searchParams, setQuery] = useCreateQueryString();
  const page = Number(searchParams.get("page")) || 1;
  const take = Number(searchParams.get("take")) || 10;
  const settle_status = searchParams.get("settle_status") || "";
  const {
    data: settlement,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryFn: ({ queryKey }) =>
      GET(API.SETTLEMENT_HISTORY + id, queryKey[1] as object),
    queryKey: [
      "admin_settlement_history_seller",
      { page, take, settle_status },
      id,
    ],
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
        <Error description={error?.message} />
      ) : (
        <DataTable
          page={page}
          data={Array.isArray(settlement?.data) ? settlement?.data : []}
          count={settlement?.meta?.itemCount}
          setPage={(p: number, t: number) => setQuery({ page: p, take: t })}
          pageSize={take}
        />
      )}
    </>
  );
}

export default SettlementHistory;
