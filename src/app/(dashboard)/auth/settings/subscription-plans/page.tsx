"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import API_ADMIN from "@/config/API_ADMIN";
import { Button, Input } from "antd";
import { IoIosAdd } from "react-icons/io";
import Loading from "@/app/(dashboard)/_components/loading";
import ErrorComponent from "@/app/(dashboard)/_components/error";
import DataTable from "./_components/dataTable";
import { useRouter } from "next/navigation";
import useDebounceQuery from "@/shared/hook/useDebounceQuery";
import { GET } from "@/util/apicall";
import { IoSearchOutline } from "react-icons/io5";

function SubscriptionPlansPage() {
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);
  const [query, , handleChange] = useDebounceQuery("", 300);
  const router = useRouter();

  const {
    data: plans,
    isLoading,
    refetch,
    isFetching,
    isError,
    error,
  } = useQuery<any>({
    queryKey: ["subscription-plans", { page, limit: take, search: query }],
    queryFn: async ({ queryKey, signal }) => {
      const params = queryKey[1] as any;
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== "" && v !== undefined)
      );
      const res: any = await GET(API_ADMIN.SUBSCRIPTION_PLANS, filteredParams, signal);
      if (res?.status === false) {
        throw new globalThis.Error(res?.message || "Failed to fetch subscription plans");
      }
      return res;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const plansArray = (() => {
    const payload = plans?.data;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.rows)) return payload.rows;
    return [];
  })();

  const plansCount = (() => {
    const payload = plans?.data;
    const total =
      payload?.pagination?.total ??
      payload?.pagination?.totalItems ??
      payload?.pagination?.itemCount ??
      payload?.meta?.itemCount ??
      payload?.meta?.totalItems ??
      payload?.meta?.total ??
      payload?.count;
    if (typeof total === "number") return total;
    return Array.isArray(plansArray) ? plansArray.length : 0;
  })();

  return (
    <div>
      <div style={{ marginTop: -10 }} />
      <div className="dashboard-pageHeader">
        <div>Subscription Plans</div>
        <div className="dashboard-pageHeaderBox">
          <Input
            suffix={<IoSearchOutline />}
            placeholder="Search by plan name..."
            onChange={(e) => {
              handleChange(e?.target?.value);
              setPage(1);
            }}
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            icon={<IoIosAdd />}
            onClick={() =>
              router.push("/auth/settings/subscription-plans/create")
            }
          >
            Create Plan
          </Button>
          <Button
            type="primary"
            ghost
            onClick={() => refetch()}
            loading={isFetching && !isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorComponent description={error?.message} />
      ) : (
        <DataTable
          data={plansArray}
          page={page}
          take={take}
          count={plansCount}
          setPage={setPage}
          setTake={setTake}
        />
      )}
    </div>
  );
}

export default SubscriptionPlansPage;
