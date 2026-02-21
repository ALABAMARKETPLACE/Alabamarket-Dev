import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { PUT } from "@/util/apicall";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Modal, notification } from "antd";
import moment from "moment";
import { useState } from "react";
import API from "@/config/API_ADMIN";
import { formatCurrency } from "@/utils/formatNumber";
import { getActiveDeliveryPromo } from "@/config/promoConfig";

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
      <div className="d-flex flex-column gap-2">
        <div className="d-flex justify-content-between border-bottom pb-2">
          <span className="text-muted">Payment Type:</span>
          <span className="fw-medium text-capitalize">
            {(() => {
              // If a payment reference exists the order was paid online,
              // regardless of what paymentType is stored in the database.
              if (props?.data?.orderPayment?.ref) return "Online Payment";
              const type = props?.data?.orderPayment?.paymentType ?? "";
              if (type.toLowerCase().includes("cash")) return "Cash On Delivery";
              return type || "N/A";
            })()}
          </span>
        </div>

        <div className="d-flex justify-content-between">
          <span className="text-muted">Product Total:</span>
          <span>
            {settings.currency === "NGN" ? "₦" : settings.currency}{" "}
            {formatCurrency(props?.data?.total)}
          </span>
        </div>

        <div className="d-flex justify-content-between">
          <span className="text-muted">Tax:</span>
          <span>
            {settings.currency === "NGN" ? "₦" : settings.currency}{" "}
            {formatCurrency(props?.data?.tax)}
          </span>
        </div>

        <div className="d-flex justify-content-between">
          <span className="text-muted">Discount:</span>
          <span className="text-success">
            -{settings.currency === "NGN" ? "₦" : settings.currency}{" "}
            {formatCurrency(props?.data?.discount)}
          </span>
        </div>

        <div className="d-flex justify-content-between">
          <span className="text-muted">Delivery Charge:</span>
          <span>
            {getActiveDeliveryPromo() ? (
              <>
                <span className="text-success fw-bold me-2">FREE</span>
                <span className="text-decoration-line-through text-muted">
                  {settings.currency === "NGN" ? "₦" : settings.currency}{" "}
                  {formatCurrency(props?.data?.deliveryCharge)}
                </span>
              </>
            ) : (
              <>
                {settings.currency === "NGN" ? "₦" : settings.currency}{" "}
                {formatCurrency(props?.data?.deliveryCharge)}
              </>
            )}
          </span>
        </div>

        <div className="d-flex justify-content-between border-top pt-2 mt-1">
          <span className="fw-bold">Grand Total:</span>
          <span className="fw-bold fs-6">
            {settings.currency === "NGN" ? "₦" : settings.currency}{" "}
            {formatCurrency(
              getActiveDeliveryPromo()
                ? (props?.data?.grandTotal || 0) -
                    (props?.data?.deliveryCharge || 0)
                : props?.data?.grandTotal,
            )}
          </span>
        </div>

        <div className="bg-light p-3 rounded mt-3">
          <h6 className="mb-3 border-bottom pb-2">Payment Information</h6>
          <div className="d-flex flex-column gap-2">
            <div className="d-flex justify-content-between">
              <span className="text-muted">Status:</span>
              <span
                className={`badge ${props?.data?.orderPayment?.status === "success" ? "bg-success" : "bg-warning"} text-white fw-normal text-uppercase`}
              >
                {props?.data?.orderPayment?.status || "Pending"}
              </span>
            </div>

            <div className="d-flex justify-content-between">
              <span className="text-muted">
                {props?.data?.orderPayment?.ref ? "Amount Paid" : "Total Price"}
                :
              </span>
              <span className="fw-bold">
                {settings.currency === "NGN" ? "₦" : settings.currency}{" "}
                {formatCurrency(
                  getActiveDeliveryPromo()
                    ? (props?.data?.orderPayment?.amount || 0) -
                        (props?.data?.deliveryCharge || 0)
                    : props?.data?.orderPayment?.amount,
                )}
              </span>
            </div>

            {props?.data?.orderPayment?.ref && (
              <div className="d-flex justify-content-between">
                <span className="text-muted">Reference:</span>
                <span className="font-monospace small">
                  {props?.data?.orderPayment?.ref}
                </span>
              </div>
            )}

            <div className="d-flex justify-content-between">
              <span className="text-muted">Date:</span>
              <span>
                {moment(props?.data?.orderPayment?.createdAt).format(
                  DATE_FORMAT,
                )}
              </span>
            </div>

            <div className="d-flex justify-content-between">
              <span className="text-muted">Order ID:</span>
              <span className="font-monospace small">
                {props?.data?.order_id}
              </span>
            </div>
          </div>
        </div>
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
