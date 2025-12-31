"use client";
import React, { useMemo, useState } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { Button, Card, Descriptions, notification } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GET, POST } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import { useParams } from "next/navigation";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";
import moment from "moment";
import RequestDocument from "../../corporate/_components/request_modal";
import ApproveModal from "../../corporate/_components/approve_modal";

function IndividualSeller() {
  const params = useParams();
  const [openRequest, setOpenRequest] = useState(false);
  const [openApprove, setOpenApprove] = useState(false);
  const queryClient = useQueryClient();
  const approveSubaccountMutation = useMutation({
    mutationFn: (data: any) => POST(API.PAYSTACK_SUBACCOUNT_APPROVE, data),
    onSuccess: () => {
      notification.success({ message: "Subaccount approved successfully" });
      queryClient.invalidateQueries({
        queryKey: ["admin_individual_store_details"],
      });
    },
    onError: (err: any) => {
      notification.error({
        message: err?.message || "Failed to approve subaccount",
      });
    },
  });
  const {
    data: seller,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryFn: ({ signal }) =>
      GET(API.INDIVIDUAL_SELLER_DETAILS + params?.id, {}, signal),
    queryKey: ["admin_individual_seller_details", params?.id],
    select: (data: any) => (data?.status ? data?.data : null),
  });

  // Fetch full store details (same endpoint used by corporate page) for actionable modals
  const {
    data: storeDetails,
    isLoading: isStoreLoading,
    isError: isStoreError,
  } = useQuery({
    queryFn: ({ signal }) => GET(API.STORE_INFO_ADMIN + params?.id, {}, signal),
    queryKey: ["admin_individual_store_details", params?.id],
    select: (data: any) => (data?.status ? data?.data : null),
  });

  // Fetch subscription plan details for individual request (using store details)
  const { data: planDetails } = useQuery({
    enabled: !!storeDetails?.subscription_plan_id,
    queryKey: ["subscription-plan", storeDetails?.subscription_plan_id],
    queryFn: ({ signal }) =>
      GET(
        API.SUBSCRIPTION_PLANS + String(storeDetails?.subscription_plan_id),
        {},
        signal
      ),
    select: (res: any) => (res?.status ? res?.data : null),
  });

  const sellerItems = useMemo(() => {
    if (!seller || typeof seller !== "object") return [] as any[];
    const fields = [
      "name",
      "email",
      "phone",
      "visa_status",
      "age",
      "gender",
      "createdAt",
    ];
    return fields
      .filter((key) => key in seller)
      .map((item: string, index: number) => ({
        key: index,
        label: item,
        children:
          item === "createdAt"
            ? moment(seller?.createdAt).format("DD/MM/YYYY")
            : seller?.[item],
      }));
  }, [seller]);

  const paymentDetails = {
    "Bank Name": storeDetails?.bank_name,
    "Account Number": storeDetails?.account_number,
    "Account Name": storeDetails?.account_name,
    "Subaccount Code": storeDetails?.paystack_subaccount_code || "Not Created",
    "Subaccount Status": storeDetails?.subaccount_status || "Pending",
  };

  return (
    <>
      <PageHeader
        title={"Seller Request Individual"}
        bredcume={"Dashboard / Seller Requests / Individual"}
      >
        <Button
          type="primary"
          ghost
          disabled={!storeDetails || isStoreLoading || isStoreError}
          onClick={() => setOpenRequest(true)}
        >
          Request Document
        </Button>
        <Button
          type="primary"
          disabled={!storeDetails || isStoreLoading || isStoreError}
          onClick={() => setOpenApprove(true)}
        >
          Approve/Reject
        </Button>
      </PageHeader>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={error.message} />
      ) : (
        <>
          <Card>
            <Descriptions
              title="Seller Details"
              layout="horizontal"
              size="middle"
              items={sellerItems}
              labelStyle={{
                color: "black",
                textTransform: "capitalize",
                fontWeight: 600,
              }}
            />
          </Card>
          {storeDetails && (
            <div className="row py-3 gy-3">
              <div className="col-md-6">
                <Card
                  title={"Subscription Plan"}
                  bordered={false}
                  className="h-100"
                >
                  <div className="d-flex justify-content-between pb-2">
                    <span className="fw-bold">Subscription Plan:</span>
                    <span style={{ fontWeight: 600, color: "#1890ff" }}>
                      {storeDetails?.subscription_plan_name ||
                        planDetails?.name ||
                        storeDetails?.subscription_plan ||
                        "Standard Seller"}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between pb-2">
                    <span className="fw-bold">Daily Price:</span>
                    <span>
                      {planDetails?.price_per_day !== undefined
                        ? `₦${Number(
                            planDetails?.price_per_day
                          ).toLocaleString()} / day`
                        : storeDetails?.subscription_price !== undefined
                        ? `₦${Number(
                            storeDetails?.subscription_price
                          ).toLocaleString()} / day`
                        : "Free"}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between pb-2">
                    <span className="fw-bold">Products:</span>
                    <span>
                      {planDetails?.max_products
                        ? `You can boost ${planDetails?.max_products} products in this plan.`
                        : storeDetails?.subscription_boosts === -1
                        ? "Unlimited product boosts"
                        : storeDetails?.subscription_boosts > 0
                        ? `You can boost ${storeDetails?.subscription_boosts} products per month`
                        : "No product boosts"}
                    </span>
                  </div>
                </Card>
              </div>
              <div className="col-md-6">
                <Card title="Bank Details" bordered={false} className="h-100">
                  {Object.keys(paymentDetails).map((key) => (
                    <div
                      className="d-flex justify-content-between pb-2"
                      key={key}
                    >
                      <span className="fw-bold">{key}:</span>
                      <span>
                        {paymentDetails[key as keyof typeof paymentDetails]}
                      </span>
                    </div>
                  ))}
                  {paymentDetails["Subaccount Code"] !== "Not Created" &&
                    paymentDetails["Subaccount Status"] !== "active" && (
                      <div className="mt-3 text-end">
                        <Button
                          type="primary"
                          loading={approveSubaccountMutation.isPending}
                          onClick={() =>
                            approveSubaccountMutation.mutate({
                              store_id: params?.id,
                            })
                          }
                        >
                          Approve Subaccount
                        </Button>
                      </div>
                    )}
                </Card>
              </div>
            </div>
          )}
        </>
      )}
      {storeDetails && (
        <>
          <RequestDocument
            open={openRequest}
            close={() => setOpenRequest(false)}
            data={storeDetails}
            requestEndpoint={API.INDIVIDUAL_STORE_REQUEST_DOCUMENT}
          />
          <ApproveModal
            open={openApprove}
            close={() => setOpenApprove(false)}
            data={storeDetails}
            statusEndpoint={API.INDIVIDUAL_STORE_UPDATE_STATUS}
            invalidateKeys={["admin_seller_request_individual"]}
          />
        </>
      )}
    </>
  );
}

export default IndividualSeller;
