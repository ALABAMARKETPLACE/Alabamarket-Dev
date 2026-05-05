"use client";
import { Button, Card, Form, Input, Typography, notification } from "antd";
import { useMutation } from "@tanstack/react-query";
import { PATCH } from "@/util/apicall";
import API from "@/config/API_ADMIN";

const { Text } = Typography;

function Security() {
  const [form] = Form.useForm();
  const [notifApi, contextHolder] = notification.useNotification();

  const { mutate: changePassword, isPending } = useMutation({
    mutationFn: (values: {
      oldPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => PATCH(API.ADMIN_CHANGE_PASSWORD, values as unknown as Record<string, unknown>),
    onSuccess: (res: any) => {
      if (res?.status === false) {
        notifApi.error({ message: res?.message || "Failed to change password." });
        return;
      }
      notifApi.success({ message: "Password changed successfully." });
      form.resetFields();
    },
    onError: (err: any) => {
      notifApi.error({ message: err?.message || "Failed to change password. Please try again." });
    },
  });

  return (
    <>
      {contextHolder}
      <Card style={{ maxWidth: 480 }}>
        <div style={{ marginBottom: 20 }}>
          <Text strong style={{ fontSize: 15 }}>Change Password</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 13 }}>
            Update your admin account password. You'll need your current password to confirm.
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={(v) => changePassword(v)}
        >
          <Form.Item
            name="oldPassword"
            label="Current Password"
            rules={[{ required: true, message: "Current password is required" }]}
          >
            <Input.Password size="large" placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: "New password is required" },
              { min: 8, message: "At least 8 characters" },
            ]}
          >
            <Input.Password size="large" placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your new password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value)
                    return Promise.resolve();
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="Confirm new password" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            size="large"
            block
          >
            Change Password
          </Button>
        </Form>
      </Card>
    </>
  );
}

export default Security;
