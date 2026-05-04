"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { Button, Form, Input, Result, notification } from "antd";
import { PUBLIC_POST } from "@/util/apicall";
import API from "@/config/API";
import { useRouter, useSearchParams } from "next/navigation";
import "../forgot-password/style.scss";

function ResetPassword() {
  const [notifApi, contextHolder] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const handleSubmit = async (values: { password: string }) => {
    if (!token) {
      notifApi.error({ message: "Reset token is missing. Please use the link from your email." });
      return;
    }
    try {
      setIsLoading(true);
      const res: any = await PUBLIC_POST(API.USER_RESET_PASSWORD, {
        token,
        password: values.password,
      });
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
        <div className="auth-form-side">
          {done ? (
            <Result
              status="success"
              title="Password Updated!"
              subTitle="Your password has been reset successfully. You can now sign in with your new password."
              extra={
                <Button
                  type="primary"
                  block
                  size="large"
                  className="btn-clr"
                  onClick={() => router.push("/login")}
                >
                  Back to Login
                </Button>
              }
            />
          ) : (
            <>
              <h2 className="LoginScreen-txt1">Reset Password</h2>
              <p className="LoginScreen-txt2">Enter your new password below.</p>

              <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
                <Form.Item
                  name="password"
                  label="New Password"
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
                  onClick={() => router.push("/login")}
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

export default ResetPassword;
