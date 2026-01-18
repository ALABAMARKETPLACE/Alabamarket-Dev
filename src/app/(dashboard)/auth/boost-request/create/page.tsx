"use client";
import React from "react";
import { notification } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { POST } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import RequestForm from "../_components/requestForm";
import { usePaystack } from "@/hooks/usePaystack";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import Loading from "@/app/(dashboard)/_components/loading";

function CreateBoostRequest() {
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session }: any = useSession();
  const { initializePayment } = usePaystack();
  const [isVerifying, setIsVerifying] = useState(false);
  const verificationAttempted = useRef(false);

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

  // Handle Payment Verification and Creation
  useEffect(() => {
    const reference = searchParams.get("reference");
    const trxref = searchParams.get("trxref");
    const paymentRef = reference || trxref;

    if (paymentRef && !isVerifying && !verificationAttempted.current) {
      verificationAttempted.current = true;
      verifyAndCreate(paymentRef);
    } else if (!paymentRef) {
      // Clear storage if no reference (new session)
      sessionStorage.removeItem("boost_request_data");
    }
  }, [searchParams]);

  const verifyAndCreate = async (reference: string) => {
    setIsVerifying(true);
    try {
      const storedData = sessionStorage.getItem("boost_request_data");
      if (!storedData) {
        throw new Error("No boost request data found. Please try again.");
      }
      const body = JSON.parse(storedData);

      // Create Boost Request after payment
      const response = await POST(API_ADMIN.BOOST_REQUESTS, {
        ...body,
        seller_id: sellerId || body.seller_id, // Use stored seller_id as fallback
        payment_reference: reference,
        payment_status: "success",
        status: "approved", // Attempt to auto-approve
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
    } catch (error: any) {
      Notifications["error"]({
        message: error.message || "Verification failed",
      });
      setIsVerifying(false);
    }
  };

  const mutationPay = useMutation({
    mutationFn: async (body: any) => {
      if (!sellerId) {
        throw new Error("Seller information is not available yet.");
      }

      // 1. Store data in session storage
      sessionStorage.setItem(
        "boost_request_data",
        JSON.stringify({ ...body, seller_id: sellerId })
      );

      // 2. Initialize Paystack Payment
      const paymentResult = await initializePayment({
        email: session?.user?.email || "seller@alabamarketplace.ng",
        amount: body.amount * 100, // Convert to kobo
        callback_url: window.location.href, // Redirect back to this page
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
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data: any, variables, context) => {
      if (data?.data?.data?.authorization_url) {
        window.location.href = data.data.data.authorization_url;
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
