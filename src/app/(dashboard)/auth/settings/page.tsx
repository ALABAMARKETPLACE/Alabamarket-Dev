"use client";
import React, { useEffect, useState } from "react";
import { Tabs } from "antd";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { useSearchParams } from "next/navigation";

import Settings from "./settings";
import Contacts from "./contacts";
import BusinessType from "./businessType";
import States from "./states";
import Countries from "./countries";
import NewDistanceChargePage from "./new-distance-charge/page";
import SubscriptionPlansPage from "./subscription-plans/page";

function Page() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("1");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const onChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <div>
      <PageHeader title={"Settings"} bredcume={"Dashboard / Settings"}>
        <div style={{ width: "400px" }}>
          <div style={{ fontSize: 12, color: "red" }}>
            {" "}
            Warning: Changing Settings in E-commerce Systems
          </div>
          <div style={{ fontSize: 10 }}>
            Making changes to settings in an e-commerce system can have
            significant impacts on your business operations.
          </div>
        </div>
      </PageHeader>
      <Tabs
        size="small"
        style={{ marginTop: -12 }}
        activeKey={activeTab}
        onChange={onChange}
      >
        <Tabs.TabPane tab={<span>Settings</span>} key="1">
          <Settings />
        </Tabs.TabPane>
        <Tabs.TabPane tab={<span>Contacts</span>} key="2">
          <Contacts />
        </Tabs.TabPane>
        <Tabs.TabPane tab={<span>Business Type</span>} key="3">
          <BusinessType />
        </Tabs.TabPane>
        <Tabs.TabPane tab={<span>States</span>} key="4">
          <States />
        </Tabs.TabPane>
        <Tabs.TabPane tab={<span>Countries</span>} key="5">
          <Countries />
        </Tabs.TabPane>
        <Tabs.TabPane tab={<span>Delivery Charges</span>} key="6">
          <NewDistanceChargePage />
        </Tabs.TabPane>
        <Tabs.TabPane tab={<span>Subscription Plans</span>} key="7">
          <SubscriptionPlansPage />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

export default Page;
