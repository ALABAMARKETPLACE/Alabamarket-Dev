"use client";
import React, { useState, useEffect } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import Loading from "@/app/(dashboard)/_components/loading";
import ErrorDisplay from "@/app/(dashboard)/_components/error";
import { Tag, Button, Table, Select, Tooltip, notification } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import {
  FiRefreshCw,
  FiUser,
  FiPackage,
  FiChevronRight,
  FiFilter,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";

interface GuestOrderItem {
  id?: number | string;
  order_id?: string;
  is_guest_order?: boolean;
  status?: string;
  guest_email?: string;
  guest_first_name?: string;
  guest_last_name?: string;
  guest_phone?: string;
  store?: { id?: number | string; store_name?: string };
  items?: Array<Record<string, unknown>>;
  totalItems?: number;
  grandTotal?: number;
  payment?: {
    status?: string;
    ref?: string;
    transaction_reference?: string;
  };
  createdAt?: string;
}

interface PaginationMeta {
  itemCount?: number;
  totalCount?: number;
  total?: number;
  totalPages?: number;
  pageCount?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  page?: number;
  take?: number;
}

interface GuestOrdersResponse {
  statusCode?: number;
  status: boolean;
  message?: string;
  data?: {
    rows?: GuestOrderItem[];
    meta?: PaginationMeta;
    // some endpoints wrap meta at this level
    itemCount?: number;
    totalPages?: number;
    pageCount?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  } | GuestOrderItem[]; // guard for flat-array shape
  meta?: PaginationMeta;
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
  failed: "red",
  substitution: "gold",
  waiting_refund: "volcano",
};

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Statuses" },
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

const SORT_OPTIONS = [
  { value: "createdAt", label: "Date" },
  { value: "grandTotal", label: "Grand Total" },
  { value: "status", label: "Status" },
];

const PAGE_SIZE = 20;

const columns: ColumnsType<GuestOrderItem> = [
  {
    title: "Order ID",
    dataIndex: "order_id",
    key: "order_id",
    width: 160,
    render: (val) => <span className="table__code">{val ?? "-"}</span>,
  },
  {
    title: "Guest",
    key: "guest",
    width: 190,
    render: (_, row) => (
      <div>
        <div style={{ fontWeight: 600, fontSize: 13 }}>
          {[row.guest_first_name, row.guest_last_name].filter(Boolean).join(" ") || "-"}
        </div>
        <div style={{ fontSize: 11, color: "#718096" }}>{row.guest_email}</div>
        {row.guest_phone && (
          <div style={{ fontSize: 11, color: "#718096" }}>{row.guest_phone}</div>
        )}
      </div>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 150,
    render: (val) => (
      <Tag color={STATUS_COLORS[val ?? ""] ?? "default"} style={{ textTransform: "capitalize" }}>
        {(val ?? "-").replace(/_/g, " ")}
      </Tag>
    ),
  },
  {
    title: "Store",
    key: "store",
    width: 150,
    render: (_, row) => (
      <span style={{ fontSize: 13 }}>{row.store?.store_name ?? "-"}</span>
    ),
  },
  {
    title: "Items",
    key: "items",
    width: 70,
    align: "center",
    render: (_, row) => row.totalItems ?? row.items?.length ?? 0,
  },
  {
    title: "Grand Total",
    key: "grandTotal",
    width: 140,
    render: (_, row) => (
      <span className="table__amount">₦{(row.grandTotal ?? 0).toLocaleString("en-NG")}</span>
    ),
  },
  {
    title: "Payment",
    key: "paymentStatus",
    width: 110,
    render: (_, row) => (
      <Tag color={row.payment?.status === "success" ? "green" : "orange"}>
        {row.payment?.status ?? "-"}
      </Tag>
    ),
  },
  {
    title: "Date",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 150,
    render: (val) => (
      <span className="table__date">
        {val ? dayjs(val).format("DD MMM YYYY HH:mm") : "-"}
      </span>
    ),
  },
];

function Page() {
  const { data: sessionData, status: authStatus } = useSession();
  const session = sessionData as CustomSession | null;
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [page, setPage] = useState(1);

  const userRole = session?.role;
  const userType = session?.user?.type || session?.type;
  const isSeller = userRole === "seller" || userType === "seller";

  const endpoint = isSeller ? API.ORDER_GUEST_STORE : API.ORDER_GUEST_ALL;

  const queryParams: Record<string, unknown> = {
    page,
    take: PAGE_SIZE,
    order: sortOrder,
    sort: sortField,
  };
  if (statusFilter) queryParams.status = statusFilter;

  const queryKey = [endpoint, page, statusFilter, sortField, sortOrder];

  const {
    data: ordersRaw,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      console.log("[GuestOrders] Fetching:", endpoint, queryParams);
      const res = await GET(endpoint, queryParams, null, { token: session?.token });
      console.log("[GuestOrders] Response:", res);
      return res;
    },
    enabled: authStatus === "authenticated" && !!session?.token,
    retry: false,
  });

  useEffect(() => {
    if (isError && error) {
      const msg = (error as Error)?.message ?? "Failed to load guest purchases.";
      console.error("[GuestOrders] Error:", msg);
      notification.error({ message: "Failed to load guest purchases", description: msg, duration: 6 });
    }
  }, [isError, error]);

  const orders = ordersRaw as GuestOrdersResponse | undefined;

  // Response shape: { data: { rows: [...], meta?: {...} } }
  // Guard against flat-array shape for forward-compat
  const dataBlock = orders?.data;
  const rows: GuestOrderItem[] = Array.isArray(dataBlock)
    ? dataBlock
    : Array.isArray((dataBlock as any)?.rows)
    ? (dataBlock as any).rows
    : [];

  // Meta may live at data.meta, data (flat fields), or response root
  const metaBlock: PaginationMeta =
    (dataBlock as any)?.meta ??
    orders?.meta ??
    dataBlock ??
    {};

  const totalCount =
    metaBlock.itemCount ??
    metaBlock.totalCount ??
    metaBlock.total ??
    (metaBlock.totalPages ?? metaBlock.pageCount ?? 1) * PAGE_SIZE;

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleSortFieldChange = (val: string) => {
    setSortField(val);
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "DESC" ? "ASC" : "DESC"));
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="Guest Purchases"
        bredcume={`Dashboard / Guest Purchases${isSeller ? " (My Store)" : ""}`}
        icon={<FiPackage />}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* Status filter */}
          <Select
            value={statusFilter}
            onChange={handleStatusChange}
            options={STATUS_FILTER_OPTIONS}
            style={{ width: 160 }}
            suffixIcon={<FiFilter size={13} />}
            size="middle"
            placeholder="Filter by status"
          />

          {/* Sort field */}
          <Select
            value={sortField}
            onChange={handleSortFieldChange}
            options={SORT_OPTIONS}
            style={{ width: 130 }}
            size="middle"
          />

          {/* ASC / DESC toggle */}
          <Tooltip title={sortOrder === "DESC" ? "Newest first — click for oldest" : "Oldest first — click for newest"}>
            <Button
              size="middle"
              icon={sortOrder === "DESC" ? <FiArrowDown size={14} /> : <FiArrowUp size={14} />}
              onClick={toggleSortOrder}
            >
              {sortOrder}
            </Button>
          </Tooltip>

          <Button
            onClick={() => refetch()}
            loading={isFetching && !isLoading}
            icon={<FiRefreshCw />}
          >
            Refresh
          </Button>
        </div>
      </PageHeader>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorDisplay
          description={(error as Error)?.message}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hide-tablet" style={{ marginBottom: 24 }}>
            <Table
              columns={columns}
              dataSource={rows}
              rowKey={(r) => String(r.id ?? r.order_id)}
              pagination={{
                pageSize: PAGE_SIZE,
                current: page,
                total: totalCount,
                showSizeChanger: false,
                showTotal: (total) => `${total} guest orders`,
                onChange: (p) => setPage(p),
              }}
              loading={isFetching}
              scroll={{ x: 1000 }}
              onRow={(r) => ({
                onClick: () => router.push(`/auth/guest-orders/${r.id}`),
                style: { cursor: "pointer" },
              })}
              locale={{
                emptyText: (
                  <div className="table__empty-state">
                    <FiPackage className="table__empty-icon" />
                    <p className="table__empty-text">No guest purchases found.</p>
                  </div>
                ),
              }}
            />
          </div>

          {/* Mobile Cards */}
          <div className="dashboard-tableMobile">
            {rows.length === 0 ? (
              <div className="dashboard-tableMobileEmpty">No guest purchases found.</div>
            ) : (
              rows.map((o) => (
                <div
                  key={String(o.id ?? o.order_id)}
                  className="dashboard-tableMobileCard"
                  onClick={() => router.push(`/auth/guest-orders/${o.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="dashboard-tableMobileHeader">
                    <div className="dashboard-tableMobileImage">
                      <FiUser
                        size={24}
                        color="#718096"
                        style={{ margin: "auto", display: "block", marginTop: 10 }}
                      />
                    </div>
                    <div className="dashboard-tableMobileTitle" style={{ flex: 1, minWidth: 0 }}>
                      <div className="title">
                        {[o.guest_first_name, o.guest_last_name].filter(Boolean).join(" ") || "Guest"}
                      </div>
                      <div className="sub">{o.guest_email}</div>
                      <div className="sub">{o.guest_phone}</div>
                      <div style={{ marginTop: 6 }}>
                        <Tag
                          color={STATUS_COLORS[o.status ?? ""] ?? "default"}
                          style={{ textTransform: "capitalize", fontSize: 11 }}
                        >
                          {(o.status ?? "-").replace(/_/g, " ")}
                        </Tag>
                      </div>
                    </div>
                    <FiChevronRight size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
                  </div>
                  <div className="dashboard-tableMobileBody">
                    <div className="dashboard-tableMobileRow">
                      <span className="label">Order ID</span>
                      <span className="value">
                        <span className="table__code">{o.order_id ?? "-"}</span>
                      </span>
                    </div>
                    <div className="dashboard-tableMobileRow">
                      <span className="label">Grand Total</span>
                      <span className="value table__amount">
                        ₦{(o.grandTotal ?? 0).toLocaleString("en-NG")}
                      </span>
                    </div>
                    <div className="dashboard-tableMobileRow">
                      <span className="label">Store</span>
                      <span className="value">{o.store?.store_name ?? "-"}</span>
                    </div>
                    <div className="dashboard-tableMobileRow">
                      <span className="label">Items</span>
                      <span className="value">{o.totalItems ?? o.items?.length ?? 0}</span>
                    </div>
                    <div className="dashboard-tableMobileRow">
                      <span className="label">Payment</span>
                      <span className="value">
                        <Tag color={o.payment?.status === "success" ? "green" : "orange"}>
                          {o.payment?.status ?? "-"}
                        </Tag>
                      </span>
                    </div>
                    <div className="dashboard-tableMobileRow">
                      <span className="label">Date</span>
                      <span className="value table__date">
                        {o.createdAt ? dayjs(o.createdAt).format("DD MMM YYYY") : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Mobile pagination */}
            {totalCount > PAGE_SIZE && (
              <div style={{ display: "flex", justifyContent: "center", gap: 12, padding: "16px 0" }}>
                <Button
                  size="small"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span style={{ fontSize: 13, color: "#6b7280", alignSelf: "center" }}>
                  Page {page} of {Math.ceil(totalCount / PAGE_SIZE)}
                </span>
                <Button
                  size="small"
                  disabled={page >= Math.ceil(totalCount / PAGE_SIZE)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default Page;
