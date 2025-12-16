"use client";
import {
  Avatar,
  Button,
  List,
  notification,
  Pagination,
  Select,
  Tag,
} from "antd";
import React, { useCallback, useState } from "react";
import { FaBoxOpen } from "react-icons/fa6";
import Search from "antd/es/input/Search";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import moment from "moment";
import API from "@/config/API";
import CONFIG from "@/config/configuration";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import { MdError } from "react-icons/md";
import { Suspense } from "react";
const actions = [
  { title: "Delivered", value: "delivered" },
  { title: "Cancelled", value: "cancelled" },
  { title: "Pending", value: "pending" },
];
const options = [
  { value: "30days", label: "last 30 days" },
  { value: "3months", label: "past 3 months" },
  { value: "6months", label: "past 6 months" },
  { value: "2023", label: "2023" },
];
const getVariantInfo = (data: any) => {
  let variantss = "";
  if (Array.isArray(data?.combination) == true) {
    data?.combination.map((item: any) => {
      variantss += `${item.value} `;
    });
  }
  return variantss;
};
function OrdersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserOrders />
    </Suspense>
  );
}

function UserOrders() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currpage = searchParams.get("page") || 1;
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(
    isNaN(Number(currpage)) ? 1 : Number(currpage)
  );
  const pageSize = 5;
  const router = useRouter();
  const [notificationApi, contextHolder] = notification.useNotification();
  const Settings = useAppSelector(reduxSettings);
  const [oderStatus, setOrderStatus] = useState("");

  const {
    data: orders,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryFn: async () =>
      await GET(API.ORDER_GET, {
        order: "DESC",
        page: page,
        take: pageSize,
        ...(search && { name: search }),
        status: oderStatus,
        sort: dateFilter,
      }),
    queryKey: ["order_items", page, search, oderStatus, dateFilter],
    retry: 1,
  });

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const changePage = async (page: number) => {
    setPage(page);
  };
  return (
    <>
      {contextHolder}
      <div className="profile-header">
        <div className="fs-5 fw-medium">
          My Orders ({orders?.meta?.itemCount ?? 0})
        </div>
        <div style={{ flex: 1 }} />
      </div>
      <hr />
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2">
        <div>
          {actions?.map((item: any, index: number) => (
            <Tag
              style={{ cursor: "pointer" }}
              color={item?.value == oderStatus ? CONFIG.COLOR : ""}
              onClick={() => {
                if (!isLoading) {
                  if (oderStatus == item?.value) {
                    setOrderStatus("");
                    return;
                  }
                  setOrderStatus(item?.value);
                  setPage(1);
                }
              }}
            >
              {item?.title}
            </Tag>
          ))}
        </div>
        {/* <div style={{ flex: 1 }} /> */}

        <div className="ms-auto d-flex gap-2">
          <Select
            defaultValue="Order Time"
            style={{ width: 130 }}
            options={options}
            onChange={(v) => setDateFilter(v)}
          />
          <Search
            placeholder="Search all Orders"
            allowClear
            enterButton="Search"
            size="middle"
            onSearch={(sear) => {
              setSearch(sear);
            }}
            // loading={searching}
          />
        </div>
        <div></div>
      </div>
      <div style={{ padding: 10 }} />
      {isLoading ? (
        <div></div>
      ) : Array.isArray(orders?.data) && orders?.data.length > 0 ? (
        <List
          className="demo-loadmore-list"
          loading={isLoading}
          itemLayout="horizontal"
          // loadMore={loadMore}
          dataSource={orders?.data}
          size="small"
          renderItem={(item: any) => (
            <List.Item
              onClick={() => router.push(`/user/orders/${item?.order_id}`)}
              className="order-list-item d-block d-md-flex"
              style={{ cursor: "pointer" }}
            >
              <List.Item.Meta
                key={4}
                className="mt-2"
                description={
                  Array.isArray(item?.orderItems)
                    ? item?.orderItems.map((orderItem: any, index: number) => (
                        <List.Item.Meta
                          key={index}
                          className="mt-2"
                          avatar={
                            <Avatar
                              shape="square"
                              src={orderItem?.image}
                              size={80}
                            />
                          }
                          title={
                            <>
                              <div className="text-capitalize d-block">{`${
                                orderItem?.name
                              } ${getVariantInfo(orderItem?.variantDetails)} (${
                                orderItem.quantity
                              } item)`}</div>
                              <div>
                                <span>Ordered on:</span>
                                <span className="text-success">{` ${moment(
                                  orderItem.createdAt
                                ).format("DD/MM/YYYY")}`}</span>
                              </div>
                              <div className="fw-bold">{`${
                                Number(orderItem?.totalPrice)?.toFixed(2) ?? ""
                              } ${Settings.currency ?? ""}`}</div>
                            </>
                          }
                        />
                      ))
                    : null
                }
              />
              <div className="d-flex justify-content-between d-md-block">
                <span className="fw-bold pe-2">
                  Total: {Number(item?.grandTotal)?.toFixed(2)}{" "}
                  {Settings.currency}
                </span>
                <Tag bordered={false}>{item?.status}</Tag>
              </div>
            </List.Item>
          )}
        ></List>
      ) : isError ? (
        <div></div>
      ) : (
        <div className="text-center my-4">
          <h3>No Orders Yet!!</h3>
          You have no orders. Please start shopping <br /> at Alaba Marketplace
          and place orders <br />
          <Button
            onClick={() => router.push("/")}
            className="mt-4 mb-4 py-2 border-none"
          >
            START SHOPPING NOW
          </Button>
        </div>
      )}

      <div className="d-flex justify-content-center mt-3">
        <Pagination
          current={page || 1}
          pageSize={pageSize || 10}
          total={orders?.meta?.itemCount || 0}
          defaultCurrent={1}
          responsive={true}
          defaultPageSize={pageSize || 10}
          disabled={false}
          hideOnSinglePage={true}
          onChange={(current: any, size: any) => {
            changePage(current);
          }}
        />
      </div>
    </>
  );
}

export default OrdersPage;
