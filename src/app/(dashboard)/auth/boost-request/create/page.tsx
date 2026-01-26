"use client";
import { useCallback, useEffect, useState } from "react";
import { notification } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { POST } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import RequestForm from "../_components/requestForm";
import { usePaystack } from "@/hooks/usePaystack";
import { useSession } from "next-auth/react";
import Loading from "@/app/(dashboard)/_components/loading";
import type { PaystackInitializeResponse } from "@/types/paystack.types";

function CreateBoostRequest() {
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { initializePayment } = usePaystack();
  const [isVerifying, setIsVerifying] = useState(false);

  const rawStoreId =
    (session as { user?: { store_id?: unknown; storeId?: unknown } } | null)
      ?.user?.store_id ??
    (session as { user?: { store_id?: unknown; storeId?: unknown } } | null)
      ?.user?.storeId ??
    null;
  const sellerId =
    rawStoreId === null || rawStoreId === undefined
      ? null
      : Number.isNaN(Number(rawStoreId))
        ? null
        : Number(rawStoreId);

  const verifyAndCreate = useCallback(
    async (reference: string) => {
      setIsVerifying(true);
      try {
        const storedData = sessionStorage.getItem("boost_request_data");
        if (!storedData) {
          throw new Error("No boost request data found. Please try again.");
        }
        const body = JSON.parse(storedData);

        const response = await POST(API_ADMIN.BOOST_REQUESTS, {
          seller_id: sellerId || body.seller_id,
          payment_reference: reference,
          payment_status: "success",
        });

        if (!response.status) {
          throw new Error(response.message || "Failed to create boost request");
        }

        Notifications["success"]({
          message: "Boost Request Created Successfully!",
        });
        sessionStorage.removeItem("boost_request_data");
        queryClient.invalidateQueries({ queryKey: ["boost_requests"] });

        setTimeout(() => {
          router.push("/auth/boost-request");
        }, 1000);
      } catch (error: unknown) {
        Notifications["error"]({
          message:
            (error instanceof Error && error.message) || "Verification failed",
        });
        setIsVerifying(false);
      }
    },
    [sellerId, Notifications, queryClient, router],
  );

  useEffect(() => {
    const reference = searchParams.get("reference");
    const trxref = searchParams.get("trxref");
    const paymentRef = reference || trxref;

    if (paymentRef && !isVerifying) {
      verifyAndCreate(paymentRef);
    } else {
      sessionStorage.removeItem("boost_request_data");
    }
  }, [searchParams, isVerifying, verifyAndCreate]);

  const mutationPay = useMutation({
    mutationFn: async (body: { amount: number; [key: string]: unknown }) => {
      if (!sellerId) {
        throw new Error("Seller information is not available yet.");
      }

      sessionStorage.setItem(
        "boost_request_data",
        JSON.stringify({ ...body, seller_id: sellerId }),
      );

      const paymentResult = await initializePayment({
        email: session?.user?.email || "seller@alabamarketplace.ng",
        amount: body.amount * 100,
        callback_url: window.location.href,
        metadata: {
          custom_fields: [
            {
              display_name: "Payment for",
              variable_name: "payment_for",
              value: "boost_request",
            },
          ],
        },
      });

      return paymentResult;
    },
    onError: (error: unknown) => {
      Notifications["error"]({
        message: (error instanceof Error && error.message) || "Payment failed",
      });
    },
    onSuccess: (data: PaystackInitializeResponse) => {
      const rawUrl =
        data?.data?.data?.authorization_url ||
        (data as unknown as { data?: { authorization_url?: string } })?.data
          ?.authorization_url ||
        (data as unknown as { authorization_url?: string })
          ?.authorization_url ||
        null;
      const authUrl =
        typeof rawUrl === "string"
          ? rawUrl.trim().replace(/^["'`]+|["'`]+$/g, "")
          : null;
      if (authUrl) {
        window.location.href = authUrl;
      }
    },
  });

  if (isVerifying) {
    return (
      <div>
        {contextHolder}
        <Loading />
        <div style={{ textAlign: "center", marginTop: 20 }}>
          Verifying Payment and Creating Request...
        </div>
      </div>
    );
  }

  return (
    <div>
      {contextHolder}
      <PageHeader
        title="Create Boost Request"
        bredcume="Dashboard / Boost Requests / Create"
      />

      <RequestForm
        mode="create"
        onSubmit={(payload) => mutationPay.mutate(payload)}
        loading={mutationPay.isPending}
        onCancel={() => router.push("/auth/boost-request")}
      />
    </div>
  );
}

export default CreateBoostRequest;
