"use client";

import { useCallback, useRef, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import PageHeader from "../../_components/pageHeader";
import { Button, DatePicker, Input, Tabs } from "antd";

import Corporate from "./_corporate";
import Individual from "./_individual";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";

type ResetType = {
  query: (query: string) => void;
  date: (query: string) => void;
};
function Page() {
  const [query, setQuery] = useState("");
  const [date, setDate] = useState<null | string>(null);
  const corporateRef = useRef<ResetType>(null);
  const individualRef = useRef<ResetType>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "1";

  const onChange = (key: string) => {
    corporateRef?.current?.query("");
    individualRef?.current?.query("");
    setQuery("");
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
    <div>
      <PageHeader
        title={"Seller Requests"}
        bredcume={"Dashboard / Seller Requests"}
      >
        <Input
          allowClear
          suffix={<IoSearchOutline />}
          placeholder="Search . . ."
          value={query}
          onChange={(e) => {
            setQuery(e?.target?.value);
            if (activeTab == "1") {
              corporateRef?.current?.query(e?.target?.value);
              return;
            }
            if (activeTab == "2") {
              individualRef?.current?.query(e?.target?.value);
              return;
            }
          }}
        />
      </PageHeader>
      <Tabs
        size="small"
        style={{ marginTop: -12 }}
        defaultActiveKey={activeTab}
        onChange={onChange}
      >
        <Tabs.TabPane tab={<span>Corporate Requests</span>} key="1">
          <Corporate query={query} date={date} ref={corporateRef} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={<span>Individual Requests</span>} key="2">
          <Individual query={query} date={date} ref={individualRef} />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

export default Page;
