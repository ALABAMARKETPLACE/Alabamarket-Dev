"use client";
import React from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";
import { Tag, Button } from "antd";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";

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

function Page() {
  const { data: sessionData, status: authStatus } = useSession();
  const session = sessionData as CustomSession | null;

  const userRole = session?.role;
  const userType = session?.user?.type || session?.type;
  const isSeller = userRole === "seller" || userType === "seller";

  const endpoint = isSeller ? API.ORDER_GUEST_STORE : API.ORDER_GUEST_ALL;

  const { data: ordersRaw, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: [endpoint],
    queryFn: () =>
      GET(endpoint, {}, null, { token: session?.token }),
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
      >
        <Button onClick={() => refetch()} loading={isFetching && !isLoading}>
          Refresh
        </Button>
      </PageHeader>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={(error as Error)?.message} />
      ) : rows.length === 0 ? (
        <div style={{ padding: "32px 16px", color: "#888" }}>No guest orders found.</div>
      ) : (
        <div style={{ padding: 16 }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Guest</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Grand Total (₦)</th>
                  <th>Payment Ref</th>
                  <th>Payment Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={String(o.id ?? o.order_id)}>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>
                      {o.order_id ?? "-"}
                    </td>
                    <td>
                      <div>
                        {[o.guest_first_name, o.guest_last_name].filter(Boolean).join(" ") || "-"}
                      </div>
                      <div style={{ fontSize: 11, color: "#888" }}>{o.guest_email}</div>
                    </td>
                    <td>{o.guest_phone ?? "-"}</td>
                    <td>
                      <Tag color={STATUS_COLORS[o.status ?? ""] ?? "default"}>
                        {o.status ?? "-"}
                      </Tag>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {o.totalItems ?? o.items?.length ?? 0}
                    </td>
                    <td>₦{(o.grandTotal ?? 0).toLocaleString()}</td>
                    <td style={{ fontFamily: "monospace", fontSize: 11 }}>
                      {o.payment?.transaction_reference ?? o.payment?.ref ?? "-"}
                    </td>
                    <td>
                      <Tag color={o.payment?.status === "success" ? "green" : "orange"}>
                        {o.payment?.status ?? "-"}
                      </Tag>
                    </td>
                    <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                      {o.createdAt ? dayjs(o.createdAt).format("DD MMM YYYY HH:mm") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </>
  );
}

export default Page;
