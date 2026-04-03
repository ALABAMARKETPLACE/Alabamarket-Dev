"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Tag, Divider } from "antd";
import Image from "next/image";
import dayjs from "dayjs";
import { FiPackage, FiUser, FiMapPin, FiCreditCard, FiShoppingBag } from "react-icons/fi";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import "./style.scss";

interface GuestOrderAddress {
  full_name?: string;
  phone?: string;
  address?: string;
  full_address?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface GuestOrderItem {
  id?: number | string | null;
  productId?: number;
  storeId?: number | string;
  store_id?: number | string;
  name?: string;
  quantity?: number;
  price?: number;
  totalPrice?: number;
  image?: string;
}

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

interface GuestOrder {
  id?: number | string;
  order_id?: string | null;
  checkout_reference?: string;
  status?: string;
  payment_status?: string;
  guest_email?: string;
  guest_first_name?: string;
  guest_last_name?: string;
  guest_phone?: string;
  address?: GuestOrderAddress;
  shipping_address?: GuestOrderAddress;
  delivery_address?: GuestOrderAddress;
  items?: GuestOrderItem[];
  total?: number;
  grandTotal?: number;
  payment?: {
    paymentType?: string;
    status?: string;
    ref?: string;
    amount?: number;
    transaction_reference?: string;
  };
  store?: StoreInfo;
  sellers?: StoreInfo[];
  is_guest_order?: boolean;
  from_checkout?: boolean;
  createdAt?: string;
  orderStatus?: unknown;
}

interface GuestOrdersResponse {
  status: boolean;
  data: GuestOrder[];
}

interface CustomSession {
  user?: { type?: string; [key: string]: unknown };
  role?: string;
  type?: string;
  token?: string;
  [key: string]: unknown;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "orange",
  processing: "blue",
  shipped: "purple",
  out_for_delivery: "cyan",
  delivered: "green",
  cancelled: "red",
  payment_received: "blue",
  failed: "red",
  success: "green",
};

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="god-info-row">
      <span className="god-info-row__label">{label}</span>
      <span className="god-info-row__value">{value ?? "-"}</span>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="god-card">
      <div className="god-card__header">
        <span className="god-card__icon">{icon}</span>
        <span className="god-card__title">{title}</span>
      </div>
      <div className="god-card__body">{children}</div>
    </div>
  );
}

export default function GuestOrderDetail() {
  const { id } = useParams() as { id: string };
  const { data: sessionData, status: authStatus } = useSession();
  const session = sessionData as CustomSession | null;

  const userRole = session?.role;
  const userType = session?.user?.type || session?.type;
  const isSeller = userRole === "seller" || userType === "seller";
  const endpoint = isSeller ? API.ORDER_GUEST_STORE : API.ORDER_GUEST_ALL;

  const { data: ordersRaw, isLoading, isError, error } = useQuery({
    queryKey: [endpoint],
    queryFn: () => GET(endpoint, {}, null, { token: session?.token }),
    enabled: authStatus === "authenticated" && !!session?.token,
    retry: false,
  });

  const orders = ordersRaw as GuestOrdersResponse | undefined;
  const order: GuestOrder | undefined = Array.isArray(orders?.data)
    ? orders.data.find((o) => String(o.id) === String(id))
    : undefined;

  const guestName = [order?.guest_first_name, order?.guest_last_name].filter(Boolean).join(" ") || "Guest";
  const deliveryAddr = order?.delivery_address ?? order?.shipping_address ?? order?.address;
  const sellers: StoreInfo[] =
    Array.isArray(order?.sellers) && order.sellers.length > 0
      ? order.sellers
      : order?.store
      ? [order.store]
      : [];

  if (isLoading) return <Loading />;
  if (isError) return <Error description={(error as Error)?.message} />;
  if (!order) return <Error description="Order not found." />;

  return (
    <>
      <PageHeader
        title="Guest Order Detail"
        bredcume={`Dashboard / Guest Orders / ${order.checkout_reference ?? id}`}
        icon={<FiPackage />}
      />

      {/* Top summary bar */}
      <div className="god-summary-bar">
        <div className="god-summary-bar__item">
          <div className="god-summary-bar__label">Reference</div>
          <code className="god-summary-bar__code">{order.checkout_reference ?? "-"}</code>
        </div>
        <div className="god-summary-bar__item">
          <div className="god-summary-bar__label">Order Status</div>
          <Tag color={STATUS_COLORS[order.status ?? ""] ?? "default"} className="god-summary-bar__tag">
            {(order.status ?? "-").replace(/_/g, " ")}
          </Tag>
        </div>
        <div className="god-summary-bar__item">
          <div className="god-summary-bar__label">Payment</div>
          <Tag color={order.payment_status === "success" ? "green" : "orange"} className="god-summary-bar__tag">
            {order.payment_status ?? "-"}
          </Tag>
        </div>
        <div className="god-summary-bar__item god-summary-bar__item--right">
          <div className="god-summary-bar__label">Date</div>
          <span className="god-summary-bar__date">
            {order.createdAt ? dayjs(order.createdAt).format("DD MMM YYYY, HH:mm") : "-"}
          </span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="god-layout">
        {/* Left column */}
        <div className="god-layout__main">
          <SectionCard title="Order Items" icon={<FiPackage size={16} />}>
            {(order.items ?? []).length === 0 ? (
              <div className="god-empty">No items found.</div>
            ) : (
              <>
                {(order.items ?? []).map((item, i) => (
                  <div
                    key={i}
                    className="god-item"
                    style={{ borderBottom: i < (order.items?.length ?? 0) - 1 ? "1px solid #f3f4f6" : "none" }}
                  >
                    <div className="god-item__image">
                      {item.image ? (
                        <Image src={item.image} alt={item.name ?? "product"} fill style={{ objectFit: "cover" }} sizes="56px" />
                      ) : (
                        <div className="god-item__image-placeholder">
                          <FiPackage size={20} color="#9ca3af" />
                        </div>
                      )}
                    </div>
                    <div className="god-item__info">
                      <div className="god-item__name">{item.name ?? "Unnamed Product"}</div>
                      <div className="god-item__meta">
                        Qty: {item.quantity ?? 1} &nbsp;·&nbsp; Unit price: ₦{(item.price ?? 0).toLocaleString("en-NG")}
                      </div>
                    </div>
                    <div className="god-item__total">
                      ₦{(item.totalPrice ?? 0).toLocaleString("en-NG")}
                    </div>
                  </div>
                ))}
                <Divider style={{ margin: "10px 0" }} />
                <div className="god-totals-row">
                  <span className="god-totals-row__label">Subtotal</span>
                  <span className="god-totals-row__value">₦{(order.total ?? 0).toLocaleString("en-NG")}</span>
                </div>
                <div className="god-totals-row god-totals-row--grand">
                  <span className="god-totals-row__label">Grand Total</span>
                  <span className="god-totals-row__value">₦{(order.grandTotal ?? 0).toLocaleString("en-NG")}</span>
                </div>
              </>
            )}
          </SectionCard>

          <SectionCard title="Delivery Address" icon={<FiMapPin size={16} />}>
            {deliveryAddr ? (
              <>
                <InfoRow label="Full Name" value={deliveryAddr.full_name} />
                <InfoRow label="Phone" value={deliveryAddr.phone} />
                <InfoRow label="Address" value={deliveryAddr.full_address ?? deliveryAddr.address} />
                <InfoRow label="City" value={deliveryAddr.city} />
                <InfoRow label="State" value={deliveryAddr.state} />
                <InfoRow label="Country" value={deliveryAddr.country} />
              </>
            ) : (
              <div className="god-empty">No address available.</div>
            )}
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="god-layout__side">
          {/* Store / Seller Details */}
          {sellers.length > 0 ? (
            sellers.map((s, idx) => (
              <SectionCard
                key={s.id ?? idx}
                title={sellers.length > 1 ? `Store ${idx + 1} of ${sellers.length}` : "Store Details"}
                icon={<FiShoppingBag size={16} />}
              >
                {s.logo_upload && (
                  <div style={{ padding: "12px 0 4px" }}>
                    <Image
                      src={s.logo_upload}
                      alt={s.store_name ?? "store"}
                      width={56}
                      height={56}
                      style={{ objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }}
                    />
                  </div>
                )}
                <InfoRow label="Store Name" value={s.store_name ?? "-"} />
                <InfoRow label="Owner" value={s.name ?? "-"} />
                <InfoRow label="Email" value={s.email ?? "-"} />
                <InfoRow label="Phone" value={s.phone ?? "-"} />
                <InfoRow label="Address" value={s.business_address ?? "-"} />
              </SectionCard>
            ))
          ) : (
            <SectionCard title="Store Details" icon={<FiShoppingBag size={16} />}>
              <div className="god-empty">No store information available.</div>
            </SectionCard>
          )}

          {/* Guest Info */}
          <SectionCard title="Guest Information" icon={<FiUser size={16} />}>
            <InfoRow label="Name" value={guestName} />
            <InfoRow label="Email" value={order.guest_email} />
            <InfoRow label="Phone" value={order.guest_phone} />
          </SectionCard>

          {/* Payment */}
          <SectionCard title="Payment Details" icon={<FiCreditCard size={16} />}>
            <InfoRow label="Method" value={order.payment?.paymentType} />
            <InfoRow label="Amount" value={order.payment?.amount != null ? `₦${order.payment.amount.toLocaleString("en-NG")}` : "-"} />
            <InfoRow label="Status" value={
              <Tag color={order.payment?.status === "success" ? "green" : "orange"} style={{ textTransform: "capitalize" }}>
                {order.payment?.status ?? "-"}
              </Tag>
            } />
            <InfoRow label="Reference" value={<code className="god-code">{order.payment?.ref ?? "-"}</code>} />
            <InfoRow label="Created At" value={order.createdAt ? dayjs(order.createdAt).format("DD MMM YYYY, HH:mm") : "-"} />
          </SectionCard>
        </div>
      </div>
    </>
  );
}
