"use client";
import React, { useState } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { Button, Input, Tabs } from "antd";
import { IoSearchOutline } from "react-icons/io5";
import Loading from "@/app/(dashboard)/_components/loading";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import useDebounceQuery from "@/shared/hook/useDebounceQuery";
import Error from "@/app/(dashboard)/_components/error";
import DeliveryCompanyTable from "./_components/deliveryCompanyTable";

function DeliveryPartnerApprovals() {
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);
  const [query, , handleChange] = useDebounceQuery("", 300);
  const [activeTab, setActiveTab] = useState("pending");

  const {
    data: companies,
    isLoading: isLoadingCompanies,
    isFetching: isFetchingCompanies,
    refetch: refetchCompanies,
    isError: isErrorCompanies,
    error: errorCompanies,
  } = useQuery({
    queryFn: ({ queryKey, signal }) =>
      GET(API_ADMIN.DELIVERY_COMPANIES_ALL, queryKey[1] as object, signal),
    queryKey: [
      "delivery_companies_admin",
      { page, limit: take, search: query, status: activeTab },
    ],
  });

  const tabItems = [
    {
      key: "pending",
      label: "Pending",
      children: (
        <>
          {isLoadingCompanies ? (
            <Loading />
          ) : isErrorCompanies ? (
            <Error description={errorCompanies?.message} />
          ) : (
            <DeliveryCompanyTable
              data={
                Array.isArray(companies?.data?.data)
                  ? companies?.data?.data
                  : Array.isArray(companies?.data)
                  ? companies?.data
                  : []
              }
              count={companies?.data?.pagination?.total || (Array.isArray(companies?.data) ? companies?.data.length : companies?.data?.data?.length || 0)}
              setPage={setPage}
              setTake={setTake}
              pageSize={take}
              page={page}
              status="pending"
            />
          )}
        </>
      ),
    },
    {
      key: "approved",
      label: "Approved",
      children: (
        <>
          {isLoadingCompanies ? (
            <Loading />
          ) : isErrorCompanies ? (
            <Error description={errorCompanies?.message} />
          ) : (
            <DeliveryCompanyTable
              data={
                Array.isArray(companies?.data?.data)
                  ? companies?.data?.data
                  : Array.isArray(companies?.data)
                  ? companies?.data
                  : []
              }
              count={companies?.data?.pagination?.total || (Array.isArray(companies?.data) ? companies?.data.length : companies?.data?.data?.length || 0)}
              setPage={setPage}
              setTake={setTake}
              pageSize={take}
              page={page}
              status="approved"
            />
          )}
        </>
      ),
    },
    {
      key: "rejected",
      label: "Rejected",
      children: (
        <>
          {isLoadingCompanies ? (
            <Loading />
          ) : isErrorCompanies ? (
            <Error description={errorCompanies?.message} />
          ) : (
            <DeliveryCompanyTable
              data={
                Array.isArray(companies?.data?.data)
                  ? companies?.data?.data
                  : Array.isArray(companies?.data)
                  ? companies?.data
                  : []
              }
              count={companies?.data?.pagination?.total || (Array.isArray(companies?.data) ? companies?.data.length : companies?.data?.data?.length || 0)}
              setPage={setPage}
              setTake={setTake}
              pageSize={take}
              page={page}
              status="rejected"
            />
          )}
        </>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={"Delivery Company Approvals"}
        bredcume={"Dashboard / Delivery Company Approvals"}
      >
        <Input
          suffix={<IoSearchOutline />}
          placeholder="Search company name..."
          onChange={(e) => {
            handleChange(e?.target?.value);
            setPage(1);
          }}
        />
        <Button
          type="primary"
          ghost
          onClick={() => {
            refetchCompanies();
          }}
          loading={isFetchingCompanies && !isLoadingCompanies}
        >
          Refresh
        </Button>
      </PageHeader>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          setPage(1);
        }}
        items={tabItems}
      />
    </>
  );
}

export default DeliveryPartnerApprovals;

