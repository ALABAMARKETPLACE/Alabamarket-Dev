"use client";
import { useState } from "react";
import { Button, Form, Input, notification } from "antd";
import { BiErrorCircle } from "react-icons/bi";

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
    console.log("DAVOODVALUES=======>>>>>", values);
    try {
      setIsLoading(true);
      const result: any = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });
      console.log("DAVOODRESULT=======>>>>>", result);
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
          message: result.error || "something went wrong.",
        });
      }
    } catch (err) {
      setIsLoading(false);
      setError("Something went wrong");
    }
  };

  return (
    <div>
      {contextHolder}
      <div className="LoginScreen-txt2 text-center">
        Enter your email and we’ll check for you.
      </div>
      <br />
      <Form onFinish={LoginEmail}>
        <Form.Item
          name={"email"}
          rules={[
            { required: true, message: "Please Enter your Email" },
            { type: "email", message: "Please enter a Valid Email" },
          ]}
        >
          <Input size="large" placeholder="Enter your Email" />
        </Form.Item>
        <Form.Item
          name={"password"}
          rules={[
            { required: true, message: "Please Enter Password" },
            { max: 20, message: "" },
          ]}
        >
          <Input.Password size="large" placeholder="Enter Password" />
        </Form.Item>
        {error ? (
          <div className="LoginScreen-errortxt">
            <BiErrorCircle />
            &nbsp;
            {error}
          </div>
        ) : null}
        <div className="row">
          <div className="col-sm-6">
            <div
              className="LoginScreen-txt3 h-100 d-flex align-items-center"
              onClick={() => navigation.push("/forgot-password")}
            >
              Forgot password ?
            </div>
          </div>
          <div className="col-sm-6">
            <Button
              loading={isLoading}
              block
              size="large"
              type="primary"
              htmlType="submit"
              style={{ height: 45 }}
            >
              Login
            </Button>
          </div>
        </div>
      </Form>
      <hr />
    </div>
  );
}
export default EmailLogin;
