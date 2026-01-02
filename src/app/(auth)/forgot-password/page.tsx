"use client";
import { useState } from "react";
import { Button, Form, Input, notification } from "antd";
import { POST } from "@/util/apicall";
import { useRouter } from "next/navigation";
import API from "@/config/API_ADMIN";
import "./style.scss";

function ForgotPassword() {
  const [notificationApi, contextHolder] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const ForgotPassword = async (val: any) => {
    try {
      setIsLoading(true);
      let url = API.USER_FORGOT_PASSWORD;
      const obj = {
        email: val?.email,
      };
      const response: any = await POST(url, obj);
      if (response.status) {
        notificationApi.success({
          message: `Password Reset link has been sent to your mail id. Please check`,
        });
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        notificationApi.error({ message: response.message ?? "" });
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
          <h2 className="LoginScreen-txt1">Forgot Password</h2>
          <div className="LoginScreen-txt2">
            Enter your email address to retrieve your password
          </div>
          
          <Form onFinish={ForgotPassword} layout="vertical">
            <Form.Item
              name={"email"}
              rules={[
                { required: true, message: "Please enter your email" },
                {
                  type: "email",
                  message: "The input is not valid E-mail!",
                },
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
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
