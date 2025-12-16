// export default EditEmail;
"use client";
import React, { useState } from "react";
import {  useSelector } from "react-redux";
import "../../style.scss";
import { Button, Form, Input, notification } from "antd";
import Image from "next/image";
import emailimage from "../../../../../assets/images/emailllll.jpg";
import API from "@/config/API";
import { PUT } from "@/util/apicall";
const EditEmail = (props: any) => {
  const User = useSelector((state: any) => state.User.user);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationApi, contextHolder] = notification.useNotification();

  const updateEmail = async (values: any) => {
    const obj = {
      email: values.email,
    };
    const url = API.USER_EMAIL_UPDATE;
    try {
      setIsLoading(true);
      const Response: any = await PUT(url, obj);
      if (Response.status === true) {
        notificationApi.success({ message: "Email Updated Successfully" });
        // dispatch(update(Response?.data));
        props.close();
      } else {
        notificationApi.error({ message: Response.message });
      }
    } catch (error) {
      notificationApi.error({ message: "Something went wrong." });
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
        <Image style={{ width: "200px", height: "150px" }} src={emailimage} alt=""/>
      </div>

      <div className="editEmail-Text2">Change Your Email Here,</div>
      <br />
      <Form onFinish={updateEmail}>
        <div>Enter Your Email</div>
        <Form.Item name="email">
          <Input
            defaultValue={
              User?.data?.email ? User?.data?.email : User?.data?.data?.email
            }
            id="email"
            size="large"
          />
        </Form.Item>
        <Button
          block
          type="primary"
          htmlType="submit"
          loading={isLoading}
          size="large"
        >
          Save
        </Button>
      </Form>
    </div>
  );
};

export default EditEmail;
