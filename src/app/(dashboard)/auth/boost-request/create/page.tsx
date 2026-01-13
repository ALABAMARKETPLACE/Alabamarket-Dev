"use client";
import React from "react";
import { notification } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { POST } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import { useRouter } from "next/navigation";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import RequestForm from "../_components/requestForm";
import { usePaystack } from "@/hooks/usePaystack";
import { useSession } from "next-auth/react";

function CreateBoostRequest() {
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: session }: any = useSession();
  const { initializePayment } = usePaystack();

  const rawStoreId =
    session?.user?.store_id ?? session?.user?.storeId ?? session?.store_id ?? null;
  const sellerId =
    rawStoreId === null || rawStoreId === undefined
      ? null
      : Number.isNaN(Number(rawStoreId))
      ? null
      : Number(rawStoreId);

  const mutationCreate = useMutation({
    mutationFn: async (body: any) => {
      if (!sellerId) {
        throw new Error("Seller information is not available yet.");
      }

      // 1. Create Boost Request (Pending Payment)
      const response = await POST(API_ADMIN.BOOST_REQUESTS, {
        ...body,
        seller_id: sellerId,
      });

      if (!response.status) {
        throw new Error(response.message || "Failed to create boost request");
      }

      const boostRequest = response.data;
      const boostRequestId = boostRequest.id || boostRequest._id;

      // 2. Initialize Paystack Payment
      const paymentResult = await initializePayment({
        email: session?.user?.email || "seller@alabamarketplace.ng",
        amount: body.amount * 100, // Convert to kobo
        callback_url: `${window.location.origin}/auth/boost-request`,
        metadata: {
          custom_fields: [
            {
              display_name: "Payment for",
              variable_name: "payment_for",
              value: "boost_request",
            },
            {
              display_name: "Boost Request ID",
              variable_name: "boost_request_id",
              value: boostRequestId,
            },
          ],
        },
      });

      return paymentResult;
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data: any, variables, context) => {
      Notifications["success"]({
        message: `Boost Request Created. Redirecting to payment...`,
      });

      if (data?.data?.data?.authorization_url) {
        window.location.href = data.data.data.authorization_url;
      }
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
