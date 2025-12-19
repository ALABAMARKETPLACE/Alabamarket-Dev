"use client";
import React, { useEffect, useState } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import Loading from "@/app/(dashboard)/_components/loading";
import DataTable from "./_components/dataTable";
import { GET } from "@/util/apicall";
import { useQuery } from "@tanstack/react-query";
import API from "@/config/API_ADMIN";
import Error from "@/app/(dashboard)/_components/error";
import OrdersFilterBar from "./_components/OrdersFilterBar";
import useOrdersFilters from "./_hooks/useOrdersFilters";
import "./Style.scss";

function Page() {
  const [isMobile, setIsMobile] = useState(false);
  const [isCompactFilters, setIsCompactFilters] = useState(false);
  const [filtersDropdownOpen, setFiltersDropdownOpen] = useState(false);
  const {
    pagination: { page, take, setPage, setTake },
    filters,
    orderQueryParams,
  } = useOrdersFilters();
  const {
    orderId: { value: searchValue, onChange: handleSearchChange },
    status: { value: statusValue, onChange: handleStatusChange },
    dateRange: { value: dateRangeValue, onChange: handleDateRangeChange },
  } = filters;

  const {
    data: orders,
    isLoading,
    isFetching,
    refetch,
    isError,
    error,
  } = useQuery({
    queryFn: ({ queryKey }) => GET(API.ORDER_GET_BYSTORE, queryKey[1] as object),
    queryKey: ["admin_orders", orderQueryParams],
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsCompactFilters(width <= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setFiltersDropdownOpen(false);
    }
  }, [isMobile]);

  const renderContent = () => {
    if (isLoading) {
      return <Loading />;
    }

    if (isError) {
      return <Error description={error?.message} />;
    }

    const ordersData = Array.isArray(orders?.data) ? orders?.data : [];

    return (
      <>
        <DataTable
          data={ordersData}
          count={orders?.meta?.itemCount}
          setPage={(nextPage: number, nextTake: number) => {
            setPage(nextPage);
            setTake(nextTake);
          }}
          pageSize={take}
          page={page}
        />
      </>
    );
  };

  return (
    <>
      <PageHeader title={"Orders"} bredcume={"Dashboard / Orders"}>
          <OrdersFilterBar
            isCompactFilters={isCompactFilters}
            filtersDropdownOpen={filtersDropdownOpen}
            onFiltersDropdownChange={setFiltersDropdownOpen}
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            statusValue={statusValue}
            onStatusChange={handleStatusChange}
            dateRangeValue={dateRangeValue}
            onDateRangeChange={handleDateRangeChange}
            onRefresh={() => refetch()}
            isRefreshing={isFetching && !isLoading}
          />
      </PageHeader>
      {renderContent()}
    </>
  );
}

export default Page;
