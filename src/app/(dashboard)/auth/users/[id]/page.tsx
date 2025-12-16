"use client";
import React, { useCallback } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { DatePicker, Select, Tabs } from "antd";
import UserDetails from "./_tabs/details";
import UserAddress from "./_tabs/addresses";
import UserOrders from "./_tabs/orders";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import options from "@/config/order_status.json";

function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = searchParams.get("tab") || "1";
  const { RangePicker } = DatePicker;

  const onChange = (key: string) => {
    router.replace(pathname + "?" + createQueryString("tab", key));
  };

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );
  return (
    <>
      <PageHeader
        title={"User Details"}
        bredcume={"Dashboard / User / Details"}
      >
        {activeTab == "3" ? (
          <>
            <RangePicker
              className="w-100"
              onChange={(dates: any, dateString: string[]) => {
                // setDate({ from: dateString[0], to: dateString[1] });
                // setPage(1);
              }}
            />
            <Select
              defaultValue="Order Status"
              options={options}
              onChange={(v) => {
                // setStatus(v);
                // setPage(1);
              }}
            />
          </>
        ) : null}
      </PageHeader>
      <Tabs
        size="small"
        style={{ marginTop: -12 }}
        defaultActiveKey={activeTab}
        onChange={onChange}
      >
        <Tabs.TabPane tab={<span>User Details</span>} key="1">
          <UserDetails />
        </Tabs.TabPane>
        <Tabs.TabPane tab={<span>Saved Addresses</span>} key="2">
          <UserAddress />
        </Tabs.TabPane>
        <Tabs.TabPane tab={<span>Orders</span>} key="3">
          <UserOrders />
        </Tabs.TabPane>
      </Tabs>
    </>
  );
}

export default Page;
