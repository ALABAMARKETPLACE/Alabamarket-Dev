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
import { Order } from "./_components/dataTable";

interface SessionUser {
  store_id?: string;
  storeId?: string;
  role?: string;
  type?: string;
  [key: string]: unknown;
}

interface CustomSession {
  user?: SessionUser;
  store_id?: string;
  role?: string;
  type?: string;
  token?: string;
  [key: string]: unknown;
}

interface StoreResponse {
  data?: {
    _id?: string;
    id?: string;
    [key: string]: unknown;
  };
}

interface OrdersResponse {
  data: Order[];
  meta: {
    itemCount: number;
  };
}

function Page() {
  const [isMobile, setIsMobile] = useState(false);
  const [isCompactFilters, setIsCompactFilters] = useState(false);
  const [filtersDropdownOpen, setFiltersDropdownOpen] = useState(false);
  const { data: sessionData, status } = useSession();
  const session = sessionData as CustomSession | null;

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
    session?.user?.store_id ??
    session?.user?.storeId ??
    session?.store_id ??
    null;
  const userRole = session?.role;
  const userType = session?.user?.type || session?.type;
  const isSeller = userRole === "seller" || userType === "seller";

  const { data: storeInfo, isLoading: isStoreLoading } = useQuery({
    queryFn: () =>
      GET(API.CORPORATE_STORE_GETSELLERINFO, {}, null, {
        token: session?.token,
      }),
    queryKey: ["seller_store_details"],
    enabled: status === "authenticated" && isSeller && !!session?.token,
    retry: false,
  });

  const resolvedStoreId =
    (storeInfo as StoreResponse)?.data?._id ??
    (storeInfo as StoreResponse)?.data?.id ??
    storeId;

  const endpoint =
    isSeller && resolvedStoreId
      ? API.ORDER_GET_BYSTORE.replace(/\/$/, "") // Removes trailing slash if present
      : API.ORDER_GET;
  const params =
    isSeller && resolvedStoreId
      ? { ...orderQueryParams, order: "DESC" }
      : { ...orderQueryParams };

  const {
    data: ordersDataRaw,
    isLoading: isOrdersLoading,
    isFetching,
    refetch,
    isError,
    error,
  } = useQuery({
    queryFn: ({ queryKey }) =>
      GET(queryKey[0] as string, queryKey[1] as Record<string, unknown>, null, {
        token: session?.token,
      }),
    queryKey: [endpoint, params],
    enabled:
      status === "authenticated" &&
      !!session?.token &&
      (isSeller ? !!resolvedStoreId : true),
    retry: false,
  });

  const orders = ordersDataRaw as OrdersResponse;
  const isLoading = isOrdersLoading || (isSeller && isStoreLoading);

  // Log outgoing request whenever endpoint or params change
  useEffect(() => {
    console.log("[Orders] GET", endpoint, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, JSON.stringify(params)]);

  // Log raw backend response whenever it arrives
  useEffect(() => {
    if (ordersDataRaw !== undefined) {
      console.log("[Orders] Raw response ←", ordersDataRaw);
    }
  }, [ordersDataRaw]);

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
      // eslint-disable-next-line o
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

    let ordersData = Array.isArray(orders?.data) ? orders?.data : [];

    // Group sub-orders from the same checkout by parent_order_id.
    // The backend returns one row per store sub-order; all sub-orders from
    // the same checkout share the same parent_order_id (the Paystack / checkout ref).
    // Sub-orders without parent_order_id are treated as standalone rows.
    const groupMap = new Map<string, Order>();
    for (const order of ordersData) {
      const groupKey =
        String(order.parent_order_id ?? "").trim() ||
        `solo::${order.order_id ?? order.id ?? order._id ?? Math.random()}`;

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, { ...order });
      } else {
        const base = groupMap.get(groupKey)!;
        base.grandTotal = (Number(base.grandTotal) || 0) + (Number(order.grandTotal) || 0);
        base.deliveryCharge = (Number(base.deliveryCharge) || 0) + (Number(order.deliveryCharge) || 0);
        base.totalItems = (Number(base.totalItems) || 0) + (Number(order.totalItems) || 0);
        base.is_multi_seller = true;
      }
    }
    ordersData = Array.from(groupMap.values());
    console.log("[Orders] Grouped result →", { count: ordersData.length, meta: orders?.meta, rows: ordersData });

    return (
      <>
        <DataTable
          data={ordersData}
          count={orders?.meta?.itemCount ?? ordersData.length}
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
