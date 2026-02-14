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
  const { orderId } = useParams() as { orderId: string };
  const route = useRouter();

  // Fetch order details using the new API response structure
  const { data: orderData, isLoading } = useQuery({
    queryFn: async () => await GET(API_ADMIN.ORDER_DETAILS + orderId),
    queryKey: ["order_details", orderId],
    staleTime: 0,
  });

  // Use the API response directly
  const order = orderData?.data || {};

  // Address mapping
  const mergedAddress: AddressData = {
    ...order.address,
    name: order.customer_name || order.address?.full_name,
    customer_name: order.customer_name || order.address?.full_name,
    phone_no: order.customer_phone || order.address?.phone_no,
    city: order.address?.city,
    state: order.address?.state,
    state_id: order.address?.state_id,
    address_type: order.address?.address_type,
    full_address: order.address?.full_address,
    country: order.address?.country,
    country_id: order.address?.country_id,
    landmark: order.address?.landmark,
  };

  // Order items (with product details)
  const orderItems = Array.isArray(order.orderItems)
    ? order.orderItems.map((item: any) => ({
        ...item,
        product: item.productDetails || {},
      }))
    : [];

  // Payment details
  const paymentData = order.orderPayment || {};

  // Order status history
  const orderStatus = order.orderStatus || [];

  // Seller/store details
  const sellerData = {
    store_name: order.store_name,
    store_email: order.store_email,
    store_phone: order.store_phone,
    store_address: order.store_address,
    store_logo: order.store_logo,
  };

  // Helper: format date
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
            <Tag>{formatDateRelative(order.createdAt || "")}</Tag>
            <Tag color={getOrderStatusColor(order.status || "")}>
              {order.status}
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
                <AddressTab data={mergedAddress} />
                <ProductTab data={orderItems} />
                <PaymentStatusTab data={paymentData} />
              </div>
            </Col>
            <Col lg={4} md={12}>
              <div className="d-flex flex-column gap-4">
                <SellerDetailsCard data={sellerData} />
                <OrderStatusTab
                  data={{ id: order.id, statusHistory: orderStatus }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
}
