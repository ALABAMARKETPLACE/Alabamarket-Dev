"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import API_ADMIN from "@/config/API_ADMIN";
import { Button, Card, Tag, Descriptions, Image } from "antd";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";
import { useRouter } from "next/navigation";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { GET } from "@/util/apicall";
import { TbEdit } from "react-icons/tb";
import moment from "moment";
import "../styles.scss";

interface Props {
  params: {
    id: string;
  };
}

function ViewBoostRequest({ params }: Props) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useQuery<any>({
    queryKey: ["boost-request", params.id],
    queryFn: ({ signal }) =>
      GET(API_ADMIN.BOOST_REQUESTS + params.id, {}, signal),
  });

  const request = data?.data;
  const isPending = request?.status === "pending";

  // Helper to get plan price (total amount)
  const getPlanPrice = (plan: any) => {
    return Number(plan?.price ?? 0);
  };

  // Helper to get plan duration
  const getPlanDuration = (plan: any) => {
    return Number(plan?.duration_days ?? 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "orange";
      case "approved":
        return "green";
      case "rejected":
        return "red";
      case "expired":
        return "gray";
      default:
        return "default";
    }
  };

  if (isLoading) return <Loading />;
  if (isError) return <Error description={error?.message} />;

  return (
    <div className="boostRequests-detailPage">
      <PageHeader
        title="Boost Request Details"
        bredcume="Dashboard / Boost Requests / View"
      >
        {isPending && (
          <Button
            type="primary"
            icon={<TbEdit />}
            onClick={() => router.push(`/auth/boost-request/${params.id}/edit`)}
          >
            Edit Request
          </Button>
        )}
      </PageHeader>

      <div className="boostRequests-detailContainer">
        {/* Status Banner */}
        <Card className="boostRequests-statusCard">
          <div className="boostRequests-statusLabel">Request Status</div>
          <Tag color={getStatusColor(request?.status)} className="boostRequests-statusTag">
            {request?.status?.toUpperCase()}
          </Tag>
        </Card>

        <div className="boostRequests-detailGrid">
          {/* Seller Information */}
          <div className="boostRequests-detailGridItem">
            <Card title="Seller Information" bordered={false}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Seller Name">
                  <strong>{request?.seller?.name || "-"}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {request?.seller?.email || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {request?.seller?.phone || "-"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>

          {/* Plan Details */}
          <div className="boostRequests-detailGridItem">
            <Card title="Subscription Plan" bordered={false}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Plan Name">
                  <strong style={{ color: "#1890ff" }}>
                    {request?.plan?.name || "-"}
                  </strong>
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  <strong>{getPlanDuration(request?.plan)} days</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Price">
                  <strong style={{ color: "#a10244" }}>
                    ₦{getPlanPrice(request?.plan).toFixed(2)}
                  </strong>
                </Descriptions.Item>
                <Descriptions.Item label="Product Range">
                  {request?.plan?.min_products} - {request?.plan?.max_products}{" "}
                  products
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>

          {/* Boost Period */}
          <div className="boostRequests-detailGridItem">
            <Card title="Boost Period" bordered={false}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Start Date">
                  {request?.start_date
                    ? moment(request.start_date).format("DD MMM YYYY")
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="End Date">
                  {request?.end_date
                    ? moment(request.end_date).format("DD MMM YYYY")
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Total Days">
                  <strong>{request?.days || 0}</strong> days
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="boostRequests-detailGridItem">
            <Card title="Payment Summary" bordered={false}>
              <div className="boostRequests-paymentSummary">
                <div className="boostRequests-paymentSummaryLabel">
                  Summary:
                </div>
                <div className="boostRequests-paymentSummaryRow">
                  {request?.product_ids?.length || 0} products × ₦{getPlanPrice(request?.plan).toFixed(2)} per product
                </div>
                <div className="boostRequests-paymentSummaryRow">
                  Boost Period: {request?.days} days
                </div>
                <div className="boostRequests-paymentTotal">
                  Total: ₦{Number(request?.total_amount || 0).toFixed(2)}
                </div>
              </div>
            </Card>
          </div>

          {/* Products to Boost */}
          <div className="boostRequests-detailGridItem boostRequests-detailGridItem--full">
            <Card
              title={`Products to Boost (${request?.products?.length || 0})`}
              bordered={false}
            >
              {request?.products && request.products.length > 0 ? (
                <div className="boostRequests-productsGrid">
                  {request.products.map((product: any, index: number) => (
                    <Card
                      hoverable
                      size="small"
                      key={`${product?.name}-${index}`}
                      className="boostRequests-productCard"
                      cover={
                        <Image
                          alt={product.name}
                          src={product.image}
                          height={150}
                          style={{ objectFit: "cover" }}
                          fallback="https://via.placeholder.com/150"
                        />
                      }
                    >
                      <Card.Meta
                        title={
                          <div className="boostRequests-productTitle">
                            {product.name}
                          </div>
                        }
                        description={
                          <div className="boostRequests-productPrice">
                            ₦{Number(product.price || 0).toFixed(2)}
                          </div>
                        }
                      />
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="boostRequests-productsEmpty">
                  No products found
                </div>
              )}
            </Card>
          </div>

          {/* Request Timestamps */}
          <div className="boostRequests-detailGridItem">
            <Card title="Request Timeline" bordered={false}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Requested At">
                  {request?.requested_at
                    ? moment(request.requested_at).format(
                        "DD MMM YYYY, hh:mm A"
                      )
                    : "-"}
                </Descriptions.Item>
                {request?.approved_at && (
                  <Descriptions.Item label="Approved At">
                    {moment(request.approved_at).format("DD MMM YYYY, hh:mm A")}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Created At">
                  {request?.createdAt
                    ? moment(request.createdAt).format("DD MMM YYYY, hh:mm A")
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated">
                  {request?.updatedAt
                    ? moment(request.updatedAt).format("DD MMM YYYY, hh:mm A")
                    : "-"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>

          {/* Remarks */}
          {request?.remarks && (
            <div className="boostRequests-detailGridItem">
              <Card title="Remarks" bordered={false}>
                <div className="boostRequests-remarks">{request.remarks}</div>
              </Card>
            </div>
          )}
        </div>

        <div className="boostRequests-backAction">
          <Button
            onClick={() => router.push("/auth/boost-request")}
            size="large"
          >
            Back to List
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ViewBoostRequest;
