"use client";
import React, { useState } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";
import { Input, Pagination, Select, Button, Tag, notification } from "antd";
import { useMutation } from "@tanstack/react-query";
import { POST } from "@/util/apicall";
import API from "@/config/API";
import dayjs from "dayjs";

interface GuestOrderItem {
  id?: number | string;
  order_id?: string;
  status?: string;
  guest_email?: string;
  guest_first_name?: string;
  guest_last_name?: string;
  guest_phone?: string;
  delivery_address?: Record<string, unknown>;
  items?: Array<Record<string, unknown>>;
  totalItems?: number;
  total?: number;
  deliveryCharge?: number;
  grandTotal?: number;
  payment?: {
    id?: number | string;
    paymentType?: string;
    status?: string;
    ref?: string;
    transaction_reference?: string;
    amount?: number;
  };
  delivery_date?: string;
  createdAt?: string;
}

interface GuestOrdersResponse {
  status: boolean;
  message?: string;
  data: GuestOrderItem[];
  meta?: {
    page?: number;
    take?: number;
    itemCount?: number;
    pageCount?: number;
    hasPreviousPage?: boolean;
    hasNextPage?: boolean;
  };
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
  const [notificationApi, contextHolder] = notification.useNotification();
  const [email, setEmail]           = useState("");
  const [orderId, setOrderId]       = useState("");
  const [name, setName]             = useState("");
  const [statusFilter, setStatus]   = useState("");
  const [sortField, setSortField]   = useState("createdAt");
  const [orderDir, setOrderDir]     = useState("DESC");
  const [page, setPage]             = useState(1);
  const [take, setTake]             = useState(10);
  const [committed, setCommitted]   = useState<Record<string, unknown> | null>(null);


  const {
    data: ordersRaw,
    isPending: isLoading,
    error,
    mutate: fetchOrders,
  } = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      POST(API.ORDER_GUEST_ORDERS, body),
    onSuccess: (res: any) => {
      const count = res?.meta?.itemCount ?? (Array.isArray(res?.data) ? res.data.length : 0);
      if (count === 0) {
        notificationApi.info({ message: "No orders found for this email." });
      } else {
        notificationApi.success({ message: `${count} order${count !== 1 ? "s" : ""} found.` });
      }
    },
    onError: (err: any) => {
      notificationApi.error({
        message: "Failed to fetch guest orders",
        description: err?.message ?? "Something went wrong. Please try again.",
      });
    },
  });

  const orders = ordersRaw as GuestOrdersResponse | undefined;
  const totalCount = orders?.meta?.itemCount ?? 0;
  const rows: GuestOrderItem[] = Array.isArray(orders?.data) ? orders.data : [];
  const isError = !!error;
  const isFetching = isLoading;

  const handleSearch = () => {
    if (!email.trim()) {
      notificationApi.warning({ message: "Please enter a guest email address to search." });
      return;
    }
    setPage(1);
    const body = {
      email: email.trim(),
      ...(orderId.trim() ? { order_id: orderId.trim() } : {}),
      ...(name.trim()    ? { name: name.trim() }        : {}),
      ...(statusFilter   ? { status: statusFilter }     : {}),
      sort:  sortField,
      order: orderDir,
      page: 1,
      take,
    };
    setCommitted(body);
    fetchOrders(body);
  };

  const handleReset = () => {
    setEmail(""); setOrderId(""); setName("");
    setStatus(""); setSortField("createdAt"); setOrderDir("DESC");
    setPage(1); setTake(10); setCommitted(null);
  };

  return (
    <>
      {contextHolder}
      <PageHeader title="Guest Orders" bredcume="Dashboard / Guest Orders">
        {/* ── Filter bar ── */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Input
            placeholder="Guest email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 240 }}
          />
          <Input
            placeholder="Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 180 }}
          />
          <Input
            placeholder="Guest name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 160 }}
          />
          <Select
            allowClear
            placeholder="Status"
            value={statusFilter || undefined}
            onChange={(v) => setStatus(v ?? "")}
            style={{ width: 150 }}
            options={[
              { value: "pending",          label: "Pending" },
              { value: "processing",       label: "Processing" },
              { value: "shipped",          label: "Shipped" },
              { value: "out_for_delivery", label: "Out for Delivery" },
              { value: "delivered",        label: "Delivered" },
              { value: "cancelled",        label: "Cancelled" },
            ]}
          />
          <Select
            value={sortField}
            onChange={setSortField}
            style={{ width: 150 }}
            options={[
              { value: "createdAt", label: "Date Created" },
              { value: "grandTotal", label: "Grand Total" },
              { value: "status",    label: "Status" },
            ]}
          />
          <Select
            value={orderDir}
            onChange={setOrderDir}
            style={{ width: 100 }}
            options={[
              { value: "DESC", label: "DESC" },
              { value: "ASC",  label: "ASC" },
            ]}
          />
          <Button type="primary" loading={isFetching} onClick={handleSearch}>
            Search
          </Button>
          <Button onClick={handleReset}>Reset</Button>
        </div>
      </PageHeader>

      {/* ── Body ── */}
      {!committed ? (
        <div style={{ padding: "32px 16px", color: "#888" }}>
          Enter a guest email address and click Search to load orders.
        </div>
      ) : isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={(error as Error)?.message} />
      ) : rows.length === 0 ? (
        <div style={{ padding: "32px 16px", color: "#888" }}>
          No guest orders found for the provided filters.
        </div>
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
                      <div>{[o.guest_first_name, o.guest_last_name].filter(Boolean).join(" ") || "-"}</div>
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

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <Pagination
              current={page}
              pageSize={take}
              total={totalCount}
              onChange={(p, t) => {
                setPage(p);
                setTake(t);
                if (committed) {
                  fetchOrders({ ...committed, page: p, take: t });
                }
              }}
              showSizeChanger
              showTotal={(total) => `${total} orders`}
              responsive
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Page;
