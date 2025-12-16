import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Modal, notification, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import React from "react";
import { PUT } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import { useRouter } from "next/navigation";

interface props {
  open: boolean;
  close: Function;
  data: Record<string, any>;
  statusEndpoint?: string; // optional override endpoint base (must end with "/")
  invalidateKeys?: string[]; // optional extra react-query keys to invalidate
}

function ApproveModal({
  open,
  close,
  data,
  statusEndpoint,
  invalidateKeys = [],
}: props) {
  const [form] = Form.useForm();
  const [Notifications, contextHolder] = notification.useNotification();
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutationUpdate = useMutation({
    mutationFn: (body: object) =>
      PUT(
        (statusEndpoint || API.CORPORATE_STORE_UPDATE_STATUS) + data?.id,
        body
      ),
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      close();
      form.resetFields();
      Notifications["success"]({
        message: `Seller Status Updated Successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin_seller_request"] });
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
      router.replace("/auth/seller-request");
    },
  });
  return (
    <Modal
      title={"Approve or Reject Seller Request"}
      open={open}
      okText="Submit"
      centered
      confirmLoading={mutationUpdate.isPending}
      onOk={() => form.submit()}
      onCancel={() => close()}
    >
      {contextHolder}
      <Form
        form={form}
        style={{ maxWidth: 600 }}
        layout="vertical"
        onFinish={(value) => mutationUpdate.mutate(value)}
      >
        <Form.Item
          label="Status"
          name="status"
          rules={[
            {
              required: true,
              message: "Please Select Status",
            },
          ]}
        >
          <Select
            className="w-100"
            size="large"
            defaultValue="Select Status"
            options={[
              { value: "approved", label: "Approve" },
              { value: "rejected", label: "Reject" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Remark"
          name="status_remark"
          rules={[
            {
              required: true,
              message: "Please Enter Remark",
            },
          ]}
        >
          <TextArea rows={4} placeholder="Remark" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ApproveModal;
