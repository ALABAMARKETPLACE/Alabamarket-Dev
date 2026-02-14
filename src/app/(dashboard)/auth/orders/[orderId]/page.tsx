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

  const { data: orderData, isLoading } = useQuery({
    queryFn: async () => await GET(API_ADMIN.ORDER_DETAILS + orderId),
    queryKey: ["order_details", orderId],
    staleTime: 0,
  });

  const order = (
    orderData && (orderData as { data?: unknown }).data
      ? orderData
      : { data: orderData }
  ) as OrderDetailsResponse;

  // Normalize response shape to what tabs expect (handles /order/details/{id} shape)
  const normalizedData: Order = (() => {
    const raw = order?.data || ({} as Order);
    // Normalize orderItems to expose nested product details on "product"
    const orderItems = Array.isArray(
      (raw as Record<string, unknown>)?.orderItems,
    )
      ? (
          (raw as Record<string, unknown>).orderItems as Array<
            Record<string, unknown>
          >
        ).map((item) => {
          const product =
            (item as { product?: Record<string, unknown> }).product ||
            (item as { Product?: Record<string, unknown> }).Product ||
            (item as { productDetails?: Record<string, unknown> })
              .productDetails ||
            undefined;
          return {
            ...item,
            product,
          };
        })
      : [];

    // Carry through all root fields; override orderItems with normalized
    return {
      ...(raw as Order),
      orderItems,
    };
  })();

  const { data: storeOrderDataRaw } = useQuery({
    queryFn: async () => {
      // Use the storeId from the fetched order details
      const storeId = normalizedData?.storeId;
      if (!storeId) return null;

      // Fetch orders for this store.
      // Note: If the backend filters strictly by `orderId` param, this is fine.
      // If it returns a paginated list, we might need to fetch a larger page or verify the filtering.
      // Assuming 'orderId' param works as a filter:
      return await GET(API.ORDER_GET_BYSTORE + storeId, { orderId });
    },
    queryKey: ["store_order_lookup", orderId, normalizedData?.storeId],
    enabled: !!normalizedData?.storeId && !!orderId,
  });

  const storeOrderData = storeOrderDataRaw as StoreOrdersResponse;

  const specificStoreOrder = Array.isArray(storeOrderData?.data)
    ? storeOrderData?.data.find(
        (o) =>
          String(o.id) === String(orderId) ||
          String(o.order_id) === String(orderId),
      )
    : null;
  const userIdValue =
    (normalizedData?.userId as string | number | undefined) ??
    (normalizedData?.user_id as string | number | undefined);
  const { data: userDetailsRaw } = useQuery({
    queryFn: async () =>
      userIdValue ? await GET(API.USER_DETAILS + userIdValue) : null,
    queryKey: ["order_user_details", userIdValue],
    enabled: !!userIdValue,
    staleTime: 0,
  });
  const userDetails = (() => {
    if (!userDetailsRaw) return null as null | Record<string, unknown>;
    if ((userDetailsRaw as { data?: unknown })?.data)
      return (userDetailsRaw as { data: Record<string, unknown> }).data;
    return userDetailsRaw as Record<string, unknown>;
  })();
  const deriveCustomerName = (): string | undefined => {
    if (!userDetails) return undefined;
    const trim = (v: unknown) => (typeof v === "string" ? v.trim() : undefined);
    const name = trim(userDetails["name"]);
    if (name) return name;
    const fn = trim(userDetails["first_name"]);
    const ln = trim(userDetails["last_name"]);
    if (fn || ln) return [fn, ln].filter(Boolean).join(" ").trim();
    const uname = trim(userDetails["user_name"]);
    if (uname) return uname;
    const full = trim(userDetails["full_name"]);
    if (full) return full;
    return undefined;
  };
  const deriveCustomerPhone = (): string | undefined => {
    if (!userDetails) return undefined;
    const cc =
      (userDetails["countrycode"] as string | undefined) ||
      (userDetails["country_code"] as string | undefined);
    const ph =
      (userDetails["phone"] as string | undefined) ||
      (userDetails["phone_no"] as string | undefined);
    if (cc && ph) return `${cc}${ph}`.replace(/\s+/g, "");
    return ph;
  };
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
  const str = (v: unknown): string | undefined =>
    typeof v === "string" && v.trim() !== "" ? v : undefined;
  const numOrStr = (v: unknown): number | string | undefined =>
    typeof v === "number" || typeof v === "string" ? v : undefined;

  const addrRoot =
    (normalizedData?.address as Record<string, unknown> | undefined) || {};
  const addrStore =
    (specificStoreOrder?.address as Record<string, unknown> | undefined) || {};
  const rootObj = normalizedData as unknown as Record<string, unknown>;

  const mergedAddress: AddressData = {
    ...(addrRoot as AddressData),
    ...(addrStore as AddressData),
    name:
      deriveCustomerName() ||
      str(rootObj["customer_name"]) ||
      str(rootObj["name"]) ||
      str(addrRoot["full_name"]),
    customer_name:
      deriveCustomerName() ||
      str(rootObj["customer_name"]) ||
      str(rootObj["name"]) ||
      str(addrRoot["full_name"]),
    city:
      str(addrRoot["city"]) ||
      str(rootObj["delivery_city"]) ||
      str(addrStore["city"]) ||
      str(rootObj["city"]),
    state:
      str(addrRoot["state"]) ||
      str(rootObj["delivery_state"]) ||
      str(rootObj["state"]),
    state_id:
      numOrStr(addrRoot["state_id"]) || numOrStr(rootObj["delivery_state_id"]),
    seller_name: str(rootObj["store_name"]),
    user_id:
      (normalizedData?.userId as number | string | undefined) ??
      (normalizedData?.user_id as number | string | undefined),
    order_contact_name:
      deriveCustomerName() ||
      str(specificStoreOrder?.name) ||
      str(rootObj["name"]) ||
      str(rootObj["guest_name"]),
    phone_no:
      deriveCustomerPhone() ||
      str(addrRoot["phone_no"] as unknown) ||
      str(specificStoreOrder?.phone) ||
      str(specificStoreOrder?.phone_no) ||
      str(rootObj["guest_phone"]),
  };
  return (
    <div>
      <PageHeader
        title={"Order Details"}
        bredcume={"Dashboard / Orders / Details"}
      >
        {!isLoading && (
          <>
            <Tag>{formatDateRelative(normalizedData?.createdAt || "")}</Tag>
            <Tag color={getOrderStatusColor(normalizedData?.status || "")}>
              {getOrderStatus(normalizedData?.status || "")}
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
                <ProductTab data={normalizedData?.orderItems || []} />
                <PaymentStatusTab data={normalizedData} />
              </div>
            </Col>
            <Col lg={4} md={12}>
              <div className="d-flex flex-column gap-4">
                <SellerDetailsCard data={normalizedData} />
                <CustomerDetailsCard data={normalizedData} />
                <OrderStatusTab data={normalizedData} />
              </div>
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
}
