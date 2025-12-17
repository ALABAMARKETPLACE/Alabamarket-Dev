"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { Button, Form, Input, notification } from "antd";
import { BiErrorCircle } from "react-icons/bi";
import { LockOutlined, MailOutlined } from "@ant-design/icons";

import React from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useAppDispatch } from "@/redux/hooks";
import { storeToken } from "@/redux/slice/authSlice";

function EmailLogin() {
  const navigation = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [notificationApi, contextHolder] = notification.useNotification();
  const dispatch = useAppDispatch();
  const LoginEmail = async (values: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const result: any = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });
      if (result.ok) {
        const session: any = await getSession();
        dispatch(
          storeToken({
            token: session?.token,
            refreshToken: session?.refreshToken,
          })
        );
        navigation.replace("/auth");
      } else {
        notificationApi.error({
          message: result.error || "Invalid email or password",
        });
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setIsLoading(false);
      setError("Something went wrong");
      notificationApi.error({
        message: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="email-login-container">
      {contextHolder}
      <div className="email-login-subtitle">
        Enter your email and password to sign in to your account
      </div>
      
      <Form onFinish={LoginEmail} layout="vertical" className="email-login-form">
        <Form.Item
          name={"email"}
          label={<span className="email-login-label">Email Address</span>}
          rules={[
            { required: true, message: "Please enter your email address" },
            { type: "email", message: "Please enter a valid email address" },
          ]}
        >
          <Input 
            size="large" 
            placeholder="you@example.com"
            prefix={<MailOutlined style={{ color: '#FF9900', marginRight: 8 }} />}
            className="email-login-input"
          />
        </Form.Item>

        <Form.Item
          name={"password"}
          label={<span className="email-login-label">Password</span>}
          rules={[
            { required: true, message: "Please enter your password" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password 
            size="large" 
            placeholder="Enter your password"
            prefix={<LockOutlined style={{ color: '#FF9900', marginRight: 8 }} />}
            className="email-login-input"
          />
        </Form.Item>

        {error ? (
          <div className="email-login-error">
            <BiErrorCircle style={{ marginRight: 6 }} />
            {error}
          </div>
        ) : null}

        <div className="email-login-footer-actions">
          <button
            type="button"
            className="email-login-forgot-btn"
            onClick={() => navigation.push("/forgot-password")}
          >
            Forgot password?
          </button>
          <Button
            loading={isLoading}
            size="large"
            type="primary"
            htmlType="submit"
            className="email-login-btn"
            style={{
              height: 48,
              fontSize: 16,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #FF9900 0%, #FFB84D 100%)',
              border: 'none',
              borderRadius: 12,
            }}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
export default EmailLogin;
