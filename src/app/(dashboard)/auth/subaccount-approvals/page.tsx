"use client";
import React, { useState } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";
import DataTable from "./_components/dataTable";

function SubaccountApprovals() {
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);

  const {
    data: subaccounts,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryFn: ({ queryKey }) =>
      GET(API.PAYSTACK_SUBACCOUNT_PENDING, queryKey[1] as object),
    queryKey: ["admin_paystack_subaccounts_pending", { page, take }],
  });

  return (
    <>
      <PageHeader
        title={"Paystack Subaccount Approvals"}
        bredcume={"Dashboard / Subaccount Approvals"}
      />
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={error?.message} />
      ) : (
        <DataTable
          data={Array.isArray(subaccounts?.data) ? subaccounts?.data : []}
          count={subaccounts?.meta?.itemCount}
          setPage={setPage}
          setTake={setTake}
          pageSize={take}
          page={page}
        />
      )}
    </>
  );
}

export default SubaccountApprovals;
