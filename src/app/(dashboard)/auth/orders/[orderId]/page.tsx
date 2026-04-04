"use client";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { useParams } from "next/navigation";
import AddressTab from "../_components/addressTab";
import ProductTab from "../_components/productsTab";
import PaymentStatusTab from "../_components/paymentStatusTab";
import OrderStatusTab from "../_components/orderStatusTab";
import ShippingLabelModal from "../_components/ShippingLabel";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import Loading from "@/app/(dashboard)/_components/loading";
import { Button, Tag } from "antd";
import Image from "next/image";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { FiShoppingBag, FiPrinter } from "react-icons/fi";
import "./style.scss";

import { Order } from "../_components/dataTable";
import { AddressData } from "../_components/addressTab";

interface StoreInfo {
  id?: string | number;
  name?: string;
  store_name?: string;
  email?: string;
  phone?: string;
  business_address?: string;
  logo_upload?: string;
  slug?: string;
}

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

// ── Store logo with initials fallback ─────────────────────────────────────────
function StoreLogo({ store }: { store: StoreInfo }) {
  const initials = (store.store_name ?? store.name ?? "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (store.logo_upload) {
    return (
      <div className="od-store-logo">
        <Image
          src={store.logo_upload}
          alt={store.store_name ?? "store"}
          fill
          style={{ objectFit: "cover" }}
          sizes="64px"
        />
      </div>
    );
  }
  return (
    <div className="od-store-logo od-store-logo--initials">{initials}</div>
  );
}

// ── Single seller card ────────────────────────────────────────────────────────
function SellerCard({
  store,
  index,
  total,
}: {
  store: StoreInfo;
  index: number;
  total: number;
}) {
  return (
    <div className="od-card od-card--seller">
      <div className="od-card__header">
        <span className="od-card__icon">
          <FiShoppingBag size={15} />
        </span>
        <span className="od-card__title">
          {total > 1 ? `Seller ${index + 1}` : "Store Details"}
        </span>
        {total > 1 && (
          <span className="od-seller-badge">
            {index + 1}/{total}
          </span>
        )}
      </div>
      <div className="od-card__body">
        <div className="od-seller-body">
          <StoreLogo store={store} />
          <div className="od-seller-info">
            <div className="od-seller-name">
              {store.store_name ?? store.name ?? "-"}
            </div>
            {store.name && store.store_name && (
              <div className="od-seller-owner">{store.name}</div>
            )}
            {store.email && (
              <div className="od-seller-meta">{store.email}</div>
            )}
            {store.phone && (
              <div className="od-seller-meta">{store.phone}</div>
            )}
            {store.business_address && (
              <div className="od-seller-meta od-seller-meta--address">
                {store.business_address}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function OrderDetails() {
  const { orderId } = useParams() as { orderId: string };
  const route = useRouter();
  const { data: sessionData, status } = useSession();
  const session = (sessionData || null) as {
    role?: string;
    type?: string;
    user?: { type?: string; role?: string } | null;
  } | null;
  const userRole = session?.role || session?.user?.role;
  const userType = session?.type || session?.user?.type;
  const isSeller = userRole === "seller" || userType === "seller";

  const orderEndpoint = isSeller
    ? API_ADMIN.ORDER_GETONE_SELLER + orderId
    : API_ADMIN.ORDER_DETAILS + orderId;

  const { data: orderData, isLoading } = useQuery({
    queryFn: async () => await GET(orderEndpoint),
    queryKey: ["order_details", orderId, isSeller],
    enabled: status === "authenticated",
    staleTime: 0,
  });

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

  // Order items
  const orderItems = Array.isArray(order.orderItems)
    ? order.orderItems.map((item: Record<string, unknown>) => ({
        ...(item as Record<string, unknown>),
        product:
          (item as { productDetails?: Record<string, unknown> })
            .productDetails || {},
      }))
    : [];

  // Payment details
  const paymentData = order;

  // Sellers — prefer order.sellers array, fall back to order.storeDetails
  const sellers: StoreInfo[] = (() => {
    if (Array.isArray(order.sellers) && order.sellers.length > 0) {
      return order.sellers as StoreInfo[];
    }
    if (order.storeDetails && typeof order.storeDetails === "object") {
      return [order.storeDetails as StoreInfo];
    }
    return [];
  })();

  const multiSeller = sellers.length > 1;

  // Shipping label state
  const [labelOpen, setLabelOpen] = useState(false);

  const formatDateRelative = (date: string) => {
    const givenDate = moment(date);
    const diffInHours = moment().diff(givenDate, "hours");
    if (diffInHours < 24) return `${diffInHours} hrs ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getOrderStatusColor = (s: string) => {
    const map: Record<string, string> = {
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
    return map[s] || "#dfdddd";
  };

  return (
    <div>
      <PageHeader title="Order Details" bredcume="Dashboard / Orders / Details">
        {!isLoading && (
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              icon={<FiPrinter size={14} />}
              onClick={() => setLabelOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              Print Label
            </Button>
            {!isSeller && (
              <Button
                type="primary"
                onClick={() => route.push("/auth/orders/substitute/" + orderId)}
              >
                Substitute Order
              </Button>
            )}
          </div>
        )}
      </PageHeader>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          {/* ── Summary bar ─────────────────────────────────────────── */}
          <div className="od-summary-bar">
            <div className="od-summary-bar__item od-summary-bar__item--ref">
              <div className="od-summary-bar__label">Order ID</div>
              <span className="od-summary-bar__id">
                {order.order_id ?? orderId}
              </span>
            </div>

            <div className="od-summary-bar__divider" />

            <div className="od-summary-bar__item">
              <div className="od-summary-bar__label">Status</div>
              <Tag
                color={getOrderStatusColor(order.status ?? "")}
                className="od-summary-bar__tag"
              >
                {(order.status ?? "-").replace(/_/g, " ")}
              </Tag>
            </div>

            <div className="od-summary-bar__divider" />

            <div className="od-summary-bar__item">
              <div className="od-summary-bar__label">Payment</div>
              <Tag
                color={
                  order.orderPayment?.status === "success" ? "green" : "orange"
                }
                className="od-summary-bar__tag"
              >
                {(order.orderPayment?.status ?? "-").replace(/_/g, " ")}
              </Tag>
            </div>

            <div className="od-summary-bar__divider" />

            <div className="od-summary-bar__item od-summary-bar__item--total">
              <div className="od-summary-bar__label">Grand Total</div>
              <span className="od-summary-bar__amount">
                ₦
                {(
                  (order.grandTotal ?? order.total ?? 0) as number
                ).toLocaleString("en-NG")}
              </span>
            </div>

            <div className="od-summary-bar__divider" />

            <div className="od-summary-bar__item od-summary-bar__item--date">
              <div className="od-summary-bar__label">Placed</div>
              <span className="od-summary-bar__date">
                {order.createdAt ? formatDateRelative(order.createdAt) : "-"}
              </span>
            </div>
          </div>

          {/* ── Two-column grid ──────────────────────────────────────── */}
          <div className="od-layout">
            {/* Left: products → delivery address */}
            <div className="od-layout__main">
              <ProductTab data={orderItems} />
              <AddressTab data={mergedAddress} />
            </div>

            {/* Right: status → seller (single) → payment */}
            <div className="od-layout__side">
              <OrderStatusTab data={{ id: order.id }} />

              {!isSeller &&
                !multiSeller &&
                (sellers.length === 1 ? (
                  <SellerCard store={sellers[0]} index={0} total={1} />
                ) : (
                  <div className="od-card od-card--seller">
                    <div className="od-card__header">
                      <span className="od-card__icon">
                        <FiShoppingBag size={15} />
                      </span>
                      <span className="od-card__title">Store Details</span>
                    </div>
                    <div className="od-card__body">
                      <div className="od-empty">No store information available.</div>
                    </div>
                  </div>
                ))}

              <PaymentStatusTab data={paymentData} />
            </div>
          </div>

          {/* ── Multi-seller strip (full width) ─────────────────────── */}
          {!isSeller && multiSeller && (
            <div className="od-sellers-strip">
              <div className="od-sellers-strip__heading">
                <FiShoppingBag size={15} />
                <span>Sellers ({sellers.length})</span>
              </div>
              <div className="od-sellers-grid">
                {sellers.map((s, idx) => (
                  <SellerCard
                    key={s.id ?? idx}
                    store={s}
                    index={idx}
                    total={sellers.length}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Shipping label modal ─────────────────────────────────── */}
          <ShippingLabelModal
            open={labelOpen}
            onClose={() => setLabelOpen(false)}
            data={{
              customerName:
                order.customer_name ||
                order.address?.full_name ||
                mergedAddress.name,
              customerPhone:
                order.customer_phone || order.address?.phone_no,
              address: {
                full_address: order.address?.full_address,
                address: order.address?.address,
                city: order.address?.city,
                state: order.address?.state,
                country: order.address?.country,
                landmark: order.address?.landmark,
              },
              orderId: order.order_id ?? orderId,
              createdAt: order.createdAt,
            }}
          />
        </>
      )}
    </div>
  );
}
