"use client";
import React, { useEffect } from "react";
import { notification } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PUT, GET } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import { useRouter } from "next/navigation";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import Loading from "@/app/(dashboard)/_components/loading";
import ErrorComponent from "@/app/(dashboard)/_components/error";
import RequestForm from "../../_components/requestForm";
import { useSession } from "next-auth/react";

interface Props {
  params: {
    id: string;
  };
}

function EditBoostRequest({ params }: Props) {
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: session }: any = useSession();
  const rawStoreId =
    session?.user?.store_id ??
    session?.user?.storeId ??
    session?.store_id ??
    null;
  const sellerId =
    rawStoreId === null || rawStoreId === undefined
      ? null
      : Number.isNaN(Number(rawStoreId))
      ? null
      : Number(rawStoreId);

  // Fetch boost request details
  const {
    data: requestData,
    isLoading,
    isError,
    error,
  } = useQuery<any>({
    queryKey: ["boost-request", params.id],
    queryFn: ({ signal }) =>
      GET(API_ADMIN.BOOST_REQUESTS + params.id, {}, signal),
  });

  const mutationUpdate = useMutation({
    mutationFn: (body: any) => {
      const requestSellerId =
        requestData?.data?.seller_id ??
        requestData?.data?.seller?.id ??
        requestData?.data?.seller?.store_id ??
        null;
      const effectiveSellerId = requestSellerId ?? sellerId;

      if (!effectiveSellerId) {
        throw new Error("Seller information is not available yet.");
      }
      return PUT(API_ADMIN.BOOST_REQUESTS, {
        id: Number(params.id),
        seller_id: Number(effectiveSellerId),
        ...body,
      });
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      Notifications["success"]({
        message: `Boost Request Updated Successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["boost_requests"] });
      queryClient.invalidateQueries({ queryKey: ["boost-request", params.id] });
      setTimeout(() => {
        router.push(`/auth/boost-request/${params.id}`);
      }, 1000);
    },
  });

  // Check if request can be edited
  useEffect(() => {
    if (requestData?.data && requestData.data.status !== "pending") {
      Notifications["warning"]({
        message: "This request cannot be edited",
        description: "Only pending requests can be modified",
      });
      setTimeout(() => {
        router.push(`/auth/boost-request/${params.id}`);
      }, 2000);
    }
  }, [requestData, Notifications, router, params.id]);

  if (isLoading) return <Loading />;
  if (isError) return <ErrorComponent description={error?.message} />;

  return (
    <div>
      {contextHolder}
      <PageHeader
        title="Edit Boost Request"
        bredcume="Dashboard / Boost Requests / Edit"
      />

      <RequestForm
        mode="edit"
        initialData={requestData?.data}
        onSubmit={(payload) => mutationUpdate.mutate(payload)}
        loading={mutationUpdate.isPending}
        onCancel={() => router.push(`/auth/boost-request/${params.id}`)}
      />
    </div>
  );
}

export default EditBoostRequest;
