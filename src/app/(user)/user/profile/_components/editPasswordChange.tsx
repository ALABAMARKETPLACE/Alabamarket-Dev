"use client";
import { Button, Col, Form, Input, Row, notification } from "antd";
import React from "react";

function EditPasswordChange(props: any) {
  const [form] = Form.useForm();
  const [notificationApi, contextHolder] = notification.useNotification();

  return (
    <Form form={form} layout="vertical" onFinish={props?.editPassowrd}>
      {contextHolder}
      <Row gutter={16}>
        {props?.type == "update" ? (
          <Col md={6} sm={12} xs={24}>
            <Form.Item
              name="oldPassword"
              rules={[
                {
                  required: true,
                  message: "Please Enter your Previous password",
                },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Enter Previous password"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        ) : null}

        <Col md={6} sm={12} xs={24}>
          <Form.Item
            name="newPassword"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
              {
                min: 8,
                message: "Password should contain atleast 8 characters",
              },
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Enter New Password"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
        <Col md={6} sm={12} xs={24}>
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
            <Input.Password
              size="large"
              placeholder="Confirm Password"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
        <Col md={6} sm={12} xs={24}>
          <Button
            loading={props?.loading}
            type="primary"
            size="large"
            onClick={() => form.submit()}
          >
            Update
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default EditPasswordChange;
