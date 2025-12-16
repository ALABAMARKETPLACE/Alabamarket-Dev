"use client";
import React, { useState } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import Loading from "@/app/(dashboard)/_components/loading";
import { Button, Input } from "antd";
import { IoSearchOutline } from "react-icons/io5";
import useDebounceQuery from "@/shared/hook/useDebounceQuery";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import DataTable from "./_components/dataTable";
import Error from "@/app/(dashboard)/_components/error";

function Page() {
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);
  const [query, , handleChange] = useDebounceQuery("", 300);

  const {
    data: enquiry,
    isLoading,
    refetch,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryFn: async ({ queryKey, signal }) =>
      await GET(API.ENQUIRY_GET, queryKey[1] as object, signal),
    queryKey: ["admin_enquiry", { page, take, query, order: "DESC" }],
  });
  return (
    <>
      <PageHeader title={"Enquiry"} bredcume={"Dashboard / Enquiry"}>
        <Input
          suffix={<IoSearchOutline />}
          placeholder="Search email"
          type="text"
          max={50}
          onChange={(e) => {
            handleChange(e?.target?.value);
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
          data={Array.isArray(enquiry?.data) ? enquiry?.data : []}
          count={enquiry?.meta?.itemCount}
          setPage={setPage}
          setTake={setTake}
          pageSize={take}
          page={page}
        />
      )}
    </>
  );
}

export default Page;
