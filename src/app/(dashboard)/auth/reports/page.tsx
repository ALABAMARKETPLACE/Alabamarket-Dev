"use client";
import React, { useCallback } from "react";
import PageHeader from "../../_components/pageHeader";
import { Tabs, TabsProps } from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
const items: TabsProps["items"] = [
  {
    key: "product",
    label: "Product Report",
    children: "Content of Tab Pane 1",
  },
  {
    key: "order",
    label: "Order Report",
    children: "Content of Tab Pane 2",
  },
];
function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const acitveTab = searchParams.get("report") || null;
  const onChange = (key: string) => {
    router.replace(pathname + "?" + createQueryString("report", key));
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
      <PageHeader title={"Report"} bredcume={"Dashboard / Report"}>
        <div className="d-flex gap-3"></div>
      </PageHeader>
      <Tabs
        defaultActiveKey={acitveTab ?? "product"}
        items={items}
        onChange={onChange}
      />
    </>
  );
}

export default Page;
