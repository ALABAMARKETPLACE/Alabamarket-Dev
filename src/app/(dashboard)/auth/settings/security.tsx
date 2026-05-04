"use client";
import { useState } from "react";
import { Button, Card, Form, Input, Result, Typography, notification } from "antd";
import { useMutation } from "@tanstack/react-query";
import { POST } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import { MdOutlineLockReset } from "react-icons/md";

const { Text } = Typography;

function Security() {
  const [notifApi, contextHolder] = notification.useNotification();
  const [sentEmail, setSentEmail] = useState("");

  const { mutate: sendReset, isPending } = useMutation({
    mutationFn: (email: string) =>
      POST(API.ADMIN_FORGOT_PASSWORD, { email } as unknown as Record<string, unknown>),
    onSuccess: (res: any, email) => {
      if (res?.status === false) {
        notifApi.error({ message: res?.message || "Failed to send reset email." });
        return;
      }
      setSentEmail(email);
    },
    onError: (err: any) => {
      notifApi.error({ message: err?.message || "Failed to send reset email. Please try again." });
    },
  });

  return (
    <>
      {contextHolder}
      <Card style={{ maxWidth: 480 }}>
        {sentEmail ? (
          <Result
            icon={<MdOutlineLockReset size={52} color="#6d28d9" />}
            title="Check your inbox"
            subTitle={
              <>
                A password reset link has been sent to{" "}
                <strong>{sentEmail}</strong>. Click the link in the email to
                set a new password.
              </>
            }
            extra={
              <Button onClick={() => setSentEmail("")}>
                Use a different email
              </Button>
            }
          />
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <Text strong style={{ fontSize: 15 }}>
                Reset Admin Password
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 13 }}>
                Enter your admin email address. We'll send you a secure link
                to set a new password.
              </Text>
            </div>

            <Form
              layout="vertical"
              requiredMark={false}
              onFinish={(v) => sendReset(v.email)}
            >
              <Form.Item
                name="email"
                label="Admin Email"
                rules={[
                  { required: true, message: "Email is required" },
                  { type: "email", message: "Enter a valid email address" },
                ]}
              >
                <Input size="large" placeholder="your-email@example.com" />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={isPending}
                size="large"
                block
              >
                Send Reset Email
              </Button>
            </Form>
          </>
        )}
      </Card>
    </>
  );
}

export default Security;
