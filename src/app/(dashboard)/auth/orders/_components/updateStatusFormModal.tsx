import { Button, DatePicker, Form, Modal, notification, Select } from "antd";
import { useForm } from "antd/es/form/Form";
import orderStatus from "@/config/order_status.json";
import TextArea from "antd/es/input/TextArea";
import { Row, Col } from "react-bootstrap";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/config/API_ADMIN";
import { PUT } from "@/util/apicall";

type Props = {
  visible: boolean;
  onClose: () => void;
  status: string;
  id: any;
};
export default function UpdateStatusFormModal(props: Props) {
  const [form] = useForm();
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const mutationUpdate = useMutation({
    mutationFn: async (body: object) => {
      return PUT(API.ORDER_STATUS_UPDATE + props?.id, body);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      onClose();
      Notifications["success"]({
        message: `Order Status updated successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["order_details"] });
    },
  });
  const onClose = () => {
    props?.onClose();
    form.resetFields();
    mutationUpdate.reset();
  };
  return (
    <Modal
      title="Update Order Status"
      open={props?.visible}
      centered
      onCancel={() => props?.onClose()}
      footer={false}
    >
      {contextHolder}
      <Form
        form={form}
        onFinish={(val: any) => mutationUpdate.mutate(val)}
        layout="vertical"
        initialValues={{
          status: props?.status,
        }}
      >
        <Form.Item
          label={"Order Status"}
          required
          rules={[{ required: true, message: "Please Select Order Status" }]}
          name={"status"}
        >
          <Select options={orderStatus} size="large" />
        </Form.Item>

        <Form.Item
          label={"remark"}
          name={"remark"}
          rules={[{ required: true, message: "Please Enter Remarks" }]}
        >
          <TextArea rows={4} placeholder="Enter remark" size="large" />
        </Form.Item>
        <Form.Item
          label={"Select Expected Delivery date"}
          name={"delivery_date"}
          rules={[{ required: true, message: "Please Select Delivery Date" }]}
        >
          <DatePicker
            size="large"
            showTime
            placeholder="Select Expected Delivery date"
          />
        </Form.Item>
        <Row>
          <Col sm={6}></Col>
          <Col sm={6} className="d-flex gap-1">
            <Button block size="large" onClick={() => props.onClose()}>
              Close
            </Button>

            <Button
              htmlType="submit"
              block
              size="large"
              type="primary"
              loading={mutationUpdate.isPending}
            >
              Update Status
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
