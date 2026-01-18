import {
  Button,
  Card,
  Form,
  Modal,
  notification,
  Select,
  Steps,
  Timeline,
} from "antd";
import { useState } from "react";
import { getOrderStatus } from "./getOrderStatus";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PUT } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import moment from "moment";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { formatCurrency } from "@/utils/formatNumber";

type Props = {
  data: any;
};

export default function OrderStatusTab(props: Props) {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const queryClient = useQueryClient();
  const [Notifications, contextHolder] = notification.useNotification();
  const settings = useAppSelector(reduxSettings);

  const mutationUpdate = useMutation({
    mutationFn: () => {
      return PUT(API.ORDER_STATUS_UPDATE + props?.data?.id, { status });
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      setOpenModal(false);
      setStatus("");
      Notifications["success"]({
        message: "Order status updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["order_details"] });
    },
  });

  const getOrderStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      "": "#dfdddd",
      pending: "orange",
      cancelled: "red",
      shipped: "dodgerblue",
      out_for_delivery: "gold",
      packed: "blueviolet",
      delivered: "green",
      rejected: "crimson",
      processing: "skyblue",
      failed: "firebrick",
      substitution: "hotpink",
    };

    return statusColors[status] || "#dfdddd";
  };

  const getStepStatus = (currentStatus: string) => {
    const stepOrder = ["pending", "processing", "packed", "shipped", "out_for_delivery", "delivered"];
    const currentIndex = stepOrder.indexOf(currentStatus);
    
    if (currentStatus === "cancelled" || currentStatus === "rejected" || currentStatus === "failed") {
       return -1; // Special error state handling if needed
    }
    
    return currentIndex > -1 ? currentIndex : 0;
  };

  const stepsItems = [
    { title: 'Pending', description: 'Order Placed' },
    { title: 'Processing', description: 'Seller Accepted' },
    { title: 'Packed', description: 'Ready to Ship' },
    { title: 'Shipped', description: 'On the Way' },
    { title: 'Delivered', description: 'Completed' },
  ];

  return (
    <Card
      title="Order Status"
      extra={
        <Button onClick={() => setOpenModal(true)} type="primary">
          Update Status
        </Button>
      }
      className="h-100"
    >
      {contextHolder}
      <div className="d-flex flex-column gap-4">
        {/* Progress Steps */}
        <div className="px-2 pt-2 pb-4 overflow-x-auto">
           <Steps
             size="small"
             current={getStepStatus(props?.data?.status)}
             status={["cancelled", "rejected", "failed"].includes(props?.data?.status) ? "error" : "process"}
             items={stepsItems}
             direction="vertical"
             className="d-md-none" // Vertical on mobile
           />
           <Steps
             size="small"
             current={getStepStatus(props?.data?.status)}
             status={["cancelled", "rejected", "failed"].includes(props?.data?.status) ? "error" : "process"}
             items={stepsItems}
             className="d-none d-md-flex" // Horizontal on desktop
           />
        </div>

        {/* History Timeline */}
        <div>
           <h6 className="mb-3 text-muted">History</h6>
           {props?.data?.status_history?.length > 0 ? (
             <Timeline
               mode="left"
               items={props?.data?.status_history?.map((item: any) => ({
                 label: moment(item?.createdAt).format("DD/MM/YYYY HH:mm"),
                 children: (
                   <div className="d-flex flex-column">
                     <span className="fw-medium text-capitalize" style={{ color: getOrderStatusColor(item?.status) }}>
                       {getOrderStatus(item?.status)}
                     </span>
                     {item?.remark && <small className="text-muted">{item.remark}</small>}
                   </div>
                 ),
                 color: getOrderStatusColor(item?.status),
               }))}
             />
           ) : (
             <div className="text-center text-muted py-4">No status history available</div>
           )}
        </div>
      </div>

      <Modal
        title="Update Order Status"
        open={openModal}
        centered
        onOk={() => mutationUpdate.mutate()}
        onCancel={() => setOpenModal(false)}
        okText="Update"
        okButtonProps={{ disabled: !status }}
        confirmLoading={mutationUpdate?.isPending}
      >
        <div className="d-flex flex-column gap-3 py-3">
          <p className="mb-0 text-muted">Select the new status for this order:</p>
          <Select
            style={{ width: "100%" }}
            placeholder="Select Status"
            onChange={setStatus}
            value={status || undefined}
            options={[
              { value: "pending", label: "Pending" },
              { value: "processing", label: "Processing" },
              { value: "packed", label: "Packed" },
              { value: "shipped", label: "Shipped" },
              { value: "out_for_delivery", label: "Out For Delivery" },
              { value: "delivered", label: "Delivered" },
              { value: "cancelled", label: "Cancelled" },
            ]}
          />
        </div>
      </Modal>
    </Card>
  );
}
