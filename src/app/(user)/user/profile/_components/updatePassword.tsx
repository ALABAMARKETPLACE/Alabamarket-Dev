"use client";
import React, { useState } from "react";
import "../../style.scss";
import { Button, Form, Input, notification } from "antd";
import Image from "next/image";
import passwordImge from "../../../../../assets/images/passwordchange.png";
import API from "@/config/API";
import { PUT } from "@/util/apicall";
const EditPassword = (props: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [notificationApi, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();
  const editPassowrd = async (values: any) => {
    const url =
      props?.type == "update"
        ? API.USER_CHANGE_PASSWORD
        : props?.type == "add"
        ? API.USER_ADDNEW_PASSWORD
        : "";
    try {
      setIsLoading(true);
      const response: any = await PUT(url, values);
      if (response?.status) {
        notificationApi.success({ message: `Password updated successfully.` });
        // dispatch(update(response?.data));
        form.resetFields();
        props?.close();
      } else {
        notificationApi.error({ message: response.message });
      }
    } catch (error: any) {
      notificationApi.error({
        message: "Something went wrong. please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="editEmail-Text1">
      {contextHolder}
      <div
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          textAlign: "center",
        }}
      >
        <Image style={{ width: "200px", height: "150px" }} src={passwordImge} alt="" />
      </div>

      <div className="editEmail-Text2">
        {props?.type == "update" ? "Change Your Password" : "Add New Password"}
      </div>
      <br />
      <Form onFinish={editPassowrd} form={form}>
        {props?.type == "update" ? (
          <Form.Item
            name="oldPassword"
            rules={[
              {
                required: true,
                message: "Please input your Previous Password!",
              },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Enter Previous password" />
          </Form.Item>
        ) : null}

        <Form.Item
          name="newPassword"
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
            { min: 8, message: "Password should contain 8 characters." },
          ]}
          hasFeedback
        >
          <Input.Password placeholder="Enter New Password" />
        </Form.Item>

        <Form.Item
          name="confirm"
          dependencies={["newPassword"]}
          hasFeedback
          rules={[
            {
              required: true,
              message: "Please confirm your password!",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The new password that you entered do not match!")
                );
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm Password" />
        </Form.Item>
        <Button
          block
          type="primary"
          htmlType="submit"
          loading={isLoading}
          size="large"
        >
          Update
        </Button>
      </Form>
    </div>
  );
};

export default EditPassword;
