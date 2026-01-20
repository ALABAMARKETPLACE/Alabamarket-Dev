"use client";
import React, { useEffect, useState } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { Button } from "antd";
import Loading from "@/app/(dashboard)/_components/loading";
import DataTable from "./_components/dataTable";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import useDebounceQuery from "@/shared/hook/useDebounceQuery";
import Error from "@/app/(dashboard)/_components/error";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import BoostRequestFilterBar from "./_components/BoostRequestFilterBar";
import "./styles.scss";
import { BoostRequest as BoostRequestType } from "./_components/dataTable";

interface SessionUser {
  store_id?: string | number | null;
  storeId?: string | number | null;
  [key: string]: unknown;
}

interface Session {
  user?: SessionUser;
  store_id?: string | number | null;
  [key: string]: unknown;
}

interface BoostRequestsResponse {
  data: {
    data: BoostRequestType[];
    pagination: {
      total: number;
    };
  };
}

function BoostRequest() {
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);
  const [query, searchValue, handleChange] = useDebounceQuery("", 300);
  const [status, setStatus] = useState("all");
  const [isCompactFilters, setIsCompactFilters] = useState(false);
  const [filtersDropdownOpen, setFiltersDropdownOpen] = useState(false);
  const router = useRouter();
  const { data: sessionData } = useSession();
  const session = sessionData as Session | null;
  const rawStoreId =
    session?.user?.store_id ??
    session?.user?.storeId ??
    session?.store_id ??
    null;
  const sellerId = (() => {
    if (rawStoreId === null || rawStoreId === undefined) return null;
    const numeric = Number(rawStoreId);
    return Number.isNaN(numeric) ? null : numeric;
  })();

  const {
    data: boostRequests,
    isLoading,
    isFetching,
    refetch,
    isError,
    error,
  } = useQuery({
    queryFn: ({ queryKey, signal }) =>
      GET(
        API_ADMIN.BOOST_REQUESTS,
        queryKey[1] as Record<string, unknown>,
        signal,
      ),
    queryKey: [
      "boost_requests",
      { page, limit: take, search: query, status, seller_id: sellerId },
    ],
    enabled: !!sellerId, // Only run query when sellerId is available
  });

  const responseData = boostRequests as BoostRequestsResponse | undefined;

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "expired", label: "Expired" },
  ];

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width <= 768;
      setIsCompactFilters(width <= 1024);
      if (!mobile) {
        setFiltersDropdownOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className="boostRequests-pageHeaderWrap">
        <PageHeader
          title={"Boost Requests"}
          bredcume={"Dashboard / Boost Requests"}
        >
          <div className="boostRequests-headerActions">
            <div className="boostRequests-headerFilters">
              <BoostRequestFilterBar
                isCompactFilters={isCompactFilters}
                filtersDropdownOpen={filtersDropdownOpen}
                onFiltersDropdownChange={setFiltersDropdownOpen}
                searchValue={searchValue}
                onSearchChange={(value) => {
                  handleChange(value);
                  setPage(1);
                }}
                statusValue={status}
                onStatusChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
                statusOptions={statusOptions}
                onRefresh={() => refetch()}
                isRefreshing={isFetching && !isLoading}
              />
            </div>
            <div className="boostRequests-headerPrimary">
              <Button
                type="primary"
                size="large"
                onClick={() => router.push("/auth/boost-request/create")}
              >
                New Request +
              </Button>
            </div>
          </div>
        </PageHeader>
      </div>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={error?.message} />
      ) : (
        <DataTable
          data={
            Array.isArray(responseData?.data?.data)
              ? responseData?.data?.data
              : []
          }
          count={responseData?.data?.pagination?.total ?? 0}
          setPage={setPage}
          setTake={setTake}
          pageSize={take}
          page={page}
        />
      )}
    </>
  );
}

export default BoostRequest;
