"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import API_ADMIN from "@/config/API_ADMIN";
import { Button, Input } from "antd";
import { IoIosAdd } from "react-icons/io";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";
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
    queryFn: ({ queryKey, signal }) => {
      const params = queryKey[1] as any;
      // Remove empty values to avoid API issues
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== "" && v !== undefined)
      );
      return GET(
        API_ADMIN.SUBSCRIPTION_PLANS.slice(0, -1),
        filteredParams,
        signal
      );
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

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
        <Error description={error?.message} />
      ) : (
        <DataTable
          data={plans?.data?.data || []}
          page={page}
          take={take}
          count={plans?.data?.pagination?.total || 0}
          setPage={setPage}
          setTake={setTake}
        />
      )}
    </div>
  );
}

export default SubscriptionPlansPage;
