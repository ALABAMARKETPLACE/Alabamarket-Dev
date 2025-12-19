"use client";
import React, { useState } from "react";
import { Tabs, Badge } from "antd";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import DriverList from "../_components/driverList";
import InvitationSection from "../_components/invitationSection";
import DriverRequests from "../_components/driverRequests";

function DriversPage() {
  const { data: session } = useSession();
  const companyId = (session as any)?.user?.delivery_company_id;
  const [activeTab, setActiveTab] = useState("my_drivers");

  // Get counts for badges
  const { data: companyDrivers } = useQuery({
    queryFn: ({ signal }) =>
      GET(`${API.DELIVERY_COMPANY_DRIVERS}${companyId}/drivers?approvedOnly=true`, {}, signal),
    queryKey: ["company_drivers_approved", companyId],
    enabled: !!companyId,
  });

  const { data: availableDrivers } = useQuery({
    queryFn: ({ signal }) =>
      GET(`${API.DELIVERY_COMPANY_DRIVERS_AVAILABLE}${companyId}/drivers/available`, {}, signal),
    queryKey: ["available_drivers", companyId],
    enabled: !!companyId,
  });

  // Get company invitations for badge count
  const { data: companyInvitations } = useQuery({
    queryFn: ({ signal }) =>
      GET(`${API.INVITATION_COMPANY}${companyId}`, {}, signal),
    queryKey: ["company_invitations", companyId],
    enabled: !!companyId,
  });

  const approvedCount = companyDrivers?.data?.data?.length || companyDrivers?.data?.length || 0;
  const availableCount = availableDrivers?.data?.data?.length || availableDrivers?.data?.length || 0;

  // Count pending driver-initiated requests
  const invitationsData = companyInvitations?.data?.data || companyInvitations?.data || [];
  const pendingDriverRequests = invitationsData.filter(
    (inv: any) => inv.status === "pending" && inv.initiated_by === "driver"
  ).length;

  const tabItems = [
    {
      key: "my_drivers",
      label: (
        <span>
          My Drivers{" "}
          {approvedCount > 0 && (
            <Badge count={approvedCount} style={{ marginLeft: 4, backgroundColor: "#52c41a" }} />
          )}
        </span>
      ),
      children: <DriverList companyId={companyId} />,
    },
    {
      key: "invite_drivers",
      label: (
        <span>
          Invite Drivers{" "}
          {availableCount > 0 && (
            <Badge count={availableCount} style={{ marginLeft: 4 }} />
          )}
        </span>
      ),
      children: <InvitationSection companyId={companyId} />,
    },
    {
      key: "driver_requests",
      label: (
        <span>
          Driver Requests{" "}
          {pendingDriverRequests > 0 && (
            <Badge count={pendingDriverRequests} style={{ marginLeft: 4, backgroundColor: "#faad14" }} />
          )}
        </span>
      ),
      children: <DriverRequests companyId={companyId} />,
    },
  ];

  return (
    <>
      <PageHeader
        title={"Drivers Management"}
        bredcume={"Dashboard / Delivery Company / Drivers"}
      />
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={tabItems}
      />
    </>
  );
}

export default DriversPage;

