"use client";
import React, { useState } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { Tabs, Badge } from "antd";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import CompanyList from "./_components/companyList";
import InvitationsList from "./_components/invitationsList";
import DriverOrders from "./_components/driverOrders";
import DriverPendingOrders from "./_components/driverPendingOrders";
import DriverCompletedOrders from "./_components/driverCompletedOrders";
import DriverAvailableOrders from "./_components/driverAvailableOrders";

function DriverDashboard() {
  const { data: session } = useSession();
  const driverId = (session as any)?.user?.driver_id;
  const [activeTab, setActiveTab] = useState("invitations");

  // Get counts for badges
  const { data: pendingOrders } = useQuery({
    queryFn: ({ signal }) =>
      GET(`${API.DELIVERY_DRIVER_PENDING_ORDERS}${driverId}/orders/pending`, {}, signal),
    queryKey: ["driver_pending_orders", driverId],
    enabled: !!driverId,
  });

  const { data: availableOrders } = useQuery({
    queryFn: ({ signal }) =>
      GET(`${API.DELIVERY_DRIVER_AVAILABLE_ORDERS}${driverId}/orders/available`, {}, signal),
    queryKey: ["driver_available_orders", driverId],
    enabled: !!driverId,
  });

  // Get pending invitations count
  const { data: invitations } = useQuery({
    queryFn: ({ signal }) =>
      GET(`${API.INVITATION_DRIVER}${driverId}`, {}, signal),
    queryKey: ["driver_invitations", driverId],
    enabled: !!driverId,
  });

  // Handle both nested and flat response structures
  const pendingOrdersData = pendingOrders?.data?.data || pendingOrders?.data || [];
  const availableOrdersData = availableOrders?.data?.data || availableOrders?.data || [];
  const invitationsData = invitations?.data?.data || invitations?.data || [];
  const pendingCount = pendingOrdersData.length;
  const availableCount = availableOrdersData.length;
  // Only count company-initiated pending invitations (those the driver can act on)
  const pendingInvitationsCount = invitationsData.filter(
    (inv: any) => inv.status === "pending" && inv.initiated_by === "company"
  ).length;

  const tabItems = [
    {
      key: "invitations",
      label: (
        <span>
          My Invitations{" "}
          {pendingInvitationsCount > 0 && (
            <Badge count={pendingInvitationsCount} style={{ marginLeft: 4, backgroundColor: "#ff4d4f" }} />
          )}
        </span>
      ),
      children: <InvitationsList driverId={driverId} />,
    },
    {
      key: "pending",
      label: (
        <span>
          Pending Orders{" "}
          {pendingCount > 0 && (
            <Badge count={pendingCount} style={{ marginLeft: 4 }} />
          )}
        </span>
      ),
      children: <DriverPendingOrders driverId={driverId} />,
    },
    {
      key: "available",
      label: (
        <span>
          Available Orders{" "}
          {availableCount > 0 && (
            <Badge count={availableCount} style={{ marginLeft: 4, backgroundColor: "#52c41a" }} />
          )}
        </span>
      ),
      children: <DriverAvailableOrders driverId={driverId} />,
    },
    {
      key: "completed",
      label: "Completed Orders",
      children: <DriverCompletedOrders driverId={driverId} />,
    },
    {
      key: "all",
      label: "All My Orders",
      children: <DriverOrders driverId={driverId} />,
    },
    {
      key: "companies",
      label: "Delivery Companies",
      children: <CompanyList driverId={driverId} />,
    },
  ];

  return (
    <>
      <PageHeader
        title={"Driver Dashboard"}
        bredcume={"Dashboard / Driver"}
      />
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={tabItems}
      />
    </>
  );
}

export default DriverDashboard;

