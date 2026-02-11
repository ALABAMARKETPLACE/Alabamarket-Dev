"use client";
import React, { useReducer, useState } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { Button, Input, Tooltip } from "antd";
import { IoSearchOutline, IoAddCircleOutline, IoRefresh } from "react-icons/io5";
import { FiGrid } from "react-icons/fi";
import Loading from "@/app/(dashboard)/_components/loading";
import DataTable from "./_components/dataTable";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import useDebounceQuery from "@/shared/hook/useDebounceQuery";
import AddCategoryModal from "./_components/addCategoryModal";
import { reducer, Category } from "./_components/types_and_interfaces";
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
      GET(API.CATEGORY_LIST, queryKey[1] as Record<string, unknown>, signal),
    queryKey: ["admin_category", { page, search, take, order: "DESC" }],
  });
  return (
    <>
      <PageHeader 
        title="Categories" 
        bredcume="Dashboard / Categories"
        icon={<FiGrid size={24} />}
      >
        <Input
          suffix={<IoSearchOutline />}
          placeholder="Search categories..."
          className="header-search-input"
          allowClear
          onChange={(e) => {
            handleChange(e?.target?.value);
            setPage(1);
          }}
        />
        <Tooltip title="Add New Category">
          <Button 
            type="primary" 
            icon={<IoAddCircleOutline size={18} />}
            onClick={() => dispatch({ type: "add" })}
          >
            <span className="btn-text">Add Category</span>
          </Button>
        </Tooltip>
        <Tooltip title="Refresh Data">
          <Button
            type="primary"
            ghost
            icon={<IoRefresh size={18} className={isFetching && !isLoading ? "spin-animation" : ""} />}
            onClick={() => refetch()}
            loading={isFetching && !isLoading}
          >
            <span className="btn-text">Refresh</span>
          </Button>
        </Tooltip>
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
          edit={(item: Category) => dispatch({ type: "edit", item })}
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
