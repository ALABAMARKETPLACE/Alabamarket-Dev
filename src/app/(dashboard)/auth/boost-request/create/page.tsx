"use client";
import React from "react";
import { notification } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { POST } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import { useRouter } from "next/navigation";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import RequestForm from "../_components/requestForm";
import { useSession } from "next-auth/react";

function CreateBoostRequest() {
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: session }: any = useSession();
  const rawStoreId =
    session?.user?.store_id ?? session?.user?.storeId ?? session?.store_id ?? null;
  const sellerId =
    rawStoreId === null || rawStoreId === undefined
      ? null
      : Number.isNaN(Number(rawStoreId))
      ? null
      : Number(rawStoreId);

  const mutationCreate = useMutation({
    mutationFn: (body: any) => {
      if (!sellerId) {
        throw new Error("Seller information is not available yet.");
      }
      return POST(API_ADMIN.BOOST_REQUESTS, { ...body, seller_id: sellerId });
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      Notifications["success"]({
        message: `Boost Request Created Successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["boost_requests"] });
      setTimeout(() => {
        router.push("/auth/boost-request");
      }, 1000);
    },
  });

  return (
    <div>
      {contextHolder}
      <PageHeader
        title="Create Boost Request"
        bredcume="Dashboard / Boost Requests / Create"
      />

      <RequestForm
        mode="create"
        onSubmit={(payload) => mutationCreate.mutate(payload)}
        loading={mutationCreate.isPending}
        onCancel={() => router.push("/auth/boost-request")}
      />
    </div>
  );
}

export default CreateBoostRequest;
