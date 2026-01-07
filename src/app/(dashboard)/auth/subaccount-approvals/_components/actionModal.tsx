import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Modal, notification, Select, Input } from "antd";
import React from "react";
import { PUT } from "@/util/apicall";
import API from "@/config/API_ADMIN";

const { TextArea } = Input;

interface Props {
  open: boolean;
  close: () => void;
  data: any;
}

function ActionModal({ open, close, data }: Props) {
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();

  const mutationUpdate = useMutation({
    mutationFn: (values: {
      status: "approved" | "rejected";
      status_remark?: string;
    }) => {
      const type = values.status === "approved" ? "approve" : "reject";
      const url = `${API.PAYSTACK_SUBACCOUNT_ACTION_BASE}${data.id}/${type}`;
      const payload =
        values.status === "rejected"
          ? { status_remark: values.status_remark }
          : {};
      return PUT(url, payload);
    },
    onError: (error: any) => {
      api.error({
        message: error.message || "Failed to update subaccount status",
      });
    },
    onSuccess: () => {
      close();
      form.resetFields();
      api.success({
        message: "Subaccount Status Updated Successfully",
      });
      queryClient.invalidateQueries({
        queryKey: ["admin_paystack_subaccounts_pending"],
      });
    },
  });

  const handleSubmit = (values: any) => {
    mutationUpdate.mutate(values);
  };

  return (
    <Modal
      title="Approve or Reject Subaccount"
      open={open}
      okText="Submit"
      centered
      confirmLoading={mutationUpdate.isPending}
      onOk={() => form.submit()}
      onCancel={close}
    >
      {contextHolder}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ status: "Select Status" }}
      >
        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: "Please Select Status" }]}
        >
          <Select
            size="large"
            placeholder="Select Status"
            options={[
              { value: "approved", label: "Approve" },
              { value: "rejected", label: "Reject" },
            ]}
          />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.status !== currentValues.status
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("status") === "rejected" ? (
              <Form.Item
                label="Remark"
                name="status_remark"
                rules={[{ required: true, message: "Please Enter Remark" }]}
              >
                <TextArea rows={4} placeholder="Remark" />
              </Form.Item>
            ) : null
          }
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ActionModal;
