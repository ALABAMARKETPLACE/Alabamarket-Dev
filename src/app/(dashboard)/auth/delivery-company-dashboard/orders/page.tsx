"use client";
import React, { useState } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { Tabs, Badge } from "antd";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import OrderList from "../_components/orderList";
import AcceptedOrders from "../_components/acceptedOrders";

function OrdersPage() {
  const { data: session } = useSession();
  const companyId = (session as any)?.user?.delivery_company_id;
  const [activeTab, setActiveTab] = useState("available");

  // Get count for available orders badge
  const { data: allOrders } = useQuery({
    queryFn: ({ signal }) =>
      GET(API.DELIVERY_ORDERS_ALL, {}, signal),
    queryKey: ["all_orders"],
  });

  // Get count for accepted orders badge
  const { data: acceptedOrders } = useQuery({
    queryFn: ({ signal }) =>
      GET(`delivery/company/${companyId}/orders/accepted-with-drivers`, {}, signal),
    queryKey: ["accepted_orders_with_drivers", companyId],
    enabled: !!companyId,
  });

  const allOrdersData = allOrders?.data?.data || allOrders?.data || [];
  const availableCount = allOrdersData.filter((order: any) => !order.delivery_company_id).length;
  // Handle both nested and flat response structures for accepted orders count
  const acceptedOrdersData = acceptedOrders?.data?.data || acceptedOrders?.data || [];
  const acceptedCount = acceptedOrdersData.length;

  const tabItems = [
    {
      key: "available",
      label: (
        <span>
          Available Orders{" "}
          {availableCount > 0 && (
            <Badge count={availableCount} style={{ marginLeft: 4 }} />
          )}
        </span>
      ),
      children: <OrderList companyId={companyId} />,
    },
    {
      key: "accepted",
      label: (
        <span>
          Accepted Orders{" "}
          {acceptedCount > 0 && (
            <Badge count={acceptedCount} style={{ marginLeft: 4, backgroundColor: "#52c41a" }} />
          )}
        </span>
      ),
      children: <AcceptedOrders companyId={companyId} />,
    },
  ];

  return (
    <>
      <PageHeader
        title={"Orders"}
        bredcume={"Dashboard / Delivery Company / Orders"}
      />
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={tabItems}
      />
    </>
  );
}

export default OrdersPage;

