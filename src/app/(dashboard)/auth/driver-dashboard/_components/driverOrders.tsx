"use client";
import React from "react";
import { Table, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import Loading from "@/app/(dashboard)/_components/loading";

interface Props {
  driverId: number;
}

function DriverOrders({ driverId }: Props) {
  const { data: driverOrders, isLoading } = useQuery({
    queryFn: ({ signal }) =>
      GET(`${API.DELIVERY_DRIVER_ORDERS}${driverId}/orders`, {}, signal),
    queryKey: ["driver_orders", driverId],
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
      width: 120,
      render: (code) => code || "-",
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
          delivered: "blue",
        };
        return <Tag color={colorMap[status] || "default"}>{status?.toUpperCase()}</Tag>;
      },
    },
  ];

  if (isLoading) return <Loading />;

  // Handle both nested and flat response structures
  const orders = driverOrders?.data?.data || driverOrders?.data || [];

  return (
    <Table
      columns={columns}
      dataSource={orders}
      rowKey="id"
      pagination={false}
    />
  );
}

export default DriverOrders;

