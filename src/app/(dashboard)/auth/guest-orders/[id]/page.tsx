"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "antd/es/form/Form";
import { Tag, Divider, Button, Modal, Form, Select, DatePicker, Input, notification, Tooltip, Dropdown } from "antd";
import type { MenuProps } from "antd";
import Image from "next/image";
import dayjs from "dayjs";
import {
  FiPackage,
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiShoppingBag,
  FiPrinter,
  FiFileText,
  FiClipboard,
  FiEdit,
  FiMoreVertical,
} from "react-icons/fi";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";
import ShippingLabelModal from "@/app/(dashboard)/auth/orders/_components/ShippingLabel";
import InvoiceModal from "@/app/(dashboard)/auth/orders/_components/Invoice";
import DeliveryReceiptModal from "@/app/(dashboard)/auth/orders/_components/DeliveryReceipt";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import "./style.scss";

const { TextArea } = Input;

// ─── Constants ────────────────────────────────────────────────────────────────
const TERMINAL_STATUSES = ["failed", "delivered", "cancelled", "rejected"];

const GUEST_ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "packed", label: "Packed" },
  { value: "dispatched", label: "Dispatched" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "picked_up", label: "Picked Up" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rejected", label: "Rejected" },
  { value: "failed", label: "Failed" },
  { value: "substitution", label: "Substitution" },
  { value: "waiting_refund", label: "Waiting Refund" },
];

// ─── Interfaces ────────────────────────────────────────────────────────────────
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
  packed: "geekblue",
  dispatched: "purple",
  shipped: "purple",
  out_for_delivery: "cyan",
  picked_up: "cyan",
  delivered: "green",
  cancelled: "red",
  rejected: "red",
  payment_received: "blue",
  failed: "red",
  success: "green",
  substitution: "gold",
  waiting_refund: "volcano",
};

// ─── Update Status Modal (pure UI — no hooks) ────────────────────────────────
type StatusFormValues = { status: string; remark?: string; delivery_date?: dayjs.Dayjs };

interface UpdateStatusModalProps {
  open: boolean;
  onCancel: () => void;
  onFinish: (vals: StatusFormValues) => void;
  form: ReturnType<typeof useForm<StatusFormValues>>[0];
  currentStatus: string;
  isPending: boolean;
}

function UpdateGuestStatusModal({
  open,
  onCancel,
  onFinish,
  form,
  currentStatus,
  isPending,
}: UpdateStatusModalProps) {
  return (
    <Modal
      title="Update Guest Order Status"
      open={open}
      centered
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: currentStatus }}
        onFinish={onFinish}
        style={{ marginTop: 8 }}
      >
        <Form.Item
          label="Order Status"
          name="status"
          rules={[{ required: true, message: "Please select a status" }]}
        >
          <Select options={GUEST_ORDER_STATUSES} size="large" />
        </Form.Item>

        <Form.Item label="Remark (optional)" name="remark">
          <TextArea rows={3} placeholder="Enter a note for the customer" size="large" />
        </Form.Item>

        <Form.Item
          label="Expected Delivery Date"
          name="delivery_date"
          rules={[{ required: true, message: "Please select an expected delivery date" }]}
        >
          <DatePicker
            showTime
            size="large"
            style={{ width: "100%" }}
            placeholder="Select expected delivery date"
          />
        </Form.Item>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button size="large" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" size="large" htmlType="submit" loading={isPending}>
            Update Status
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

// ─── Helper: store logo with initials fallback ───────────────────────────────
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
      <div className="god-store-logo">
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
  return <div className="god-store-logo god-store-logo--initials">{initials}</div>;
}

// ─── Helper: labelled key-value row ──────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="god-info-row">
      <span className="god-info-row__label">{label}</span>
      <span className="god-info-row__value">{value ?? "-"}</span>
    </div>
  );
}

// ─── Helper: card with coloured accent bar ────────────────────────────────────
function SectionCard({
  title,
  icon,
  accent = "#e5e7eb",
  children,
  badge,
}: {
  title: string;
  icon: React.ReactNode;
  accent?: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="god-card" style={{ "--god-accent": accent } as React.CSSProperties}>
      <div className="god-card__header">
        <span className="god-card__icon" style={{ color: accent }}>{icon}</span>
        <span className="god-card__title">{title}</span>
        {badge && <span className="god-card__badge">{badge}</span>}
      </div>
      <div className="god-card__body">{children}</div>
    </div>
  );
}

// ─── Seller card (compact: logo + info side-by-side) ─────────────────────────
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
    <SectionCard
      title={total > 1 ? `Seller ${index + 1}` : "Store Details"}
      icon={<FiShoppingBag size={15} />}
      accent="#6366f1"
      badge={
        total > 1 ? (
          <span className="god-seller-badge">
            {index + 1}/{total}
          </span>
        ) : undefined
      }
    >
      <div className="god-seller-body">
        <StoreLogo store={store} />
        <div className="god-seller-info">
          <div className="god-seller-name">{store.store_name ?? store.name ?? "-"}</div>
          {store.name && store.store_name && (
            <div className="god-seller-owner">{store.name}</div>
          )}
          {store.email && <div className="god-seller-meta">{store.email}</div>}
          {store.phone && <div className="god-seller-meta">{store.phone}</div>}
          {store.business_address && (
            <div className="god-seller-meta god-seller-meta--address">
              {store.business_address}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GuestOrderDetail() {
  const { id } = useParams() as { id: string };
  const { data: sessionData, status: authStatus } = useSession();
  const session = sessionData as CustomSession | null;

  const userRole = session?.role;
  const userType = session?.user?.type || session?.type;
  const isSeller = userRole === "seller" || userType === "seller";
  const endpoint = isSeller ? API.ORDER_GUEST_STORE : API.ORDER_GUEST_ALL;
  const queryKey = [endpoint];

  const { data: ordersRaw, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: () => GET(endpoint, {}, null, { token: session?.token }),
    enabled: authStatus === "authenticated" && !!session?.token,
    retry: false,
  });

  const orders = ordersRaw as GuestOrdersResponse | undefined;
  const order: GuestOrder | undefined = Array.isArray(orders?.data)
    ? orders.data.find((o) => String(o.id) === String(id))
    : undefined;



  const guestName =
    [order?.guest_first_name, order?.guest_last_name].filter(Boolean).join(" ") || "Guest";
  const deliveryAddr =
    order?.delivery_address ?? order?.shipping_address ?? order?.address;

  const sellers: StoreInfo[] =
    Array.isArray(order?.sellers) && order.sellers.length > 0
      ? order.sellers
      : order?.store
      ? [order.store]
      : [];

  const multiSeller = sellers.length > 1;

  const [labelOpen, setLabelOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);

  const [statusForm] = useForm<StatusFormValues>();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (values: { status: string; remark?: string; delivery_date?: dayjs.Dayjs }) => {
      const payload: Record<string, unknown> = { status: values.status };
      if (values.remark) payload.remark = values.remark;
      if (values.delivery_date) payload.delivery_date = values.delivery_date.toISOString();

      const baseUrl = API.BASE_URL.endsWith("/") ? API.BASE_URL : `${API.BASE_URL}/`;
      const orderId = order?.id ?? id;
      const res = await fetch(`${baseUrl}${API.ORDER_GUEST_UPDATE_STATUS}${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session?.token ?? ""}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = "Failed to update status. Please try again.";
        try {
          const raw = await res.text();
          if (raw) {
            try { msg = JSON.parse(raw)?.message ?? msg; } catch { msg = raw; }
          }
        } catch {}
        throw new Error(msg);
      }
      return res.json();
    },
    onSuccess: () => {
      notification.success({ message: "Order status updated successfully." });
      queryClient.invalidateQueries({ queryKey });
      statusForm.resetFields();
      updateMutation.reset();
      setUpdateStatusOpen(false);
    },
    onError: (err: Error) => {
      notification.error({ message: err.message });
    },
  });

  const isTerminal = TERMINAL_STATUSES.includes(order?.status ?? "");

  const moreMenuItems: MenuProps["items"] = [
    {
      key: "invoice",
      icon: <FiFileText size={14} />,
      label: "Invoice",
      onClick: () => setInvoiceOpen(true),
    },
    {
      key: "receipt",
      icon: <FiClipboard size={14} />,
      label: "Receipt",
      onClick: () => setReceiptOpen(true),
    },
    {
      key: "label",
      icon: <FiPrinter size={14} />,
      label: "Print Label",
      onClick: () => setLabelOpen(true),
    },
  ];

  if (isLoading) return <Loading />;
  if (isError) return <Error description={(error as Error)?.message} />;
  if (!order) return <Error description="Order not found." />;

  return (
    <>
      <PageHeader
        title="Guest Order Detail"
        bredcume={`Dashboard / Guest Orders / ${order.checkout_reference ?? id}`}
        icon={<FiPackage />}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Tooltip
            title={isTerminal ? `Status "${order.status}" is terminal and cannot be changed.` : ""}
          >
            <Button
              icon={<FiEdit size={14} />}
              type="primary"
              onClick={() => setUpdateStatusOpen(true)}
              disabled={isTerminal}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              Update Status
            </Button>
          </Tooltip>

          {/* Desktop: individual buttons (hidden on tablet/mobile) */}
          <Button
            icon={<FiFileText size={14} />}
            onClick={() => setInvoiceOpen(true)}
            className="hide-tablet"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            Invoice
          </Button>
          <Button
            icon={<FiClipboard size={14} />}
            onClick={() => setReceiptOpen(true)}
            className="hide-tablet"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            Receipt
          </Button>
          <Button
            icon={<FiPrinter size={14} />}
            onClick={() => setLabelOpen(true)}
            className="hide-tablet"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            Print Label
          </Button>

          {/* Mobile/tablet: collapsed "More" dropdown (hidden on desktop) */}
          <Dropdown menu={{ items: moreMenuItems }} placement="bottomRight" trigger={["click"]}>
            <Button
              icon={<FiMoreVertical size={16} />}
              className="show-mobile"
            />
          </Dropdown>
        </div>
      </PageHeader>

      {/* ── Summary bar ────────────────────────────────────────────────── */}
      <div className="god-summary-bar">
        <div className="god-summary-bar__item god-summary-bar__item--ref">
          <div className="god-summary-bar__label">Reference</div>
          <code className="god-summary-bar__code">{order.checkout_reference ?? "-"}</code>
        </div>

        <div className="god-summary-bar__divider" />

        <div className="god-summary-bar__item">
          <div className="god-summary-bar__label">Order Status</div>
          <Tag
            color={STATUS_COLORS[order.status ?? ""] ?? "default"}
            className="god-summary-bar__tag"
          >
            {(order.status ?? "-").replace(/_/g, " ")}
          </Tag>
        </div>

        <div className="god-summary-bar__divider" />

        <div className="god-summary-bar__item">
          <div className="god-summary-bar__label">Payment</div>
          <Tag
            color={order.payment_status === "success" ? "green" : "orange"}
            className="god-summary-bar__tag"
          >
            {(order.payment_status ?? "-").replace(/_/g, " ")}
          </Tag>
        </div>

        <div className="god-summary-bar__divider" />

        <div className="god-summary-bar__item god-summary-bar__item--total">
          <div className="god-summary-bar__label">Grand Total</div>
          <span className="god-summary-bar__amount">
            ₦{(order.grandTotal ?? order.total ?? 0).toLocaleString("en-NG")}
          </span>
        </div>

        <div className="god-summary-bar__divider" />

        <div className="god-summary-bar__item god-summary-bar__item--date">
          <div className="god-summary-bar__label">Date</div>
          <span className="god-summary-bar__date">
            {order.createdAt ? dayjs(order.createdAt).format("DD MMM YYYY, HH:mm") : "-"}
          </span>
        </div>
      </div>

      {/* ── Two-column grid ────────────────────────────────────────────── */}
      <div className="god-layout">
        {/* Left: order content */}
        <div className="god-layout__main">
          <SectionCard title="Order Items" icon={<FiPackage size={15} />} accent="#3b82f6">
            {(order.items ?? []).length === 0 ? (
              <div className="god-empty">No items found.</div>
            ) : (
              <>
                {(order.items ?? []).map((item, i) => (
                  <div
                    key={i}
                    className="god-item"
                    style={{
                      borderBottom:
                        i < (order.items?.length ?? 0) - 1
                          ? "1px solid #f3f4f6"
                          : "none",
                    }}
                  >
                    <div className="god-item__image">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name ?? "product"}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="56px"
                        />
                      ) : (
                        <div className="god-item__image-placeholder">
                          <FiPackage size={20} color="#9ca3af" />
                        </div>
                      )}
                    </div>
                    <div className="god-item__info">
                      <div className="god-item__name">{item.name ?? "Unnamed Product"}</div>
                      <div className="god-item__meta">
                        Qty: {item.quantity ?? 1}&nbsp;·&nbsp;Unit price: ₦
                        {(item.price ?? 0).toLocaleString("en-NG")}
                      </div>
                    </div>
                    <div className="god-item__total">
                      ₦{(item.totalPrice ?? 0).toLocaleString("en-NG")}
                    </div>
                  </div>
                ))}

                <Divider style={{ margin: "10px 0 6px" }} />

                <div className="god-totals-row">
                  <span className="god-totals-row__label">Subtotal</span>
                  <span className="god-totals-row__value">
                    ₦{(order.total ?? 0).toLocaleString("en-NG")}
                  </span>
                </div>
                <div className="god-totals-row god-totals-row--grand">
                  <span className="god-totals-row__label">Grand Total</span>
                  <span className="god-totals-row__value">
                    ₦{(order.grandTotal ?? 0).toLocaleString("en-NG")}
                  </span>
                </div>
              </>
            )}
          </SectionCard>

          <SectionCard title="Delivery Address" icon={<FiMapPin size={15} />} accent="#10b981">
            {deliveryAddr ? (
              <>
                <InfoRow label="Full Name" value={deliveryAddr.full_name} />
                <InfoRow label="Phone" value={deliveryAddr.phone} />
                <InfoRow
                  label="Address"
                  value={deliveryAddr.full_address ?? deliveryAddr.address}
                />
                <InfoRow label="City" value={deliveryAddr.city} />
                <InfoRow label="State" value={deliveryAddr.state} />
                <InfoRow label="Country" value={deliveryAddr.country} />
              </>
            ) : (
              <div className="god-empty">No address available.</div>
            )}
          </SectionCard>
        </div>

        {/* Right: guest, payment, store (single seller) */}
        <div className="god-layout__side">
          {/* Guest info — always first */}
          <SectionCard title="Guest Information" icon={<FiUser size={15} />} accent="#8b5cf6">
            <InfoRow label="Name" value={guestName} />
            <InfoRow label="Email" value={order.guest_email} />
            <InfoRow label="Phone" value={order.guest_phone} />
          </SectionCard>

          {/* Payment details */}
          <SectionCard title="Payment Details" icon={<FiCreditCard size={15} />} accent="#f59e0b">
            <InfoRow label="Method" value={order.payment?.paymentType} />
            <InfoRow
              label="Amount"
              value={
                order.payment?.amount != null
                  ? `₦${order.payment.amount.toLocaleString("en-NG")}`
                  : "-"
              }
            />
            <InfoRow
              label="Status"
              value={
                <Tag
                  color={order.payment?.status === "success" ? "green" : "orange"}
                  style={{ textTransform: "capitalize" }}
                >
                  {(order.payment?.status ?? "-").replace(/_/g, " ")}
                </Tag>
              }
            />
            <InfoRow
              label="Reference"
              value={<code className="god-code">{order.payment?.ref ?? "-"}</code>}
            />
            <InfoRow
              label="Created At"
              value={
                order.createdAt ? dayjs(order.createdAt).format("DD MMM YYYY, HH:mm") : "-"
              }
            />
          </SectionCard>

          {/* Single seller — stays in sidebar */}
          {!multiSeller &&
            (sellers.length === 1 ? (
              <SellerCard store={sellers[0]} index={0} total={1} />
            ) : (
              <SectionCard title="Store Details" icon={<FiShoppingBag size={15} />} accent="#6366f1">
                <div className="god-empty">No store information available.</div>
              </SectionCard>
            ))}
        </div>
      </div>

      {/* ── Multi-seller strip (full width, below grid) ───────────────── */}
      {multiSeller && (
        <div className="god-sellers-strip">
          <div className="god-sellers-strip__heading">
            <FiShoppingBag size={15} />
            <span>Sellers ({sellers.length})</span>
          </div>
          <div className="god-sellers-grid">
            {sellers.map((s, idx) => (
              <SellerCard key={s.id ?? idx} store={s} index={idx} total={sellers.length} />
            ))}
          </div>
        </div>
      )}

      {/* ── Update status modal ──────────────────────────────────────────── */}
      <UpdateGuestStatusModal
        open={updateStatusOpen}
        onCancel={() => {
          statusForm.resetFields();
          updateMutation.reset();
          setUpdateStatusOpen(false);
        }}
        onFinish={(vals) => updateMutation.mutate(vals)}
        form={statusForm}
        currentStatus={order.status ?? "pending"}
        isPending={updateMutation.isPending}
      />

      {/* ── Invoice modal ────────────────────────────────────────────────── */}
      <InvoiceModal
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        data={{
          orderId:       order.checkout_reference ?? order.id,
          packageNo:     order.checkout_reference ?? order.id,
          createdAt:     order.createdAt,
          payableAmount: order.grandTotal ?? order.total,
          customerName:  guestName,
          customerPhone: order.guest_phone,
          address: deliveryAddr
            ? {
                full_address: deliveryAddr.full_address ?? deliveryAddr.address,
                city:         deliveryAddr.city,
                state:        deliveryAddr.state,
                country:      deliveryAddr.country,
              }
            : undefined,
          items: order.items?.map((item, i) => ({
            itemNo:   i + 1,
            name:     item.name,
            quantity: item.quantity,
            price:    item.price,
            total:    item.totalPrice,
          })),
        }}
      />

      {/* ── Delivery receipt modal ───────────────────────────────────────── */}
      <DeliveryReceiptModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        data={{
          orderId:       order.checkout_reference ?? order.id,
          createdAt:     order.createdAt,
          payableAmount: order.grandTotal ?? order.total,
          paymentMethod: order.payment?.paymentType,
          customerName:  guestName,
          customerPhone: order.guest_phone,
          storeName:     sellers[0]?.store_name ?? sellers[0]?.name,
          address: deliveryAddr
            ? {
                full_address: deliveryAddr.full_address ?? deliveryAddr.address,
                city:         deliveryAddr.city,
                state:        deliveryAddr.state,
                country:      deliveryAddr.country,
              }
            : undefined,
          items: order.items?.map((item, i) => ({
            itemNo:   i + 1,
            name:     item.name,
            quantity: item.quantity,
            price:    item.price,
            total:    item.totalPrice,
          })),
        }}
      />

      {/* ── Shipping label modal ─────────────────────────────────────────── */}
      <ShippingLabelModal
        open={labelOpen}
        onClose={() => setLabelOpen(false)}
        data={{
          customerName: guestName,
          customerPhone: order.guest_phone,
          address: deliveryAddr
            ? {
                full_address: deliveryAddr.full_address ?? deliveryAddr.address,
                city: deliveryAddr.city,
                state: deliveryAddr.state,
                country: deliveryAddr.country,
              }
            : undefined,
          orderId: order.checkout_reference ?? order.id,
          createdAt: order.createdAt,
        }}
      />
    </>
  );
}
