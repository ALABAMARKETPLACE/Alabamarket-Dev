"use client";
import { useState } from "react";
import { Button, Form, Input, notification } from "antd";
import { POST } from "@/util/apicall";
import { parseApiMessage } from "@/util/parseApiError";
import { useRouter, useParams } from "next/navigation";
import API from "@/config/API";
import "../../forgot-password/style.scss";

function ResetPassword() {
  const [notificationApi, contextHolder] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const handleSubmit = async (val: any) => {
    try {
      setIsLoading(true);
      const response: any = await POST(API.USER_RESET_PASSWORD, {
        token,
        password: val.password,
      });
      if (response?.status) {
        setDone(true);
      } else {
        notificationApi.error({
          message: parseApiMessage(response?.message, "Password reset failed. The link may have expired."),
        });
      }
    } catch (err) {
      notificationApi.error({ message: "Something went wrong. Please try again." });
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
            <>
              <h2 className="LoginScreen-txt1">Password Reset</h2>
              <div className="LoginScreen-txt2" style={{ marginBottom: 24 }}>
                Your password has been updated successfully.
              </div>
              <Button
                block
                size="large"
                className="btn-clr"
                onClick={() => router.push("/login")}
              >
                Back to Login
              </Button>
            </>
          ) : (
            <>
              <h2 className="LoginScreen-txt1">Reset Password</h2>
              <div className="LoginScreen-txt2">
                Enter your new password below
              </div>

              <Form onFinish={handleSubmit} layout="vertical">
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "Please enter a new password" },
                    { min: 6, message: "Password must be at least 6 characters" },
                  ]}
                >
                  <Input.Password size="large" placeholder="New Password" />
                </Form.Item>

                <Form.Item
                  name="confirm"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Please confirm your password" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error("Passwords do not match"));
                      },
                    }),
                  ]}
                >
                  <Input.Password size="large" placeholder="Confirm New Password" />
                </Form.Item>

                <Button
                  block
                  size="large"
                  className="btn-clr"
                  htmlType="submit"
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
