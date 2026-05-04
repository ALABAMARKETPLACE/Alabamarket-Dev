"use client";
export const dynamic = "force-dynamic";
import { Button, Form, Input, notification, Result } from "antd";
import { useState } from "react";
import { PUBLIC_POST } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import { useRouter, useParams } from "next/navigation";
import "../../forgot-password/style.scss";

function AdminAcceptInvite() {
  const [notifApi, contextHolder] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone]           = useState(false);
  const router = useRouter();
  const params = useParams();
  const token  = params?.token as string;

  const handleSubmit = async (values: {
    first_name: string;
    last_name: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      const res: any = await PUBLIC_POST(
        API.ADMIN_INVITE_ACCEPT,
        {
          token,
          password:   values.password,
          first_name: values.first_name,
          last_name:  values.last_name,
        },
        null,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res?.status === false) {
        notifApi.error({
          message: res?.message || "Failed to accept invitation. The link may have expired.",
        });
        return;
      }
      setDone(true);
    } catch (err: any) {
      notifApi.error({
        message: err?.message || "Unable to accept invitation. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="Screen-box">
      {contextHolder}
      <div className="auth-container">
        <div className="auth-form-side" style={{ padding: "28px 32px 24px" }}>
          {done ? (
            <Result
              status="success"
              title="Account Activated!"
              subTitle="Your admin account is ready. You can now sign in to the dashboard."
              extra={
                <Button
                  type="primary"
                  block
                  size="large"
                  className="btn-clr"
                  onClick={() => router.push("/auth/login")}
                >
                  Go to Login
                </Button>
              }
            />
          ) : (
            <>
              <h2 className="LoginScreen-txt1" style={{ fontSize: 20, marginBottom: 4 }}>
                Accept Admin Invite
              </h2>
              <p className="LoginScreen-txt2" style={{ fontSize: 13, marginBottom: 16 }}>
                Set your name and password to activate your admin account.
              </p>

              <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>

                {/* First + Last side by side */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
                  <Form.Item
                    name="first_name"
                    label="First Name"
                    style={{ marginBottom: 12 }}
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder="First name" />
                  </Form.Item>
                  <Form.Item
                    name="last_name"
                    label="Last Name"
                    style={{ marginBottom: 12 }}
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder="Last name" />
                  </Form.Item>
                </div>

                <Form.Item
                  name="password"
                  label="Password"
                  style={{ marginBottom: 12 }}
                  rules={[
                    { required: true, message: "Password is required" },
                    { min: 8, message: "At least 8 characters" },
                  ]}
                >
                  <Input.Password placeholder="Create a password" />
                </Form.Item>

                <Form.Item
                  name="confirm"
                  label="Confirm Password"
                  style={{ marginBottom: 16 }}
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Please confirm your password" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value)
                          return Promise.resolve();
                        return Promise.reject(new Error("Passwords do not match"));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Confirm password" />
                </Form.Item>

                <Button block size="large" htmlType="submit" className="btn-clr" loading={isLoading}>
                  Activate Account
                </Button>

                <div
                  className="LoginScreen-txt4"
                  style={{ marginTop: 12, cursor: "pointer" }}
                  onClick={() => router.push("/auth/login")}
                >
                  Already have an account? Sign in
                </div>
              </Form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminAcceptInvite;
