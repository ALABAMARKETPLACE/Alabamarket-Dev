"use client";
import React from "react";
import { Table, Button, Space, Tag, message, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GET, POST } from "@/util/apicall";
import API from "@/config/API";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";
import { useSession } from "next-auth/react";

const { Text } = Typography;

interface Props {
  companyId: number;
}

function OrderList({ companyId }: Props) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data: availableOrders, isLoading, error, refetch } = useQuery({
    queryFn: ({ signal }) =>
      GET(API.DELIVERY_ORDERS_ALL, {}, signal),
    queryKey: ["all_orders"],
  });

  const acceptOrderMutation = useMutation({
    mutationFn: (orderId: number) =>
      POST(`${API.DELIVERY_ORDER_ACCEPT}${orderId}/accept`, { company_id: companyId }),
    onSuccess: (res: any) => {
      message.success(res?.message || "Order accepted successfully");
      queryClient.invalidateQueries({ queryKey: ["all_orders"] });
      queryClient.invalidateQueries({ queryKey: ["accepted_orders_with_drivers", companyId] });
      queryClient.invalidateQueries({ queryKey: ["company_orders", companyId] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || "Failed to accept order");
    },
  });

  const handleAcceptOrder = (orderId: number) => {
    acceptOrderMutation.mutate(orderId);
  };

  const columns: ColumnsType<any> = [
    {
      title: "Order ID",
      dataIndex: "order_id",
      key: "order_id",
      width: 120,
    },
    {
      title: "Customer",
      key: "customer",
      width: 200,
      render: (_, record) => record.userDetails?.name || record.userDetails?.email || "-",
    },
    {
      title: "Total",
      dataIndex: "grandTotal",
      key: "grandTotal",
      width: 120,
      render: (value) => `$${value?.toFixed(2) || "0.00"}`,
    },
    {
      title: "Order OTP",
      dataIndex: "order_otp",
      key: "order_otp",
      width: 100,
      render: (otp) => otp ? <Text code>{otp}</Text> : "-",
    },
    {
      title: "Pickup Code",
      dataIndex: "pickup_code",
      key: "pickup_code",
      width: 100,
      render: (code) => code ? <Text code>{code}</Text> : "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const colorMap: Record<string, string> = {
          pending: "gold",
          packed: "blue",
          processing: "orange",
          out_for_delivery: "purple",
          picked_up: "green",
          delivered: "green",
          cancelled: "red",
        };
        return <Tag color={colorMap[status] || "default"}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleAcceptOrder(record.id)}
          loading={acceptOrderMutation.isPending}
        >
          Accept Order
        </Button>
      ),
    },
  ];

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <Tag color="red">Error loading orders</Tag>
        <p>{(error as any)?.message || "Failed to fetch available orders"}</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  // Extract orders from response - handle both nested and flat structures
  const allOrders = availableOrders?.data?.data || availableOrders?.data || [];

  // Filter to show only unaccepted orders (orders without delivery_company_id)
  const orders = allOrders.filter((order: any) => !order.delivery_company_id);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Showing {orders.length} available orders (orders not yet accepted by any delivery company)
        </Text>
      </div>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} orders`,
        }}
      />
    </div>
  );
}

export default OrderList;

