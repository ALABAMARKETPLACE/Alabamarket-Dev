"use client";
import React, { useEffect, useState } from "react";
import Loading from "../../../../../components/loading";
import NoData from "../../../../../components/noData";
import { FiShoppingBag } from "react-icons/fi";
import API from "../../../../../config/API";
import { useParams } from "next/navigation";
import { notification, Tabs, TabsProps } from "antd";
import { GET } from "../../../../../util/apicall";
import ProductItems from "./_components/productItems";
import OrderStatusCard from "./_components/orderStatus";

function Page() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>({});
  const [Notifications, contextHolder] = notification.useNotification();

  const getOrderDetails = async () => {
    const url = API.ORDER_GETONE_USER + params.id;
    if (params.id) {
      try {
        const response: any = await GET(url);
        if (response?.status) {
          setOrder(response?.data);
        } else {
          Notifications["error"]({
            message: response?.message ?? "",
            description:
              "The order you selected doesn't exist.. please contact admin for more info..",
          });
        }
      } catch (err) {
        Notifications["error"]({
          message: "Something went wrong.",
        });
      } finally {
        setLoading(false);
      }
    }
  };
  useEffect(() => {
    getOrderDetails();
  }, []);
  const onChange = (key: string) => {};
  const items: TabsProps["items"] = [
    {
      key: "products",
      label: "Products",
      children: <ProductItems data={order} getOrderDetails={getOrderDetails} />,
    },
    {
      key: "status",
      label: "Order Status",
      children: (
        <OrderStatusCard data={order} getOrderDetails={getOrderDetails} />
      ),
    },
  ];
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div>
      {contextHolder}
      {loading ? (
        <Loading />
      ) : order.id ? (
        <Tabs
          defaultActiveKey={"products"}
          items={items}
          onChange={onChange}
          className="mb-2"
        />
      ) : (
        <NoData
          icon={<FiShoppingBag size={70} color="#e6e6e6" />}
          header="No Order Found"
          text1={`The order you selected doesn't exist.`}
        />
      )}
    </div>
  );
}

export default Page;
