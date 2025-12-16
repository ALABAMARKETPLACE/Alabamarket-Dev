import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, Input, Modal, notification, Select } from "antd";
import React from "react";
import { POST } from "@/util/apicall";
import API from "@/config/API_ADMIN";
interface props {
  open: boolean;
  close: Function;
  storeId: number;
}

function SettlementModal({ open, close, storeId }: props) {
  const { Option } = Select;
  const [form] = Form.useForm();
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();

  const mutationCreate = useMutation({
    mutationFn: async (body: object) => {
      if (!storeId) throw new Error("Invalid Store ID");
      return POST(API.SETTLEMENT_CREATE, body);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      Notifications["success"]({
        message: `Settlement Added Successfully.`,
      });
      close();
      form.resetFields();
      queryClient.invalidateQueries({
        queryKey: ["admin_settlement_history_seller"],
      });
      queryClient.invalidateQueries({
        queryKey: [API.SETTLEMENT_SUMMARY + storeId],
      });
    },
  });

  const {
    data: settlement,
    isLoading,
    isError,
    error,
  } = useQuery<any>({
    queryKey: [API.SETTLEMENT_SUMMARY + storeId],
    select: (data) => {
      if (data?.status) return data?.data;
      return {};
    },
  });

  return (
    <Modal
      title="Settlement Amount"
      open={open}
      confirmLoading={mutationCreate.isPending}
      onCancel={() => close()}
      centered
      okText="Submit"
      onOk={() => form.submit()}
      loading={isLoading}
    >
      {contextHolder}

      <Form
        form={form}
        layout="vertical"
        onFinish={(val) => mutationCreate.mutate({ ...val, storeId })}
      >
        <Form.Item
          label={<>{`Enter Amount. `} </>}
          name={"paid"}
          rules={[
            {
              required: true,
              message: "Please Enter Amount",
            },
            {
              validator: (_, value) =>
                (value && value > settlement?.amountToSettle) || 0
                  ? Promise.reject(
                      new Error(
                        `Amount must be less than ${
                          settlement?.amountToSettle || 0
                        }`
                      )
                    )
                  : Promise.resolve(),
            },
          ]}
        >
          <Input type="number" size="large" />
        </Form.Item>
        <Form.Item
          label="Payment Type"
          name="payment_type"
          rules={[
            {
              required: true,
              message: "Please Select Payment Type",
            },
          ]}
        >
          <Select
            style={{ width: "100%" }}
            className="border rounded"
            allowClear
            size="large"
          >
            <Option value={"online"}>Online Payment</Option>
            <Option value={"cash_in_hand"}>Cash In hand</Option>
            <Option value={"bank_transfer"}>Bank Transfer</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Payment Status"
          name="status"
          rules={[
            {
              required: true,
              message: "Please Select Payment Status",
            },
          ]}
        >
          <Select
            style={{ width: "100%" }}
            className="border rounded"
            allowClear
            size="large"
          >
            <Option value={"requested"}>Requested</Option>
            <Option value={"pending"}>Pending</Option>
            <Option value={"success"}>Completed</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default SettlementModal;
