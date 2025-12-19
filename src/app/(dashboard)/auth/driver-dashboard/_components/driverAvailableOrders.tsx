"use client";
import React from "react";
import { Table, Button, Tag, message, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GET, POST } from "@/util/apicall";
import API from "@/config/API";
import Loading from "@/app/(dashboard)/_components/loading";

const { Text } = Typography;

interface Props {
  driverId: number;
}

function DriverAvailableOrders({ driverId }: Props) {
  const queryClient = useQueryClient();

  const { data: availableOrders, isLoading } = useQuery({
    queryFn: ({ signal }) =>
      GET(`${API.DELIVERY_DRIVER_AVAILABLE_ORDERS}${driverId}/orders/available`, {}, signal),
    queryKey: ["driver_available_orders", driverId],
    enabled: !!driverId,
  });

  const selectOrderMutation = useMutation({
    mutationFn: (orderId: number) =>
      POST(`${API.DELIVERY_DRIVER_SELECT_ORDER}${driverId}/order/${orderId}/select`, {}),
    onSuccess: (res: any) => {
      message.success(res?.message || "Order selected successfully");
      queryClient.invalidateQueries({ queryKey: ["driver_available_orders", driverId] });
      queryClient.invalidateQueries({ queryKey: ["driver_pending_orders", driverId] });
      queryClient.invalidateQueries({ queryKey: ["driver_orders", driverId] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || "Failed to select order");
    },
  });

  const handleSelectOrder = (orderId: number) => {
    selectOrderMutation.mutate(orderId);
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
      title: "Delivery Address",
      key: "address",
      width: 300,
      render: (_, record) => {
        const address = record.address;
        if (!address) return "-";
        return (
          <div>
            <Text strong>{address.full_name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {address.address_line}, {address.city}, {address.state}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Phone: {address.phone}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Total",
      dataIndex: "grandTotal",
      key: "grandTotal",
      width: 120,
      render: (value) => `$${value?.toFixed(2) || "0.00"}`,
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
          out_for_delivery: "purple",
          picked_up: "green",
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
          onClick={() => handleSelectOrder(record.id)}
          loading={selectOrderMutation.isPending}
        >
          Select Order
        </Button>
      ),
    },
  ];

  if (isLoading) return <Loading />;

  // Handle both nested and flat response structures
  const orders = availableOrders?.data?.data || availableOrders?.data || [];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Showing {orders.length} available orders from your company
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
    </>
  );
}

export default DriverAvailableOrders;
