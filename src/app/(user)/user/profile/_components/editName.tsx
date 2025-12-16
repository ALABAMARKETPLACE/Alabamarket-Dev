"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import "../../style.scss";
import Image from "next/image";
import { Button, Form, Input, notification } from "antd";
import userimage from "../../../../../assets/images/editform.png";
import API from "@/config/API";
import { PUT } from "@/util/apicall";
import { useSession } from "next-auth/react";
const EditName = (props: any) => {
  const { data: session }: any = useSession();
  const User = session?.user;
  const [notificationApi, contextHolder] = notification.useNotification();

  const [loading, setLoading] = useState(false);
  const updateName = async (item: any) => {
    const obj = {
      first_name: item?.first_name,
      last_name: item?.last_name,
    };

    const url = API.USER_NAME_UPDATE;
    setLoading(true);

    try {
      const Response: any = await PUT(url, obj);
      if (Response.status) {
        // dispatch(update(Response?.data));
        notificationApi.success({ message: "Successfully Updated your Name" });
        props.close();
      } else {
        notificationApi.error({ message: Response.message ?? "" });
      }
    } catch (error) {
      notificationApi.error({ message: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editName-Text1">
      {contextHolder}
      <div
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          textAlign: "center",
        }}
      >
        <Image style={{ width: "100%", height: "150px" }} src={userimage} alt="" />
      </div>
      <br />

      <p className="editName-Text2">Change Your Full Name Here,</p>
      <Form
        onFinish={updateName}
        initialValues={{
          first_name: User?.data?.first_name,
          last_name: User?.data?.last_name,
        }}
      >
        <div>Enter Your First Name</div>
        <Form.Item name="first_name">
          <Input size="large"></Input>
        </Form.Item>
        <div>Enter Your Last Name</div>

        <Form.Item name="last_name">
          <Input size="large"></Input>
        </Form.Item>

        <Button
          block
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
        >
          Save
        </Button>
      </Form>
    </div>
  );
};

export default EditName;
