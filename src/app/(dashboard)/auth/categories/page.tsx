"use client";
import React, { useReducer, useState } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { Button, Input } from "antd";
import { IoSearchOutline } from "react-icons/io5";
import Loading from "@/app/(dashboard)/_components/loading";
import DataTable from "./_components/dataTable";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import useDebounceQuery from "@/shared/hook/useDebounceQuery";
import AddCategoryModal from "./_components/addCategoryModal";
import { reducer } from "./_components/types_and_interfaces";
import Error from "@/app/(dashboard)/_components/error";

function Page() {
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);
  const [search, , handleChange] = useDebounceQuery("", 300);
  const [state, dispatch] = useReducer(reducer, { status: false, type: "add" });

  const {
    data: category,
    isLoading,
    refetch,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryFn: ({ queryKey, signal }) =>
      GET(API.CATEGORY_LIST, queryKey[1] as object, signal),
    queryKey: ["admin_category", { page, search, take, order: "DESC" }],
  });
  return (
    <>
      <PageHeader title={"Category"} bredcume={"Dashboard / Category"}>
        <Input
          suffix={<IoSearchOutline />}
          placeholder="Search . . ."
          onChange={(e) => {
            handleChange(e?.target?.value);
            setPage(1);
          }}
        />
        <Button type="primary" onClick={() => dispatch({ type: "add" })}>
          New +
        </Button>
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
          data={Array.isArray(category?.data) ? category?.data : []}
          count={category?.meta?.itemCount}
          setPage={setPage}
          setTake={setTake}
          pageSize={take}
          page={page}
          edit={(item: any) => dispatch({ type: "edit", item })}
        />
      )}
      <AddCategoryModal
        open={state.status}
        close={() => dispatch({ type: "close" })}
        type={state.type}
        data={state.item}
      />
    </>
  );
}

export default Page;
