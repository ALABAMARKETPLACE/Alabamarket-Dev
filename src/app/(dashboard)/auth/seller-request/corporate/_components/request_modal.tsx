import { useMutation } from "@tanstack/react-query";
import { Button, Form, Modal, notification } from "antd";
import TextArea from "antd/es/input/TextArea";
import React from "react";
import { POST } from "@/util/apicall";
import API from "@/config/API_ADMIN";
interface props {
  open: boolean;
  close: Function;
  data: Record<string, any>;
  requestEndpoint?: string; // optional override endpoint
}

function RequestDocument({ open, close, data, requestEndpoint }: props) {
  const [form] = Form.useForm();
  const [Notifications, contextHolder] = notification.useNotification();

  const mutationSendmail = useMutation({
    mutationFn: (body: object) =>
      POST(requestEndpoint || API.CORPORATE_STORE_REQUEST_DOCUMENT, body),
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      close();
      form.resetFields();
      Notifications["success"]({
        message: `Document Request sent successfully.`,
      });
    },
  });
  return (
    <Modal
      title={`Request More Documents`}
      open={open}
      okText="Request"
      centered
      cancelButtonProps={{ style: { display: "none" } }}
      okButtonProps={{ style: { display: "none" } }}
      onCancel={() => {
        close();
      }}
    >
      {contextHolder}
      <Form
        form={form}
        style={{ maxWidth: 600 }}
        layout="vertical"
        onFinish={(values) =>
          mutationSendmail.mutate({ ...values, id: data?.id })
        }
      >
        <Form.Item
          label="Message"
          name="subject"
          rules={[
            {
              required: true,
              message: "Please Enter Message",
            },
          ]}
        >
          <TextArea rows={4} placeholder="Message" />
        </Form.Item>
        <p>
          An email will be sent to{" "}
          <span className="fw-bold">{data?.email}</span>
        </p>
        <div className="d-flex gap-2 justify-content-end">
          <Button
            type="primary"
            loading={mutationSendmail.isPending}
            htmlType="submit"
          >
            {"Send Mail"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

export default RequestDocument;
