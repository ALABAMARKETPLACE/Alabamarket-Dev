"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Descriptions } from "antd";
import { useParams, useRouter } from "next/navigation";
import API_ADMIN from "@/config/API_ADMIN";
import { GET } from "@/util/apicall";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";

function ViewNewDistanceCharge() {
  const params = useParams();
  const router = useRouter();

  const { data, isLoading, isError, error } = useQuery<any>({
    queryKey: [API_ADMIN.NEW_DISTANCE_CHARGE + params.id],
    queryFn: () => GET(API_ADMIN.NEW_DISTANCE_CHARGE + params.id),
    select: (res) => (res?.status ? res?.data : null),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <PageHeader
        title="View Distance Charge"
        bredcume="Settings / New Distance Charge / View"
      >
        <Button onClick={() => router.push("/auth/settings?tab=6")}>
          Back
        </Button>
        <Button
          type="primary"
          onClick={() =>
            router.push(`/auth/settings/new-distance-charge/${params.id}/edit`)
          }
        >
          Edit
        </Button>
      </PageHeader>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={error?.message} />
      ) : (
        <div style={{ backgroundColor: "white", padding: 24, marginTop: 16 }}>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID">{data?.id}</Descriptions.Item>
            <Descriptions.Item label="Country">
              {data?.countryDetails?.country_name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="State">
              {data?.stateDetails?.name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Min Weight">
              {data?.min_weight} kg
            </Descriptions.Item>
            <Descriptions.Item label="Max Weight">
              {data?.max_weight} kg
            </Descriptions.Item>
            <Descriptions.Item label="Delivery Charge">
              ${data?.delivery_charge?.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {new Date(data?.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {new Date(data?.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </>
  );
}

export default ViewNewDistanceCharge;
