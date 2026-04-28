"use client";
import React, { useMemo, useEffect, useState } from "react";
import { Table, Pagination, Tag } from "antd";
import { FiPackage, FiChevronRight } from "react-icons/fi";
import { MdHourglassEmpty } from "react-icons/md";
import dayjs from "dayjs";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/formatNumber";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";

export interface Order {
  id?: string | number;
  _id?: string | number;
  order_id?: string | number;
  image?: string;
  userId?: number | null;
  user_id?: number | null;
  name?: string;
  createdAt?: string;
  grandTotal?: number;
  deliveryCharge?: number;
  status?: string;
  orderItems?: Record<string, unknown>[];
  totalItems?: number;
  storeId?: string | number;
  store_id?: string | number;
  store?: { id?: number | string; store_name?: string };
  storeDetails?: { id?: number | string; store_name?: string; name?: string; email?: string };
  _combinedStore?: string;
  _storeCount?: number;
  _orderIds?: string[];
  payment?: { status?: string; ref?: string; transaction_reference?: string };
  payment_ref?: string;
  paymentRef?: string;
  // Guest order fields
  is_guest_order?: boolean;
  guest_email?: string;
  guest_name?: string;
  guest_first_name?: string;
  guest_last_name?: string;
  guest_phone?: string;
  // Multi-seller order fields
  is_multi_seller?: boolean;
  stores?: (string | number)[];
  [key: string]: unknown;
}

interface DataTableProps {
  data: Order[];
  count: number;
  setPage: (p: number, take: number) => void;
  pageSize: number;
  page: number;
}

interface UserResponse {
  data: { name?: string };
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
  failed: "red",
  substitution: "gold",
  waiting_refund: "volcano",
};

const UserName = ({
  userId,
  guestName,
  isGuestOrder,
}: {
  userId: number | null | undefined;
  guestName?: string;
  isGuestOrder?: boolean;
}) => {
  const initial =
    guestName ?? (isGuestOrder ? "Guest" : userId == null ? "N/A" : "Loading...");
  const [name, setName] = useState<string>(initial);

  useEffect(() => {
    let mounted = true;
    if (!guestName && !isGuestOrder && userId != null) {
      GET(API.USER_DETAILS + userId)
        .then((res: unknown) => {
          const r = res as UserResponse;
          if (mounted) setName(r?.data?.name || "N/A");
        })
        .catch(() => { if (mounted) setName("N/A"); });
    }
    return () => { mounted = false; };
  }, [userId, guestName, isGuestOrder]);

  return <span>{name}</span>;
};

function DataTable({ data, count, setPage, pageSize, page }: DataTableProps) {
  const route = useRouter();
  const Settings = useAppSelector(reduxSettings);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const sym = Settings.currency === "NGN" ? "₦" : Settings.currency;

  const pill = (label: string, bg: string, color: string, border: string) => (
    <span style={{
      display: "inline-block", fontSize: 9, fontWeight: 700, lineHeight: "14px",
      padding: "0 5px", borderRadius: 4, whiteSpace: "nowrap",
      background: bg, color, border: `1px solid ${border}`,
      verticalAlign: "middle", marginLeft: 5,
    }}>
      {label}
    </span>
  );

  const columns = useMemo(
    () => [
      {
        title: "Order ID",
        dataIndex: "order_id",
        key: "order_id",
        width: 160,
        render: (val: string, record: Order) => (
          <div style={{ lineHeight: 1.5 }}>
            <span style={{
              fontFamily: "monospace", fontSize: 12, fontWeight: 600,
              color: "#1a202c", letterSpacing: "0.2px",
            }}>
              {val ?? "-"}
            </span>
            {(record._storeCount ?? 1) > 1 && (
              <div style={{ marginTop: 2 }}>
                {pill(`${record._storeCount} stores`, "#eff6ff", "#1d4ed8", "#bfdbfe")}
              </div>
            )}
          </div>
        ),
      },
      {
        title: "Customer",
        key: "customer",
        width: 200,
        render: (_: unknown, record: Order) => {
          const guestFirst = record.guest_first_name;
          const guestLast  = record.guest_last_name;
          const guestFull  = record.guest_name;
          const fullName   = guestFirst || guestLast
            ? [guestFirst, guestLast].filter(Boolean).join(" ")
            : guestFull ?? null;
          return (
            <div style={{ lineHeight: 1.5 }}>
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0 }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: "#1a202c" }}>
                  {fullName ?? (
                    <UserName
                      userId={record.userId ?? record.user_id}
                      guestName={undefined}
                      isGuestOrder={record.is_guest_order}
                    />
                  )}
                </span>
                {record.is_guest_order && pill("Guest", "#fff7ed", "#c2410c", "#fed7aa")}
                {record.is_multi_seller && pill("Multi-Seller", "#eff6ff", "#1d4ed8", "#bfdbfe")}
              </div>
            </div>
          );
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 140,
        render: (val: string) => (
          <Tag
            color={STATUS_COLORS[val?.toLowerCase() ?? ""] ?? "default"}
            style={{ textTransform: "capitalize", fontSize: 12 }}
          >
            {(val ?? "-").replace(/_/g, " ")}
          </Tag>
        ),
      },
      {
        title: "Store",
        key: "store",
        width: 170,
        render: (_: unknown, record: Order) => {
          const display = record._combinedStore || record.storeDetails?.store_name || record.store?.store_name || "-";
          return (
            <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
              {display}
            </span>
          );
        },
      },
      {
        title: "Items",
        key: "items",
        width: 70,
        align: "center" as const,
        render: (_: unknown, record: Order) => {
          const n = record.totalItems ?? (Array.isArray(record.orderItems) ? record.orderItems.length : 0);
          return (
            <span style={{
              display: "inline-block", minWidth: 28, textAlign: "center",
              fontWeight: 600, fontSize: 13, color: "#374151",
              background: "#f3f4f6", borderRadius: 6, padding: "1px 7px",
            }}>
              {n}
            </span>
          );
        },
      },
      {
        title: "Grand Total",
        key: "grandTotal",
        width: 130,
        render: (_: unknown, record: Order) => (
          <span style={{ fontWeight: 700, fontSize: 13, color: "#111827", whiteSpace: "nowrap" }}>
            {sym} {formatCurrency(record.grandTotal ?? 0)}
          </span>
        ),
      },
      {
        title: "Date",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 150,
        render: (val: string) => (
          <div style={{ lineHeight: 1.4 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>
              {val ? dayjs(val).format("DD MMM YYYY") : "-"}
            </div>
            {val && (
              <div style={{ fontSize: 11, color: "#9ca3af" }}>
                {dayjs(val).format("HH:mm")}
              </div>
            )}
          </div>
        ),
      },
    ],
    [sym],
  );

  const navigate = (record: Order) => {
    const id = record?.order_id ?? record?.id ?? record?._id;
    route.push("/auth/orders/" + id);
  };

  const renderMobileCards = () => (
    <div className="dashboard-tableMobile">
      {data.length === 0 ? (
        <div className="dashboard-tableMobileEmpty">
          <MdHourglassEmpty size={40} color="#999" />
          <p style={{ color: "#666", marginTop: 12 }}>No Orders yet</p>
        </div>
      ) : (
        data.map((order, index) => {
          const key = String(order.order_id ?? order.id ?? order._id ?? index);
          const guestFirst = order.guest_first_name;
          const guestLast  = order.guest_last_name;
          const nameDisplay = guestFirst || guestLast
            ? [guestFirst, guestLast].filter(Boolean).join(" ")
            : order.guest_name ?? order.name;

          return (
            <div
              key={key}
              className="dashboard-tableMobileCard"
              onClick={() => navigate(order)}
              style={{ cursor: "pointer" }}
            >
              <div className="dashboard-tableMobileHeader">
                <div className="dashboard-tableMobileTitle" style={{ flex: 1, minWidth: 0 }}>
                  <div className="title" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0 }}>
                    <span>
                      {nameDisplay ?? (
                        <UserName
                          userId={order.userId ?? order.user_id}
                          isGuestOrder={order.is_guest_order}
                        />
                      )}
                    </span>
                    {order.is_guest_order && pill("Guest", "#fff7ed", "#c2410c", "#fed7aa")}
                    {order.is_multi_seller && pill("Multi-Seller", "#eff6ff", "#1d4ed8", "#bfdbfe")}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Tag
                      color={STATUS_COLORS[order.status?.toLowerCase() ?? ""] ?? "default"}
                      style={{ textTransform: "capitalize", fontSize: 11 }}
                    >
                      {(order.status ?? "-").replace(/_/g, " ")}
                    </Tag>
                  </div>
                </div>
                <FiChevronRight size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
              </div>
              <div className="dashboard-tableMobileBody">
                <div className="dashboard-tableMobileRow">
                  <span className="label">Order ID</span>
                  <span className="value">
                    <span className="table__code">{order.order_id ?? "-"}</span>
                  </span>
                </div>
                <div className="dashboard-tableMobileRow">
                  <span className="label">Store</span>
                  <span className="value">
                    {order._combinedStore || order.storeDetails?.store_name || order.store?.store_name || "-"}
                  </span>
                </div>
                <div className="dashboard-tableMobileRow">
                  <span className="label">Items</span>
                  <span className="value">
                    {order.totalItems ?? (Array.isArray(order.orderItems) ? order.orderItems.length : 0)}
                  </span>
                </div>
                <div className="dashboard-tableMobileRow">
                  <span className="label">Grand Total</span>
                  <span className="value table__amount">
                    {sym} {formatCurrency(order.grandTotal ?? 0)}
                  </span>
                </div>
                <div className="dashboard-tableMobileRow">
                  <span className="label">Date</span>
                  <span className="value table__date">
                    {order.createdAt ? dayjs(order.createdAt).format("DD MMM YYYY") : "-"}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="dashboard-table-container">
      {isMobile ? (
        renderMobileCards()
      ) : (
        <Table
          dataSource={data}
          columns={columns}
          pagination={false}
          size="middle"
          rowKey={(record) => {
            const oid = String(record?.order_id ?? record?.id ?? record?._id ?? "unknown");
            const sid = String(record?.storeId ?? record?.store_id ?? "");
            return sid ? `${oid}::${sid}` : oid;
          }}
          scroll={{ x: 1000 }}
          onRow={(record) => ({
            onClick: () => navigate(record),
            style: { cursor: "pointer" },
          })}
          locale={{
            emptyText: (
              <div className="table__empty-state">
                <MdHourglassEmpty size={48} className="table__empty-icon" />
                <p className="table__empty-text">No Orders yet</p>
              </div>
            ),
          }}
        />
      )}
      <div className="table__pagination-container">
        <Pagination
          showSizeChanger
          pageSize={pageSize}
          current={page}
          total={count ?? 0}
          showTotal={() => `Total ${count ?? 0} Orders`}
          onChange={(nextPage, nextPageSize) => setPage(nextPage, nextPageSize)}
          className="table__pagination"
        />
      </div>
    </div>
  );
}

export default DataTable;
