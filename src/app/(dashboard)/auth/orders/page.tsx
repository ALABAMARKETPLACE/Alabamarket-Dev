"use client";
import React, { useEffect, useState } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import Loading from "@/app/(dashboard)/_components/loading";
import DataTable from "./_components/dataTable";
import { GET } from "@/util/apicall";
import { useQuery } from "@tanstack/react-query";
import API from "@/config/API";
import Error from "@/app/(dashboard)/_components/error";
import OrdersFilterBar from "./_components/OrdersFilterBar";
import useOrdersFilters from "./_hooks/useOrdersFilters";
import "./Style.scss";
import { useSession } from "next-auth/react";
import { useAppSelector } from "@/redux/hooks";
import { reduxAccessToken } from "@/redux/slice/authSlice";

function Page() {
  const [isMobile, setIsMobile] = useState(false);
  const [isCompactFilters, setIsCompactFilters] = useState(false);
  const [filtersDropdownOpen, setFiltersDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  const accessToken = useAppSelector(reduxAccessToken);
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

  const storeId =
    (session as any)?.user?.store_id ??
    (session as any)?.user?.storeId ??
    (session as any)?.store_id ??
    null;
  const userRole = (session as any)?.role;
  const userType = (session as any)?.user?.type || (session as any)?.type;
  const isSeller = userRole === "seller" || userType === "seller";

  const { data: storeInfo, isLoading: isStoreLoading } = useQuery({
    queryFn: () =>
      GET(API.CORPORATE_STORE_GETSELLERINFO, {}, null, {
        token: (session as any)?.token,
      }),
    queryKey: ["seller_store_details"],
    enabled:
      status === "authenticated" && isSeller && !!(session as any)?.token,
    retry: false,
  });

  const resolvedStoreId =
    (storeInfo as any)?.data?._id ?? (storeInfo as any)?.data?.id ?? storeId;

  const endpoint =
    isSeller && resolvedStoreId
      ? API.ORDER_GETONE_SELLER + resolvedStoreId
      : API.ORDER_GET;
  const params =
    isSeller && resolvedStoreId
      ? { ...orderQueryParams, order: "DESC" }
      : { ...orderQueryParams };

  const {
    data: orders,
    isLoading: isOrdersLoading,
    isFetching,
    refetch,
    isError,
    error,
  } = useQuery({
    queryFn: ({ queryKey }) =>
      GET(queryKey[0] as string, queryKey[1] as object, null, {
        token: (session as any)?.token,
      }),
    queryKey: [endpoint, params],
    enabled:
      status === "authenticated" &&
      !!(session as any)?.token &&
      (isSeller ? !!resolvedStoreId : true),
    retry: false,
  });

  const isLoading = isOrdersLoading || (isSeller && isStoreLoading);

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
