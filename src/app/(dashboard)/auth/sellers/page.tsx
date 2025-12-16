"use client";
import React from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import Loading from "@/app/(dashboard)/_components/loading";
import { Button, Input, Select } from "antd";
import { IoSearchOutline } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import DataTable from "@/app/(dashboard)/auth/sellers/_components/dataTable";
import options from "@/app/(dashboard)/auth/sellers/_components/options.json";
import Error from "@/app/(dashboard)/_components/error";
import debounce from "@/shared/helpers/debounce";
import useCreateQueryString from "@/shared/hook/useCreateQueryString";

function Page() {
  const [searchParams, setQuery] = useCreateQueryString();
  const page = Number(searchParams.get("page")) || 1;
  const sellerStatus = searchParams.get("status") || "approved";
  const query = searchParams.get("query") || "";
  const take = Number(searchParams.get("take")) || 10;
  const debounceQuery = debounce((val: string) =>
    setQuery({ page: 1, query: val })
  );

  const {
    data: sellers,
    isLoading,
    isFetching,
    refetch,
    isError,
    error,
  } = useQuery({
    queryFn: ({ queryKey }) =>
      GET(API.CORPORATE_STORE_GETALL + sellerStatus, queryKey[1] as object),
    queryKey: ["admin_sellers", { page, name: query, take, sellerStatus }],
  });

  return (
    <>
      <PageHeader title={"Sellers"} bredcume={"Dashboard / Sellers"}>
        <Select
          defaultValue={sellerStatus}
          options={options}
          onChange={(v) => setQuery({ status: v, page: "1" })}
        />
        <Input
          suffix={<IoSearchOutline />}
          placeholder="Search . . ."
          defaultValue={query}
          onChange={(e) => debounceQuery(e?.target?.value)}
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
          data={Array.isArray(sellers?.data) ? sellers?.data : []}
          count={sellers?.meta?.itemCount}
          setPage={(p, t) => setQuery({ page: p, take: t })}
          pageSize={take}
          page={page}
        />
      )}
    </>
  );
}

export default Page;
