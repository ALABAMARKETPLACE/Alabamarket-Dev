"use client";
import React from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import Loading from "@/app/(dashboard)/_components/loading";
import { Button, Input, Select } from "antd";
import { IoSearchOutline } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import DataTable from "./_components/dataTable";
import options from "./_components/options.json";
import Error from "@/app/(dashboard)/_components/error";
import useCreateQueryString from "@/shared/hook/useCreateQueryString";
import debounce from "@/shared/helpers/debounce";

function Page() {
  const [searchParams, setQuery] = useCreateQueryString();
  const page = Number(searchParams.get("page")) || 1;
  const take = Number(searchParams.get("take")) || 10;
  const name = searchParams.get("query") || "";
  const status = searchParams.get("status") || "all";
  const debounceQuery = debounce((val: string) =>
    setQuery({ page: 1, query: val })
  );

  const {
    data: users,
    isLoading,
    isFetching,
    refetch,
    isError,
    error,
  } = useQuery({
    queryFn: async ({ queryKey }) =>
      await GET(API.APP_USERS, queryKey[1] as object),
    queryKey: ["admin_users", { page, name, take, status, order: "DESC" }],
  });

  return (
    <>
      <PageHeader title={"Users"} bredcume={"Dashboard / Users"}>
        <Input
          allowClear
          suffix={<IoSearchOutline />}
          placeholder="Search name/email/phone"
          onChange={(e) => debounceQuery(e?.target?.value)}
          defaultValue={name}
        />
        <div>
          <Select
            style={{ width: 150 }}
            defaultValue={status}
            options={options}
            allowClear
            onChange={(v) => setQuery({ status: v, page: 1 })}
          />
        </div>

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
          data={Array.isArray(users?.data) ? users?.data : []}
          count={users?.meta?.itemCount}
          setPage={(p: number, t: number) => setQuery({ page: p, take: t })}
          pageSize={take}
          page={page}
        />
      )}
    </>
  );
}

export default Page;
