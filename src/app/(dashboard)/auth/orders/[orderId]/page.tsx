"use client";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { useParams } from "next/navigation";
import AddressTab from "../_components/addressTab";
import ProductTab from "../_components/productsTab";
import PaymentStatusTab from "../_components/paymentStatusTab";
import OrderStatusTab from "../_components/orderStatusTab";
import SellerDetailsCard from "../_components/sellerDetailsCard";
import CustomerDetailsCard from "../_components/customerDetailsCard";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import { Col, Container, Row } from "react-bootstrap";
import Loading from "@/app/(dashboard)/_components/loading";
import { Button, Tag } from "antd";
import { getOrderStatus } from "../_components/getOrderStatus";
import moment from "moment";
import { useRouter } from "next/navigation";

import API from "@/config/API";

import { Order } from "../_components/dataTable";
import { AddressData } from "../_components/addressTab";

interface StoreOrder {
  id?: string | number;
  order_id?: string | number;
  address?: AddressData;
  name?: string;
  phone?: string;
  phone_no?: string;
  [key: string]: unknown;
}

interface OrderDetailsResponse {
  data: Order;
}

interface StoreOrdersResponse {
  data: StoreOrder[];
}

export default function OrderDetails() {
  const { orderId } = useParams();
  const route = useRouter();

  const { data: orderData, isLoading } = useQuery({
    queryFn: async () => await GET(API_ADMIN.ORDER_DETAILS + orderId),
    queryKey: ["order_details", orderId],
    staleTime: 0,
  });

  const order = orderData as OrderDetailsResponse;

  const { data: storeOrderDataRaw } = useQuery({
    queryFn: async () => {
      // Use the storeId from the fetched order details
      const storeId = order?.data?.storeId;
      if (!storeId) return null;

      // Fetch orders for this store.
      // Note: If the backend filters strictly by `orderId` param, this is fine.
      // If it returns a paginated list, we might need to fetch a larger page or verify the filtering.
      // Assuming 'orderId' param works as a filter:
      return await GET(API.ORDER_GET_BYSTORE + storeId, { orderId });
    },
    queryKey: ["store_order_lookup", orderId, order?.data?.storeId],
    enabled: !!order?.data?.storeId && !!orderId,
  });

  const storeOrderData = storeOrderDataRaw as StoreOrdersResponse;

  const specificStoreOrder = Array.isArray(storeOrderData?.data)
    ? storeOrderData?.data.find(
        (o) =>
          String(o.id) === String(orderId) ||
          String(o.order_id) === String(orderId),
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
            <Tag>{formatDateRelative(order?.data?.createdAt || "")}</Tag>
            <Tag color={getOrderStatusColor(order?.data?.status || "")}>
              {getOrderStatus(order?.data?.status || "")}
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
                    ...(order?.data?.address as AddressData),
                    ...(specificStoreOrder?.address || {}),
                    user_id: order?.data?.userId,
                    order_contact_name:
                      specificStoreOrder?.name || order?.data?.name,
                    // Fallback for phone if it exists at root of store order
                    phone_no:
                      (order?.data?.address as AddressData)?.phone_no ||
                      specificStoreOrder?.phone ||
                      specificStoreOrder?.phone_no,
                  }}
                />
                <ProductTab data={order?.data?.orderItems || []} />
                <PaymentStatusTab data={order?.data} />
              </div>
            </Col>
            <Col lg={4} md={12}>
              <div className="d-flex flex-column gap-4">
                <SellerDetailsCard data={order?.data} />
                <CustomerDetailsCard data={order?.data} />
                <OrderStatusTab data={order?.data} />
              </div>
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
}
