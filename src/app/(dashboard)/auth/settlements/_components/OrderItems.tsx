import React, { useEffect, useState } from "react";
// import SettlementOrders from "../components/orderItems";
// import API from "../../../config/API";
// import { GET } from "../../../utils/apiCalls";
import { notification } from "antd";
import API from "@/config/API";
import { GET } from "@/util/apicall";
import AdminLoading from "@/app/(dashboard)/_components/AdminLoading/page";
import SettlementOrders from "./order";
// import AdminLoading from "../../components/AdminLoading";

function SettlementScreen1() {
  const [Notifications, contextHolder] = notification.useNotification();
  const [orders, setOrders] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const getOrderCount = async () => {
    const url = API.ORDER_GETCOUNT;
    try {
      const response: any = await GET(url);
      if (response.status) {
        setOrders(response?.data);
      } else {
        Notifications["error"]({
          message: response?.message,
          description: "",
        });
      }
    } catch (err) {
      Notifications["error"]({
        message: "somethig went wrong..",
        description: "",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getOrderCount()
  }, []);
  return (
    <>
      {contextHolder}
      {loading ? <AdminLoading /> : <SettlementOrders order={orders}/>}
    </>
  );
}

export default SettlementScreen1;
