import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { PUT } from "@/util/apicall";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Modal, notification } from "antd";
import moment from "moment";
import { useState } from "react";
import API from "@/config/API_ADMIN";
type Props = {
  data: any;
};
export default function PaymentStatusTab(props: Props) {
  const DATE_FORMAT = "DD/MM/YYYY";
  const [Notifications, contextHolder] = notification.useNotification();
  const settings = useAppSelector(reduxSettings);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const mutationUpdate = useMutation({
    mutationFn: () => {
      return PUT(API.COMPLETE_PAYMENT + props?.data?.id, {});
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      setOpenModal(false);
      Notifications["success"]({
        message: "Payment status updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["order_details"] });
    },
  });

  return (
    <Card
      title={"Payment Status"}
      extra={
        props?.data?.orderPayment?.status != "success" &&
        props?.data?.paymentType == "pay-on-credit" ? (
          <Button onClick={() => setOpenModal(true)} type="primary">
            Complete Payment
          </Button>
        ) : null
      }
    >
      {contextHolder}
      <div>
        <div>Payment Type : {props?.data?.orderPayment?.paymentType ?? ""}</div>
        <div>
          Total ProductPrice : {Number(props?.data?.total)?.toFixed(2)}{" "}
          {settings.currency}
        </div>
        <div>
          Tax : {Number(props?.data?.tax)?.toFixed(2)} {settings.currency}
        </div>
        <div>
          Discount : {Number(props?.data?.discount)?.toFixed(2)}{" "}
          {settings.currency}
        </div>
        <div>
          Delivery Charge : {Number(props?.data?.deliveryCharge)?.toFixed(2)}{" "}
          {settings.currency}
        </div>
        <div>
          Grand Total : {Number(props?.data?.grandTotal)?.toFixed(2)}
          {settings.currency}
        </div>
        <hr />
        <div>Payment status : {props?.data?.orderPayment?.status}</div>
        <div>
          {props?.data?.orderPayment?.ref ? "Amount Paid" : "Total Price"}:{" "}
          {Number(props?.data?.orderPayment?.amount)?.toFixed(2)}
          {settings.currency}
        </div>
        {props?.data?.orderPayment?.ref ? (
          <div>Payment Reference : {props?.data?.orderPayment?.ref}</div>
        ) : null}
        <div>
          orderDate :
          {moment(props?.data?.orderPayment?.createdAt).format(DATE_FORMAT)}
        </div>
        <div>Order ID: {props?.data?.order_id}</div>
      </div>
      <Modal
        title="Complete The Payment"
        open={openModal}
        centered
        onOk={() => mutationUpdate.mutate()}
        onCancel={() => setOpenModal(false)}
        okText="Update"
        confirmLoading={mutationUpdate?.isPending}
      >
        <p>
          The payment will be successful after this. Click on Update if the
          payment is successfully Received for this Order.
        </p>
      </Modal>
    </Card>
  );
}
