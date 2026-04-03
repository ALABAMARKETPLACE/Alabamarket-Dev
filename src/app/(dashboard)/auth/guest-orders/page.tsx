"use client";
import React from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";
import { Tag, Button, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { FiRefreshCw, FiUser, FiPackage, FiChevronRight } from "react-icons/fi";

interface GuestOrderItem {
  id?: number | string;
  order_id?: string;
  status?: string;
  guest_email?: string;
  guest_first_name?: string;
  guest_last_name?: string;
  guest_phone?: string;
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

interface GuestOrdersResponse {
  status: boolean;
  data: GuestOrderItem[];
  meta?: {
    itemCount?: number;
    pageCount?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
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
};

const columns: ColumnsType<GuestOrderItem> = [
  {
    title: "Order ID",
    dataIndex: "order_id",
    key: "order_id",
    width: 160,
    render: (val) => (
      <span className="table__code">{val ?? "-"}</span>
    ),
  },
  {
    title: "Guest",
    key: "guest",
    width: 180,
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
    width: 130,
    render: (val) => (
      <Tag color={STATUS_COLORS[val ?? ""] ?? "default"} style={{ textTransform: "capitalize" }}>
        {val ?? "-"}
      </Tag>
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
    width: 130,
    render: (_, row) => (
      <span className="table__amount">
        ₦{(row.grandTotal ?? 0).toLocaleString("en-NG")}
      </span>
    ),
  },
  {
    title: "Payment",
    key: "paymentStatus",
    width: 100,
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
    width: 140,
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

  const userRole = session?.role;
  const userType = session?.user?.type || session?.type;
  const isSeller = userRole === "seller" || userType === "seller";

  const endpoint = isSeller ? API.ORDER_GUEST_STORE : API.ORDER_GUEST_ALL;

  const { data: ordersRaw, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: [endpoint],
    queryFn: () => GET(endpoint, {}, null, { token: session?.token }),
    enabled: authStatus === "authenticated" && !!session?.token,
    retry: false,
  });

  const orders = ordersRaw as GuestOrdersResponse | undefined;
  const rows: GuestOrderItem[] = Array.isArray(orders?.data) ? orders.data : [];

  return (
    <>
      <PageHeader
        title="Guest Orders"
        bredcume={`Dashboard / Guest Orders${isSeller ? " (My Store)" : ""}`}
        icon={<FiPackage />}
      >
        <Button
          onClick={() => refetch()}
          loading={isFetching && !isLoading}
          icon={<FiRefreshCw />}
        >
          Refresh
        </Button>
      </PageHeader>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={(error as Error)?.message} />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hide-tablet" style={{ marginBottom: 24 }}>
            <Table
              columns={columns}
              dataSource={rows}
              rowKey={(r) => String(r.id ?? r.order_id)}
              pagination={{ pageSize: 20, showSizeChanger: false }}
              scroll={{ x: 1000 }}
              onRow={(r) => ({ onClick: () => router.push(`/auth/guest-orders/${r.id}`), style: { cursor: "pointer" } })}
              locale={{
                emptyText: (
                  <div className="table__empty-state">
                    <FiPackage className="table__empty-icon" />
                    <p className="table__empty-text">No guest orders found.</p>
                  </div>
                ),
              }}
            />
          </div>

          {/* Mobile Cards */}
          <div className="dashboard-tableMobile">
            {rows.length === 0 ? (
              <div className="dashboard-tableMobileEmpty">No guest orders found.</div>
            ) : (
              rows.map((o) => (
                <div key={String(o.id ?? o.order_id)} className="dashboard-tableMobileCard" onClick={() => router.push(`/auth/guest-orders/${o.id}`)} style={{ cursor: "pointer" }}>
                  <div className="dashboard-tableMobileHeader">
                    <div className="dashboard-tableMobileImage">
                      <FiUser size={24} color="#718096" style={{ margin: "auto", display: "block", marginTop: 10 }} />
                    </div>
                    <div className="dashboard-tableMobileTitle" style={{ flex: 1, minWidth: 0 }}>
                      <div className="title">
                        {[o.guest_first_name, o.guest_last_name].filter(Boolean).join(" ") || "Guest"}
                      </div>
                      <div className="sub">{o.guest_email}</div>
                      <div className="sub">{o.guest_phone}</div>
                      <div style={{ marginTop: 6 }}>
                        <Tag color={STATUS_COLORS[o.status ?? ""] ?? "default"} style={{ textTransform: "capitalize", fontSize: 11 }}>
                          {(o.status ?? "-").replace(/_/g, " ")}
                        </Tag>
                      </div>
                    </div>
                    <FiChevronRight size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
                  </div>
                  <div className="dashboard-tableMobileBody">
                    <div className="dashboard-tableMobileRow">
                      <span className="label">Order ID</span>
                      <span className="value"><span className="table__code">{o.order_id ?? "-"}</span></span>
                    </div>
                    <div className="dashboard-tableMobileRow">
                      <span className="label">Grand Total</span>
                      <span className="value table__amount">₦{(o.grandTotal ?? 0).toLocaleString("en-NG")}</span>
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
          </div>
        </>
      )}
    </>
  );
}

export default Page;
