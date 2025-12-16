"use client";
import React, { useState } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { Button, Input, Select } from "antd";
import { IoSearchOutline } from "react-icons/io5";
import Loading from "@/app/(dashboard)/_components/loading";
import DataTable from "./_components/dataTable";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import useDebounceQuery from "@/shared/hook/useDebounceQuery";
import Error from "@/app/(dashboard)/_components/error";

function BoostApprovals() {
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);
  const [query, , handleChange] = useDebounceQuery("", 300);
  const [status, setStatus] = useState("all");

  const {
    data: boostRequests,
    isLoading,
    isFetching,
    refetch,
    isError,
    error,
  } = useQuery({
    queryFn: ({ queryKey, signal }) =>
      GET(API_ADMIN.BOOST_REQUESTS, queryKey[1] as object, signal),
    queryKey: [
      "boost_requests_admin",
      { page, limit: take, search: query, status },
    ],
  });

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "expired", label: "Expired" },
  ];

  return (
    <>
      <PageHeader
        title={"Boost Approvals"}
        bredcume={"Dashboard / Boost Approvals"}
      >
        <Input
          suffix={<IoSearchOutline />}
          placeholder="Search seller name..."
          onChange={(e) => {
            handleChange(e?.target?.value);
            setPage(1);
          }}
        />
        <Select
          defaultValue="approved"
          options={statusOptions}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        />
        <Button
          type="primary"
          ghost
          onClick={() => refetch()}
          loading={isFetching && !isLoading}
        >
          Refresh
        </Button>
      </PageHeader>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={error?.message} />
      ) : (
        <DataTable
          data={
            Array.isArray(boostRequests?.data?.data)
              ? boostRequests?.data?.data
              : []
          }
          count={boostRequests?.data?.pagination?.total}
          setPage={setPage}
          setTake={setTake}
          pageSize={take}
          page={page}
        />
      )}
    </>
  );
}

export default BoostApprovals;
