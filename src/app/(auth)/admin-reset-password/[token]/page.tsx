"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { Button, Form, Input, Result, notification } from "antd";
import { PUBLIC_POST } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import { useRouter, useParams } from "next/navigation";
import "../../forgot-password/style.scss";

function AdminResetPassword() {
  const [notifApi, contextHolder] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const handleSubmit = async (values: { password: string }) => {
    try {
      setIsLoading(true);
      const res: any = await PUBLIC_POST(
        API.ADMIN_RESET_PASSWORD,
        { password: values.password },
        null,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res?.status === false) {
        notifApi.error({
          message: res?.message || "Password reset failed. The link may have expired.",
        });
        return;
      }
      setDone(true);
    } catch (err: any) {
      notifApi.error({
        message: err?.message || "Unable to reset password. Please try again.",
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
              title="Password Updated!"
              subTitle="Your admin password has been reset successfully. You can now sign in with your new password."
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
                Reset Password
              </h2>
              <p className="LoginScreen-txt2" style={{ fontSize: 13, marginBottom: 20 }}>
                Enter a new password for your admin account.
              </p>

              <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
                <Form.Item
                  name="password"
                  label="New Password"
                  style={{ marginBottom: 12 }}
                  rules={[
                    { required: true, message: "Password is required" },
                    { min: 8, message: "At least 8 characters" },
                  ]}
                >
                  <Input.Password size="large" placeholder="Enter new password" />
                </Form.Item>

                <Form.Item
                  name="confirm"
                  label="Confirm Password"
                  style={{ marginBottom: 20 }}
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
                  <Input.Password size="large" placeholder="Confirm new password" />
                </Form.Item>

                <Button
                  block
                  size="large"
                  htmlType="submit"
                  className="btn-clr"
                  loading={isLoading}
                >
                  Reset Password
                </Button>

                <div
                  className="LoginScreen-txt4"
                  style={{ marginTop: 12, cursor: "pointer" }}
                  onClick={() => router.push("/auth/login")}
                >
                  Back to Login
                </div>
              </Form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminResetPassword;
