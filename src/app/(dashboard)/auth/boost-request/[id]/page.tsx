"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import API_ADMIN from "@/config/API_ADMIN";
import API from "@/config/API";
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
    enabled: !!params.id && params.id !== "undefined" && params.id !== "null",
  });

  // Fetch all subscription plans to hydrate missing details
  const { data: plansData } = useQuery({
    queryKey: ["subscription-plans-all"],
    queryFn: ({ signal }) => GET(API.SUBSCRIPTION_PLANS_ACTIVE, {}, signal),
    staleTime: 30000,
  });

  // Fetch seller's products to hydrate missing details
  const { data: productsData } = useQuery({
    queryKey: ["seller-products"],
    queryFn: ({ signal }) =>
      GET(API_ADMIN.FEATURED_PRODUCTS_PRODUCTS, {}, signal),
  });

  const request = data?.data;
  const isPending = request?.status === "pending";

  // Helper to extract plans array
  const getPlansArray = (data: any) => {
    if (Array.isArray(data?.data?.data)) return data.data.data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const getProductsArray = (data: any) => {
    if (Array.isArray(data?.data?.data)) return data.data.data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  // Compute Plan Details
  const computedPlan = React.useMemo(() => {
    if (request?.plan && Object.keys(request.plan).length > 0) return request.plan;
    
    const plansList = getPlansArray(plansData);
    if (request?.plan_id && plansList.length > 0) {
      return plansList.find((p: any) => (p.id ?? p._id) == request.plan_id) || {};
    }
    return {};
  }, [request, plansData]);

  // Compute Products Details
  const computedProducts = React.useMemo(() => {
    // If request has populated products with names, use them
    if (
      request?.products && 
      Array.isArray(request.products) && 
      request.products.length > 0 && 
      typeof request.products[0] === 'object' &&
      request.products[0].name
    ) {
      return request.products;
    }

    // Otherwise try to find them in the products list using product_ids
    const productsList = getProductsArray(productsData);
    if (request?.product_ids && productsList.length > 0) {
      return productsList.filter((p: any) => 
        request.product_ids.includes(p._id) || request.product_ids.includes(p.id)
      );
    }

    return [];
  }, [request, productsData]);

  // Helper to get plan price (total amount)
  const getPlanPrice = (plan: any) => {
    const price = Number(plan?.price || plan?.price_per_day);
    return isNaN(price) ? 0 : price;
  };

  // Helper to get plan duration
  const getPlanDuration = (plan: any) => {
    const days = Number(plan?.duration_days || plan?.duration);
    return isNaN(days) ? 0 : days;
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
                    {computedPlan?.name || "-"}
                  </strong>
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  <strong>{getPlanDuration(computedPlan)} days</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Price">
                  <strong style={{ color: "#a10244" }}>
                    ₦{getPlanPrice(computedPlan).toFixed(2)}
                  </strong>
                </Descriptions.Item>
                <Descriptions.Item label="Product Range">
                  {computedPlan?.min_products} - {computedPlan?.max_products}{" "}
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
                  <strong>{request?.days || getPlanDuration(computedPlan)}</strong> days
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
                  {request?.product_ids?.length || 0} products × ₦{getPlanPrice(computedPlan).toFixed(2)} per product
                </div>
                <div className="boostRequests-paymentSummaryRow">
                  Boost Period: {request?.days || getPlanDuration(computedPlan)} days
                </div>
                <div className="boostRequests-paymentTotal">
                  Total: ₦{Number(request?.total_amount || (getPlanPrice(computedPlan))).toFixed(2)}
                </div>
              </div>
            </Card>
          </div>

          {/* Products to Boost */}
          <div className="boostRequests-detailGridItem boostRequests-detailGridItem--full">
            <Card
              title={`Products to Boost (${computedProducts.length || request?.product_ids?.length || 0})`}
              bordered={false}
            >
              {computedProducts.length > 0 ? (
                <div className="boostRequests-productsGrid">
                  {computedProducts.map((product: any, index: number) => (
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
