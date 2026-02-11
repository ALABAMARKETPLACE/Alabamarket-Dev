"use client";
import React, { useReducer, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Input, Select, Tooltip } from "antd";
import { IoSearchOutline, IoAddCircleOutline, IoRefresh } from "react-icons/io5";
import { FiLayers } from "react-icons/fi";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import Loading from "@/app/(dashboard)/_components/loading";
import DataTable from "./_components/dataTable";
import useDebounceQuery from "@/shared/hook/useDebounceQuery";
import { useAppSelector } from "@/redux/hooks";
import { reduxCategoryItems } from "@/redux/slice/categorySlice";
import AddSubcategoryModal from "./_components/subcategoryAddModal";
import { reducer } from "./_components/types_and_reducer";
import Error from "@/app/(dashboard)/_components/error";

function Page() {
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);
  const [debounce, search, handleChange] = useDebounceQuery("", 300);
  const [category, setCategory] = useState("");
  const [state, dispatch] = useReducer(reducer, { status: false, type: "add" });
  const categories = useAppSelector(reduxCategoryItems)?.map((item) => ({
    value: item?.id,
    label: item?.name,
  }));

  const {
    data: subcategory,
    isLoading,
    refetch,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryFn: async () =>
      await GET(API.SUBCATEGORY_LIST, {
        order: "DESC",
        page,
        take,
        search,
        category,
      }),
    queryKey: ["admin_subcategory", page, debounce, take, category],
  });
  return (
    <>
      <PageHeader 
        title="Subcategories" 
        bredcume="Dashboard / Subcategories"
        icon={<FiLayers size={24} />}
      >
        <Input
          suffix={<IoSearchOutline />}
          placeholder="Search subcategories..."
          className="header-search-input"
          allowClear
          onChange={(e) => {
            handleChange(e?.target?.value);
            setPage(1);
          }}
        />
        <Select
          placeholder="Filter by Category"
          options={[{ value: "", label: "All Categories" }, ...categories]}
          className="header-filter-select"
          allowClear
          onChange={(v) => {
            setCategory(v || "");
            setPage(1);
          }}
        />
        <Tooltip title="Add New Subcategory">
          <Button 
            type="primary" 
            icon={<IoAddCircleOutline size={18} />}
            onClick={() => dispatch({ type: "add" })}
          >
            <span className="btn-text">Add Subcategory</span>
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
          data={Array.isArray(subcategory?.data) ? subcategory?.data : []}
          count={subcategory?.meta?.itemCount}
          setPage={setPage}
          setTake={setTake}
          pageSize={take}
          page={page}
          edit={(item: any) => dispatch({ type: "edit", item })}
        />
      )}
      <AddSubcategoryModal
        open={state.status}
        close={() => dispatch({ type: "close" })}
        type={state.type}
        data={state.item}
      />
    </>
  );
}

export default Page;
