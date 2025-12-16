import React, { useState } from "react";
import DataTable from "../_components/dataTable";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import { useParams } from "next/navigation";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";

function UserOrders() {
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);
  const params = useParams();

  const {
    data: orders,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryFn: ({ queryKey }) =>
      GET(API.ORDER_BY_USER + params?.id, queryKey[1] as object),
    queryKey: [
      "admin_user_orders",
      {
        page,
        take,
        order: "DESC",
      },
      params?.id,
    ],
  });
  return (
    <>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={error.message} />
      ) : (
        <DataTable
          data={Array.isArray(orders?.data) ? orders?.data : []}
          count={orders?.meta?.itemCount}
          setPage={setPage}
          setTake={setTake}
          pageSize={take}
          page={page}
        />
      )}
    </>
  );
}

export default UserOrders;
