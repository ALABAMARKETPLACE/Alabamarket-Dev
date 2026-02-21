"use client";
import React, { useMemo, useEffect, useState } from "react";
import { Button, Table, Pagination, Avatar, Tooltip } from "antd";
import { FiEye, FiPackage, FiUser, FiCalendar } from "react-icons/fi";
import { MdHourglassEmpty } from "react-icons/md";
import moment from "moment";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/formatNumber";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import { getActiveDeliveryPromo } from "@/config/promoConfig";

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
  // Guest order fields
  is_guest_order?: boolean;
  guest_email?: string;
  guest_name?: string;
  guest_phone?: string;
  // Multi-seller order fields
  is_multi_seller?: boolean;
  stores?: (string | number)[];
  // Checkout session reference — shared across all store sub-orders from the same checkout
  parent_order_id?: string;
  // Payment reference
  payment_ref?: string;
  paymentRef?: string;
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
  data: {
    name?: string;
  };
}

const UserName = ({
  userId,
  guestName,
  isGuestOrder,
}: {
  userId: number | null | undefined;
  guestName?: string;
  isGuestOrder?: boolean;
}) => {
  const initialName =
    guestName ??
    (isGuestOrder ? "Guest" : userId == null ? "N/A" : "Loading...");
  const [name, setName] = useState<string>(initialName);

  useEffect(() => {
    let isMounted = true;
    if (!guestName && !isGuestOrder && userId != null) {
      GET(API.USER_DETAILS + userId)
        .then((res: unknown) => {
          const userRes = res as UserResponse;
          if (isMounted) {
            setName(userRes?.data?.name || "N/A");
          }
        })
        .catch(() => {
          if (isMounted) {
            setName("N/A");
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [userId, guestName, isGuestOrder]);

  return <span>{name}</span>;
};

const getStatusBadge = (status: string) => {
  const statusLower = status?.toLowerCase();
  if (statusLower === "delivered")
    return "dashboard-badge dashboard-badge--success";
  if (statusLower === "cancelled")
    return "dashboard-badge dashboard-badge--danger";
  if (statusLower === "pending")
    return "dashboard-badge dashboard-badge--warning";
  if (
    ["processing", "shipped", "out_for_delivery", "out for delivery"].includes(
      statusLower,
    )
  ) {
    return "dashboard-badge dashboard-badge--info";
  }
  return "dashboard-badge dashboard-badge--default";
};

function DataTable({ data, count, setPage, pageSize, page }: DataTableProps) {
  const route = useRouter();
  const Settings = useAppSelector(reduxSettings);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const currencySymbol = Settings.currency === "NGN" ? "₦" : Settings.currency;

  const columns = useMemo(
    () => [
      {
        title: "Order",
        dataIndex: "order_id",
        key: "order_id",
        render: (orderId: string, record: Order) => (
          <div className="table__user-cell">
            <Avatar
              size={44}
              src={record.image || undefined}
              icon={!record.image && <FiPackage />}
              shape="square"
              style={{
                backgroundColor: !record.image ? "#f0f0f0" : undefined,
                color: !record.image ? "#999" : undefined,
                borderRadius: 8,
              }}
            />
            <div>
              <div className="table__user-name">
                #{orderId || "N/A"}
                {record.is_guest_order && (
                  <span
                    className="dashboard-badge dashboard-badge--warning"
                    style={{ marginLeft: 8, fontSize: 10 }}
                  >
                    Guest
                  </span>
                )}
                {record.is_multi_seller && (
                  <span
                    className="dashboard-badge dashboard-badge--info"
                    style={{ marginLeft: 4, fontSize: 10 }}
                  >
                    Multi-Seller
                  </span>
                )}
              </div>
              <div className="table__text--secondary" style={{ fontSize: 12 }}>
                <FiUser size={12} style={{ marginRight: 4 }} />
                {record?.name ? (
                  record.name
                ) : (
                  <UserName
                    userId={record.userId ?? record.user_id}
                    guestName={record.guest_name}
                    isGuestOrder={record.is_guest_order}
                  />
                )}
              </div>
            </div>
          </div>
        ),
      },
      {
        title: "Date",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (date: string) => (
          <div className="table__date">
            <FiCalendar size={14} style={{ marginRight: 6 }} />
            {moment(date).format("MMM DD, YYYY")}
          </div>
        ),
        responsive: ["md"] as ("xs" | "sm" | "md" | "lg" | "xl" | "xxl")[],
      },
      {
        title: "Items",
        key: "orderItems",
        render: (_: unknown, record: Order) => {
          const count =
            record.totalItems ??
            (Array.isArray(record.orderItems) ? record.orderItems.length : 0);
          return (
            <span className="dashboard-badge dashboard-badge--info">
              {count} items
            </span>
          );
        },
        responsive: ["lg"] as ("xs" | "sm" | "md" | "lg" | "xl" | "xxl")[],
      },
      {
        title: "Total",
        dataIndex: "grandTotal",
        key: "grandTotal",
        render: (total: number, record: Order) => (
          <div className="table__amount">
            {currencySymbol}{" "}
            {formatCurrency(
              getActiveDeliveryPromo()
                ? (total || 0) - (record.deliveryCharge || 0)
                : total || 0,
            )}
          </div>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status: string) => (
          <span className={getStatusBadge(status)}>
            <span className="dashboard-badge__dot" />
            {status || "N/A"}
          </span>
        ),
      },
      {
        title: "Action",
        width: 80,
        render: (_: unknown, record: Order) => (
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              className="table__action-btn"
              onClick={() => {
                // Use order_id (the reference number) for navigation - backend expects this
                const orderId = record?.order_id ?? record?.id ?? record?._id;
                route.push("/auth/orders/" + orderId);
              }}
              icon={<FiEye size={18} />}
            />
          </Tooltip>
        ),
      },
    ],
    [route, currencySymbol],
  );

  // Mobile Card View renderer
  const renderMobileCardView = () => (
    <div className="dashboard-mobile-cards">
      {data.length === 0 ? (
        <div className="dashboard-mobile-card">
          <div style={{ padding: 40, textAlign: "center" }}>
            <MdHourglassEmpty size={40} color="#999" />
            <p style={{ color: "#666", marginTop: 16 }}>No Orders yet</p>
          </div>
        </div>
      ) : (
        data.map((order: Order, index: number) => {
          const orderId = String(order.order_id ?? order.id ?? order._id ?? index);
          const storeId = String(order.storeId ?? order.store_id ?? "");
          const cardKey = storeId ? `${orderId}::${storeId}` : orderId;
          return (
          <div
            key={cardKey}
            className="dashboard-mobile-card"
          >
            <div className="dashboard-mobile-card__header">
              <div className="dashboard-mobile-card__avatar">
                <Avatar
                  size={48}
                  src={order.image || undefined}
                  icon={!order.image && <FiPackage />}
                  shape="square"
                  style={{
                    backgroundColor: !order.image ? "#f0f0f0" : undefined,
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>
              <div className="dashboard-mobile-card__title-group">
                <h4 className="dashboard-mobile-card__title">
                  #{order.order_id || "N/A"}
                  {order.is_guest_order && (
                    <span
                      className="dashboard-badge dashboard-badge--warning"
                      style={{ marginLeft: 6, fontSize: 10 }}
                    >
                      Guest
                    </span>
                  )}
                </h4>
                <p className="dashboard-mobile-card__subtitle">
                  {order?.name || (
                    <UserName
                      userId={order.userId ?? order.user_id}
                      guestName={order.guest_name}
                      isGuestOrder={order.is_guest_order}
                    />
                  )}
                </p>
              </div>
              <span className={getStatusBadge(order.status || "")}>
                {order.status || "N/A"}
              </span>
            </div>
            <div className="dashboard-mobile-card__body">
              <div className="dashboard-mobile-card__row">
                <span className="dashboard-mobile-card__label">Date</span>
                <span className="dashboard-mobile-card__value">
                  {moment(order.createdAt).format("MMM DD, YYYY")}
                </span>
              </div>
              <div className="dashboard-mobile-card__row">
                <span className="dashboard-mobile-card__label">Items</span>
                <span className="dashboard-mobile-card__value">
                  {order.totalItems ?? (Array.isArray(order.orderItems) ? order.orderItems.length : 0)} items
                </span>
              </div>
              <div className="dashboard-mobile-card__row">
                <span className="dashboard-mobile-card__label">Total</span>
                <span
                  className="dashboard-mobile-card__value"
                  style={{ fontWeight: 600, color: "#10b981" }}
                >
                  {currencySymbol}{" "}
                  {formatCurrency(
                    getActiveDeliveryPromo()
                      ? (order.grandTotal || 0) - (order.deliveryCharge || 0)
                      : order.grandTotal || 0,
                  )}
                </span>
              </div>
            </div>
            <div className="dashboard-mobile-card__footer">
              <Button
                type="primary"
                ghost
                block
                icon={<FiEye />}
                onClick={() =>
                  route.push(
                    "/auth/orders/" +
                      (order?.order_id ?? order?.id ?? order?._id),
                  )
                }
              >
                View Details
              </Button>
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
        renderMobileCardView()
      ) : (
        <Table
          dataSource={data}
          columns={columns}
          pagination={false}
          size="middle"
          rowKey={(record) => {
            const orderId = String(record?.order_id ?? record?.id ?? record?._id ?? "unknown");
            const storeId = String(record?.storeId ?? record?.store_id ?? "");
            return storeId ? `${orderId}::${storeId}` : orderId;
          }}
          scroll={{ x: "max-content" }}
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
          showTotal={() => `Total ${data.length} Orders`}
          onChange={(nextPage, nextPageSize) => {
            setPage(nextPage, nextPageSize);
          }}
          className="table__pagination"
        />
      </div>
    </div>
  );
}

export default DataTable;
