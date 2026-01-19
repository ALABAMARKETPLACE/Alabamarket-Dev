"use client";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { useParams } from "next/navigation";
import AddressTab from "../_components/addressTab";
import ProductTab from "../_components/productsTab";
import PaymentStatusTab from "../_components/paymentStatusTab";
import OrderStatusTab from "../_components/orderStatusTab";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import { Col, Container, Row } from "react-bootstrap";
import Loading from "@/app/(dashboard)/_components/loading";
import { Button, Tag } from "antd";
import { getOrderStatus } from "../_components/getOrderStatus";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { reduxAccessToken } from "@/redux/slice/authSlice";

import API from "@/config/API";

export default function OrderDetails() {
  const { orderId } = useParams();
  const route = useRouter();
  const accessToken = useAppSelector(reduxAccessToken);

  const { data: order, isLoading } = useQuery({
    queryFn: async () => await GET(API_ADMIN.ORDER_DETAILS + orderId),
    queryKey: ["order_details", orderId],
    staleTime: 0,
  });

  const { data: storeOrderData } = useQuery({
    queryFn: async () => {
      // Use the storeId from the fetched order details
      const storeId = order?.data?.storeId;
      if (!storeId) return null;

      // Fetch orders for this store, filtering by the current orderId
      return await GET(API.ORDER_GET_BYSTORE + storeId, { orderId });
    },
    queryKey: ["store_order_lookup", orderId, order?.data?.storeId],
    enabled: !!order?.data?.storeId && !!orderId,
  });

  const specificStoreOrder = Array.isArray(storeOrderData?.data)
    ? storeOrderData?.data.find(
        (o: any) => o.id == orderId || o.order_id == orderId,
      )
    : null;
  const formatDateRelative = (date: string) => {
    const givenDate = moment(date);
    const diffInHours = moment().diff(givenDate, "hours");

    if (diffInHours < 24) {
      return `${diffInHours} hrs ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };
  const getOrderStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      "": "#dfdddd",
      pending: "orange",
      cancelled: "red",
      shipped: "dodgerblue",
      out_for_delivery: "gold",
      packed: "blueviolet",
      delivered: "green",
      rejected: "crimson",
      processing: "skyblue",
      failed: "firebrick",
      substitution: "hotpink",
    };

    return statusColors[status] || "#dfdddd";
  };
  return (
    <div>
      <PageHeader
        title={"Order Details"}
        bredcume={"Dashboard / Orders / Details"}
      >
        {!isLoading && (
          <>
            <Tag>{formatDateRelative(order?.data?.createdAt)}</Tag>
            <Tag color={getOrderStatusColor(order?.data?.status)}>
              {getOrderStatus(order?.data?.status)}
            </Tag>
            <Button
              type="primary"
              onClick={() => route.push("/auth/orders/substitute/" + orderId)}
            >
              Substitute Order
            </Button>
          </>
        )}
      </PageHeader>
      {isLoading ? (
        <Loading />
      ) : (
        <Container fluid>
          <Row className="gy-4">
            <Col lg={8} md={12}>
              <div className="d-flex flex-column gap-4">
                <AddressTab
                  data={{
                    ...order?.data?.address,
                    user_id: order?.data?.userId,
                    order_contact_name:
                      specificStoreOrder?.name || order?.data?.name,
                  }}
                />
                <ProductTab data={order?.data?.orderItems} />
                <PaymentStatusTab data={order?.data} />
              </div>
            </Col>
            <Col lg={4} md={12}>
              <OrderStatusTab data={order?.data} />
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
}
