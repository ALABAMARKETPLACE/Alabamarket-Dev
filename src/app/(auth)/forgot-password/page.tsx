"use client";
import { useState } from "react";
import { Button, Form, Input, notification } from "antd";
import { POST } from "@/util/apicall";
import { parseApiMessage } from "@/util/parseApiError";
import { useRouter } from "next/navigation";
import API from "@/config/API_ADMIN";
import "./style.scss";

function ForgotPassword() {
  const [notificationApi, contextHolder] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const router = useRouter();

  const handleSubmit = async (val: any) => {
    try {
      setIsLoading(true);
      const response: any = await POST(API.USER_FORGOT_PASSWORD, { email: val?.email });
      if (response.status) {
        setSentEmail(val?.email);
        setSent(true);
      } else {
        notificationApi.error({ message: parseApiMessage(response.message, "Password reset failed. Please try again.") });
      }
    } catch (err) {
      notificationApi.error({ message: `Ooops something went wrong...!` });
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
              <div className="LoginScreen-txt2" style={{ marginBottom: 24 }}>
                A password reset link has been sent to <strong>{sentEmail}</strong>. Please check your inbox and spam folder.
              </div>
              <div
                className="LoginScreen-txt4"
                onClick={() => router.push("/login")}
              >
                Back to Login
              </div>
            </>
          ) : (
            <>
              <h2 className="LoginScreen-txt1">Forgot Password</h2>
              <div className="LoginScreen-txt2">
                Enter your email address to retrieve your password
              </div>

              <Form onFinish={handleSubmit} layout="vertical">
                <Form.Item
                  name={"email"}
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "The input is not valid E-mail!" },
                  ]}
                >
                  <Input size="large" placeholder="Enter Email" />
                </Form.Item>

                <Button
                  block
                  size="large"
                  className="btn-clr"
                  htmlType="submit"
                  loading={isLoading}
                >
                  Send Request
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

export default ForgotPassword;
