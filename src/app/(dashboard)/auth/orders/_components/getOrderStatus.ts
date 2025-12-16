import orderStatus from "@/config/order_status.json";
export const getOrderStatus = (data: string) => {
  if (Array.isArray(orderStatus) === true) {
    const status: any = orderStatus.find((item: any) => item.value === data);
    return status?.label ? status.label : "";
  }
  return "";
};
