"use client";
import { useState } from "react";
import { Button, Form, Input } from "antd";
import { PUBLIC_POST } from "@/util/apicall";
import API from "@/config/API";
import { useRouter } from "next/navigation";
import "../forgot-password/style.scss";

function UserForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const router = useRouter();

  const handleSubmit = async (values: { email: string }) => {
    try {
      setIsLoading(true);
      await PUBLIC_POST(API.USER_FORGOT_PASSWORD, { email: values.email });
    } catch {
      // intentionally ignored — API always returns success per spec
    } finally {
      setIsLoading(false);
      // Always show success to avoid email enumeration
      sessionStorage.setItem("reset_email", values.email);
      setSentEmail(values.email);
      setSent(true);
    }
  };

  return (
    <div className="Screen-box">
      <div className="auth-container">
        <div className="auth-form-side">
          {sent ? (
            <>
              <h2 className="LoginScreen-txt1">Check your email</h2>
              <p className="LoginScreen-txt2">
                If <strong>{sentEmail}</strong> is registered, a reset code
                has been sent. Please check your inbox and spam folder.
              </p>
              <Button
                block
                size="large"
                className="btn-clr"
                onClick={() => router.push("/reset-password")}
              >
                Enter Reset Code
              </Button>
              <div
                className="LoginScreen-txt4"
                onClick={() => router.push("/login")}
              >
                Back to Login
              </div>
            </>
          ) : (
            <>
              <h2 className="LoginScreen-txt1">Forgot Password?</h2>
              <p className="LoginScreen-txt2">
                Enter your email and we'll send you a reset code.
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
                  Send Reset Code
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
