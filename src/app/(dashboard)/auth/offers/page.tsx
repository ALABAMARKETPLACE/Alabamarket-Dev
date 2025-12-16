"use client";
import React, { useReducer, useState } from "react";
import { Button, Input, Select } from "antd";
import { IoSearchOutline } from "react-icons/io5";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import Loading from "@/app/(dashboard)/_components/loading";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import useDebounceQuery from "@/shared/hook/useDebounceQuery";
import DataTable from "./_components/dataTable";
import AddOfferModal from "./_components/addofferModal";
import { reducer } from "./_components/reducer";
import options from "@/app/(dashboard)/auth/offers/_components/options.json";
import { useSession } from "next-auth/react";
import Error from "@/app/(dashboard)/_components/error";

function Page() {
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);
  const [query, , handleChange] = useDebounceQuery("", 300);
  const [state, dispatch] = useReducer(reducer, { status: false, type: "add" });
  const [status, setStatus] = useState("");
  const { data, status: stat }: any = useSession();

  const {
    data: offers,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryFn: ({ queryKey }) => GET(API.OFFERS_GETALL, queryKey[1] as object),
    queryKey: ["admin_offers", { page, query, take, order: "DESC", status }],
  });

  return (
    <>
      <PageHeader title={"Offers"} bredcume={"Dashboard / Offers"}>
        <Input
          allowClear
          suffix={<IoSearchOutline />}
          placeholder="Search . . ."
          onChange={(e) => {
            handleChange(e?.target?.value);
            setPage(1);
          }}
        />
        <Select
          defaultValue="Select Status"
          options={options}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        />
        {data?.role == "admin" ? (
          <Button type="primary" onClick={() => dispatch({ type: "add" })}>
            New +
          </Button>
        ) : null}

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
          data={Array.isArray(offers?.data) ? offers?.data : []}
          count={offers?.meta?.itemCount}
          setPage={setPage}
          setTake={setTake}
          pageSize={take}
          page={page}
          edit={(item: any) => dispatch({ type: "edit", item })}
        />
      )}
      <AddOfferModal
        open={state.status}
        close={() => dispatch({ type: "close" })}
        type={state.type}
        data={state.item}
      />
    </>
  );
}

export default Page;
