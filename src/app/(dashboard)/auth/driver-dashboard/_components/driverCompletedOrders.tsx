"use client";
import React from "react";
import { Table, Tag, Typography, Image } from "antd";
import { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import Loading from "@/app/(dashboard)/_components/loading";

const { Text } = Typography;

interface Props {
  driverId: number;
}

function DriverCompletedOrders({ driverId }: Props) {
  const { data: completedOrders, isLoading } = useQuery({
    queryFn: ({ signal }) =>
      GET(`${API.DELIVERY_DRIVER_COMPLETED_ORDERS}${driverId}/orders/completed`, {}, signal),
    queryKey: ["driver_completed_orders", driverId],
    enabled: !!driverId,
  });

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
      width: 250,
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
          </div>
        );
      },
    },
    {
      title: "Total",
      dataIndex: "grandTotal",
      key: "grandTotal",
      width: 100,
      render: (value) => `$${value?.toFixed(2) || "0.00"}`,
    },
    {
      title: "Delivery Image",
      dataIndex: "delivery_image",
      key: "delivery_image",
      width: 120,
      render: (imageUrl) =>
        imageUrl ? (
          <Image
            src={imageUrl}
            alt="Delivery proof"
            width={60}
            height={60}
            style={{ objectFit: "cover", borderRadius: 4 }}
          />
        ) : (
          "-"
        ),
    },
    {
      title: "Delivery Note",
      dataIndex: "delivery_description",
      key: "delivery_description",
      width: 200,
      render: (desc) => desc || "-",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color="green">{status?.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Delivered At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 150,
      render: (date) => date ? new Date(date).toLocaleString() : "-",
    },
  ];

  if (isLoading) return <Loading />;

  // Handle both nested and flat response structures
  const orders = completedOrders?.data?.data || completedOrders?.data || [];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Showing {orders.length} completed deliveries
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
        scroll={{ x: 1200 }}
      />
    </>
  );
}

export default DriverCompletedOrders;
