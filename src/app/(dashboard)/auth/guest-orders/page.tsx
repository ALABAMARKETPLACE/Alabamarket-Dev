"use client";
import React, { useMemo, useState } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";
import { Input, Pagination, Select, Button } from "antd";
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

function Page() {
  const { data: sessionData, status } = useSession();
  const session = sessionData as { token?: string } | null;

  const [email, setEmail] = useState<string>(\"\");
  const [orderId, setOrderId] = useState<string>(\"\");
  const [statusFilter, setStatusFilter] = useState<string>(\"\");
  const [page, setPage] = useState<number>(1);
  const [take, setTake] = useState<number>(10);

  const params = useMemo(
    () => ({
      email,
      ...(orderId ? { order_id: orderId } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      page,
      take,
    }),
    [email, orderId, statusFilter, page, take],
  );

  const {
    data: ordersRaw,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryFn: ({ queryKey }) =>
      GET(
        queryKey[0] as string,
        queryKey[1] as Record<string, unknown>,
        null,
        { token: session?.token },
      ),
    queryKey: [API.ORDER_GUEST_ORDERS, params],
    enabled: status === "authenticated" && !!session?.token && !!email,
    retry: false,
  });

  const orders = ordersRaw as GuestOrdersResponse | undefined;
  const totalCount = orders?.meta?.itemCount ?? 0;
  const rows = Array.isArray(orders?.data) ? orders?.data : [];

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const renderTable = () => {
    if (!email) {
      return (
        <div style={{ padding: 16 }}>
          Enter a guest email and click Search to load orders.
        </div>
      );
    }
    if (isLoading) return <Loading />;
    if (isError) return <Error description={(error as Error)?.message} />;
    if (!rows.length) {
      return (
        <div style={{ padding: 16 }}>
          No guest orders found for the provided filters.
        </div>
      );
    }
    return (
      <div className="table-responsive" style={{ padding: 16 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Status</th>
              <th>Guest Email</th>
              <th>Total Items</th>
              <th>Grand Total (₦)</th>
              <th>Payment Ref</th>
              <th>Payment Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={String(o.id ?? o.order_id)}>
                <td>{o.order_id}</td>
                <td>{o.status}</td>
                <td>{o.guest_email}</td>
                <td>{o.totalItems ?? o.items?.length ?? 0}</td>
                <td>{(o.grandTotal ?? 0).toLocaleString()}</td>
                <td>{o.payment?.ref}</td>
                <td>{o.payment?.status}</td>
                <td>
                  {o.createdAt ? dayjs(o.createdAt).format("YYYY-MM-DD HH:mm") : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Pagination
            current={page}
            pageSize={take}
            total={totalCount}
            onChange={(p, t) => {
              setPage(p);
              setTake(t);
            }}
            showSizeChanger
            responsive
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <PageHeader title="Guest Orders" bredcume="Dashboard / Guest Orders">
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Input
            placeholder="Guest email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: 260 }}
          />
          <Input
            placeholder="Order ID (optional)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            allowClear
            placeholder="Status"
            value={statusFilter || undefined}
            onChange={(v) => setStatusFilter(v || "")}
            style={{ width: 160 }}
            options={[
              { value: "", label: "All" },
              { value: "pending", label: "Pending" },
              { value: "processing", label: "Processing" },
              { value: "delivered", label: "Delivered" },
              { value: "cancelled", label: "Cancelled" },
            ]}
          />
          <Button type="primary" loading={isFetching} onClick={handleSearch}>
            Search
          </Button>
        </div>
      </PageHeader>
      {renderTable()}
    </>
  );
}

export default Page;
