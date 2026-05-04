"use client";
import { useState } from "react";
import { Button, Form, Input, notification } from "antd";
import { PUBLIC_POST } from "@/util/apicall";
import API from "@/config/API";
import { useRouter } from "next/navigation";
import "../forgot-password/style.scss";

function UserForgotPassword() {
  const [notifApi, contextHolder] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const router = useRouter();

  const handleSubmit = async (values: { email: string }) => {
    try {
      setIsLoading(true);
      const res: any = await PUBLIC_POST(API.USER_FORGOT_PASSWORD, { email: values.email });
      if (res?.status === false) {
        notifApi.error({
          message: res?.message || "Password reset failed. Please try again.",
        });
        return;
      }
      setSentEmail(values.email);
      setSent(true);
    } catch (err: any) {
      notifApi.error({
        message: err?.message || "Unable to send reset email. Please try again.",
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
          {sent ? (
            <>
              <h2 className="LoginScreen-txt1">Check your email</h2>
              <p className="LoginScreen-txt2">
                A password reset link has been sent to{" "}
                <strong>{sentEmail}</strong>. Please check your inbox and spam
                folder.
              </p>
              <div className="LoginScreen-txt4" onClick={() => router.push("/login")}>
                Back to Login
              </div>
            </>
          ) : (
            <>
              <h2 className="LoginScreen-txt1">Forgot Password?</h2>
              <p className="LoginScreen-txt2">
                Enter your email address and we'll send you a link to reset
                your password.
              </p>

              <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Enter a valid email address" },
                  ]}
                >
                  <Input size="large" placeholder="Enter your email" />
                </Form.Item>

                <Button
                  block
                  size="large"
                  htmlType="submit"
                  className="btn-clr"
                  loading={isLoading}
                >
                  Send Reset Link
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

export default UserForgotPassword;
