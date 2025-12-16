import { Button, Card, Form, Modal, Steps, notification } from "antd";
import TextArea from "antd/es/input/TextArea";
import moment from "moment";
import React, { useState } from "react";
import API from "../../../../../../config/API";
import { PUT } from "../../../../../../util/apicall";
import { useSelector } from "react-redux";
import Meta from "antd/es/card/Meta";
import { reduxSettings } from "../../../../../../redux/slice/settingsSlice";
import SubstitutionModal from "./substitutionModal";

const { Step } = Steps;

function OrderStatusCard(props: any) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [Notifications, contextHolder] = notification.useNotification();
  const Settings = useSelector(reduxSettings);
  const [openModal, setOpenModal] = useState(false);
  const cancelOrder = async (values: any) => {
    const url = API.ORDER_CANCEL + props?.data?.id;
    try {
      setLoading(true);
      const response: any = await PUT(url, values);
      if (response.status) {
        Notifications["success"]({
          message: response?.message ?? "",
        });
        setOpen(false);
        form.resetFields();
        props?.getOrderDetails();
      } else {
        Notifications["error"]({
          message: response?.message ?? "",
        });
      }
    } catch (err) {
      Notifications["error"]({
        message: "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {contextHolder}
      <div className="d-flex gap-3 flex-column">
        <Card bordered={false}>
          <Meta
            // title={`PaymentType: ${props?.data?.orderPayment?.paymentType ?? ""}`}
            description={
              <div className="text-dark d-flex flex-column flex-lg-row gap-3">
                <div className="col-md-6">
                  <div>
                    PaymentType:{" "}
                    <span className="fw-bold">
                      {props?.data?.orderPayment?.paymentType ?? ""}
                    </span>
                  </div>
                  <div>
                    Total ProductPrice:{Number(props?.data?.total)?.toFixed(2)}{" "}
                    {Settings.currency}
                  </div>
                  <div>
                    Tax: {Number(props?.data?.tax)?.toFixed(2)}{" "}
                    {Settings.currency}
                  </div>
                  <div>
                    Discount: {Number(props?.data?.discount)?.toFixed(2)}{" "}
                    {Settings.currency}
                  </div>
                  <div>
                    Delivery Charge:{" "}
                    {Number(props?.data?.deliveryCharge)?.toFixed(2)}{" "}
                    {Settings.currency}
                  </div>
                  <div>
                    Grand Total: {Number(props?.data?.grandTotal)?.toFixed(2)}
                    {Settings.currency}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="fw-bold">
                    Payment status:{" "}
                    <span
                      className={
                        props?.data?.orderPayment?.status == "pending"
                          ? "text-secondary"
                          : props?.data?.orderPayment?.status == "failed"
                          ? "text-danger"
                          : props?.data?.orderPayment?.status == "success"
                          ? "text-success"
                          : "text-warning"
                      }
                    >
                      {props?.data?.orderPayment?.status}
                    </span>
                  </div>
                  <div className="fw-bold">
                    {props?.data?.orderPayment?.ref
                      ? "Amount Paid"
                      : "Total Price"}
                    : {Number(props?.data?.orderPayment?.amount)?.toFixed(2)}
                    {Settings.currency}
                  </div>
                  {props?.data?.orderPayment?.ref ? (
                    <div className=" fw-bold">
                      Payment Reference: {props?.data?.orderPayment?.ref}
                    </div>
                  ) : null}

                  <div>
                    orderDate:{" "}
                    {moment(props?.data?.orderPayment?.createdAt).format(
                      "DD/MM/YYYY"
                    )}
                  </div>
                  <div>Order ID: {props?.data?.order_id}</div>
                </div>
              </div>
            }
          />
        </Card>
        <Card bordered={false}>
          <div>
            <div className="d-flex justify-content-end">
              {props?.data.status == "pending" ? (
                <Button danger onClick={() => setOpen(true)}>
                  Cancel Order
                </Button>
              ) : null}
              {props?.data?.orderSubstitution?.length ? (
                <Button
                  className="bg-warning"
                  onClick={() => setOpenModal(true)}
                >
                  Substitute
                </Button>
              ) : null}
            </div>
            <p>
              Expected Delivery Date:
              <span className="text-success">
                {props?.data?.delivery_date
                  ? moment(props?.data?.delivery_date).format(
                      "MMMM Do YYYY, h:mm:ss a"
                    )
                  : ""}
              </span>
            </p>
            <hr />
            {Array.isArray(props?.data?.orderStatus) == true ? (
              <Steps
                direction="vertical"
                current={props?.data?.orderStatus?.length}
              >
                {props?.data?.orderStatus.map(
                  (statusUpdate: any, index: number) => (
                    <Step
                      key={index}
                      title={statusUpdate.status}
                      description={
                        <>
                          <div>
                            {moment(statusUpdate.createdAt).format(
                              "DD/MM/YYYY"
                            )}
                          </div>
                          <div>{statusUpdate.remark}</div>
                        </>
                      }
                    />
                  )
                )}
              </Steps>
            ) : null}
          </div>
        </Card>
      </div>
      <Modal
        title="Cancel Your Order"
        open={open}
        onOk={() => form.submit()}
        confirmLoading={loading}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        centered
        okText="Confirm"
      >
        <Form layout="vertical" form={form} onFinish={cancelOrder}>
          <Form.Item
            label="Reason for Cancellation"
            name={"remark"}
            rules={[
              {
                required: true,
                message: "Please enter reason for order cancellation",
              },
            ]}
          >
            <TextArea rows={3} />
          </Form.Item>
        </Form>
        <p style={{ fontSize: "12px", marginBottom: 0 }}>
          Once you cancel your order, The order will not be processed by the
          seller and The amount will be refunded to your Bank account within 2
          days if any amount is debited.
        </p>
      </Modal>
      <SubstitutionModal
        open={openModal}
        close={() => setOpenModal(false)}
        data={props?.data}
        getOrderDetails={props?.getOrderDetails}
      />
    </>
  );
}

export default OrderStatusCard;
