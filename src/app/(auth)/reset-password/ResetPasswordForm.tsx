"use client";
import { useEffect, useState } from "react";
import { Button, Form, Input, Result, notification } from "antd";
import { PUBLIC_POST } from "@/util/apicall";
import API from "@/config/API";
import { useRouter, useSearchParams } from "next/navigation";
import "../forgot-password/style.scss";

function ResetPasswordForm() {
  const [form] = Form.useForm();
  const [notifApi, contextHolder] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("reset_email") ?? "";
    form.setFieldsValue({
      email: savedEmail,
      token: tokenFromUrl,
    });
  }, [form, tokenFromUrl]);

  const handleSubmit = async (values: {
    email: string;
    token: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      setIsLoading(true);
      const res: any = await PUBLIC_POST(API.USER_RESET_PASSWORD, {
        email:           values.email,
        token:           values.token,
        newPassword:     values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      if (res?.status === false) {
        notifApi.error({
          message: res?.message || "Password reset failed. The code may have expired.",
        });
        return;
      }
      sessionStorage.removeItem("reset_email");
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
              title="Password Reset!"
              subTitle="Your password has been updated successfully. You can now sign in."
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
              <p className="LoginScreen-txt2">
                Enter the reset code from your email and choose a new password.
              </p>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
              >
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: "Email is required" },
                    { type: "email", message: "Enter a valid email" },
                  ]}
                >
                  <Input size="large" placeholder="your@email.com" />
                </Form.Item>

                <Form.Item
                  name="token"
                  label="Reset Code"
                  rules={[{ required: true, message: "Reset code is required" }]}
                >
                  <Input size="large" placeholder="Paste the code from your email" />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  label="New Password"
                  rules={[
                    { required: true, message: "Password is required" },
                    { min: 8, message: "At least 8 characters" },
                  ]}
                >
                  <Input.Password size="large" placeholder="Enter new password" />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Confirm Password"
                  dependencies={["newPassword"]}
                  rules={[
                    { required: true, message: "Please confirm your password" },
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

export default ResetPasswordForm;
