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
import { useSession } from "next-auth/react";
import API from "@/config/API";

export default function OrderDetails() {
  const { orderId } = useParams();
  const route = useRouter();
  const { data: session } = useSession();

  const userRole = (session as any)?.role || (session as any)?.user?.role;

  const { data: order, isLoading } = useQuery({
    queryFn: async () => {
      const params: any = {};
      if (userRole !== "admin" && (session as any)?.user?.store_id) {
        params.store_id = (session as any)?.user?.store_id;
      }
      return await GET(API.ORDER_GETONE_ADMIN + orderId, params);
    },
    queryKey: ["order_details", orderId, userRole],
    staleTime: 0,
  });
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
                <AddressTab data={order?.data?.address} />
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
