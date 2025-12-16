"use client";
import React, { useRef } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import {
  Button,
  DatePicker,
  Input,
  notification,
  Popconfirm,
  Select,
  Tabs,
} from "antd";
import Details from "./_components/tabs/seller_details";
import SettlementSummary from "./_components/tabs/settlement_summary";
import SettlementHistory from "./_components/tabs/settlement_history";
import OrderHistory from "./_components/tabs/order_history";
import options from "./_components/json/order_status.json";
import API from "@/config/API_ADMIN";
import { useParams } from "next/navigation";
import { IoSearchOutline } from "react-icons/io5";
import orderTypes from "./_components/types/order_inputType";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PUT } from "@/util/apicall";
import SettlementModal from "./_components/modal/settlement";
import useCreateQueryString from "@/shared/hook/useCreateQueryString";
import setlements from "./_components/json/settlement_status.json";
import Products from "./_components/tabs/products";
import debounce from "@/shared/helpers/debounce";

function SellerDetails() {
  const { RangePicker } = DatePicker;
  const params = useParams();
  const [searchParams, setQuery] = useCreateQueryString();
  const activeTab = searchParams.get("tab") || "1";
  const settle = searchParams.get("settle") == "1" ? true : false;
  const settle_status = searchParams.get("settle_status") || "";
  const orderRef = useRef<orderTypes>(null);
  const quereyClient = useQueryClient();
  const [Notifications, contextHolder] = notification.useNotification();
  const debounceQuery = debounce((val: string) =>
    setQuery({ page: 1, query: val })
  );

  const {
    data: seller,
    isLoading,
    isError,
    error,
  } = useQuery<any>({
    queryKey: [API.STORE_INFO_ADMIN + params?.id, params?.id],
    select: (data: any) => {
      if (data?.status) return data?.data;
      return {};
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: (body: object) => PUT(API.STORE_DEACTIVATE + params?.id, {}),
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      Notifications["success"]({
        message: `Seller Status Updated Successfully`,
      });
      quereyClient.invalidateQueries({
        queryKey: [API.STORE_INFO_ADMIN + params?.id],
      });
      quereyClient.invalidateQueries({
        queryKey: ["admin_sellers"],
      });
    },
  });
  return (
    <>
      {contextHolder}
      <PageHeader
        title={"Seller Details"}
        bredcume={`Dashboard / Sellers / ${seller?.store_name}`}
      >
        {activeTab == "5" ? (
          <Input
            suffix={<IoSearchOutline />}
            placeholder="Search . . ."
            onChange={(e) => debounceQuery(e?.target?.value)}
          />
        ) : null}
        {activeTab == "3" ? (
          <Select
            defaultValue={settle_status}
            options={setlements}
            onChange={(v) => {
              setQuery({ page: 1, settle_status: v });
            }}
          />
        ) : null}
        {activeTab == "4" ? (
          <>
            <Input
              allowClear
              suffix={<IoSearchOutline />}
              placeholder="Search . . ."
              type="number"
              onChange={(e) => {
                orderRef?.current?.query(e?.target?.value);
              }}
            />
            <RangePicker
              className="w-100"
              onChange={(dates: any, dateString: string[]) => {
                orderRef?.current?.date(dateString[0], dateString[1]);
              }}
            />
            <Select
              defaultValue="Order Status"
              options={options}
              onChange={(v) => {
                orderRef?.current?.status(v);
              }}
            />
          </>
        ) : isLoading ? null : (
          <>
            <Popconfirm
              placement="bottomRight"
              title={`Are you sure to ${
                seller?.status == "approved" ? "Deactivate" : "Activate"
              } this Seller on Alaba Marketplace?`}
              okText="Yes"
              cancelText="No"
              onConfirm={() => mutationUpdate.mutate({})}
            >
              {seller?.status == "approved" ? (
                <Button
                  type="primary"
                  danger
                  loading={mutationUpdate.isPending}
                >
                  Deactivate Seller
                </Button>
              ) : (
                <Button
                  type="primary"
                  className="bg-success"
                  loading={mutationUpdate.isPending}
                >
                  Activate Seller
                </Button>
              )}
            </Popconfirm>

            <Button type="primary" onClick={() => setQuery({ settle: "1" })}>
              Settle Payments
            </Button>
          </>
        )}
      </PageHeader>
      <Tabs
        size="small"
        style={{ marginTop: -12 }}
        defaultActiveKey={activeTab}
        onChange={(key) => setQuery({ tab: key, page: 1, query: "" })}
      >
        <Tabs.TabPane tab={<span>Seller Informations</span>} key="1">
          <Details
            isLoading={isLoading}
            isError={isError}
            error={error}
            seller={seller}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab={<span>Settlement Summary</span>} key="2">
          <SettlementSummary id={params?.id as string} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={<span>Settlements</span>} key="3">
          <SettlementHistory id={params?.id as string} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={<span>Orders</span>} key="4">
          <OrderHistory id={params?.id as string} ref={orderRef} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={<span>Products</span>} key="5">
          <Products id={params?.id as string} />
        </Tabs.TabPane>
      </Tabs>
      <SettlementModal
        open={settle}
        close={() => setQuery({ settle: 0 })}
        storeId={Number(params?.id)}
      />
    </>
  );
}

export default SellerDetails;
