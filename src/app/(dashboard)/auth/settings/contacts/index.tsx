"use client";
import API from "@/config/API_ADMIN";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { reduxSettings, storeSettings } from "@/redux/slice/settingsSlice";
import { PUT } from "@/util/apicall";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input, notification } from "antd";
import React, { useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";

function Contacts() {
  const [form] = Form.useForm();
  const [Notifications, contextHolder] = notification.useNotification();
  const settings = useAppSelector(reduxSettings);
  const reduxDispatch = useAppDispatch();

  useEffect(() => {
    form.setFieldsValue({
      adminEmail: settings.adminEmail,
      supportInfoEmail: settings.supportInfoEmail,
      contactEmail: settings.contactEmail,
      contactNumber: settings.contactNumber,
      address: settings.address,
    });
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (body: object) => {
      return PUT(API.SETTINGS + settings?.id, body);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      Notifications["success"]({
        message: "Contacts updated successfully.",
      });
      reduxDispatch(storeSettings(data?.data));
    },
  });
  return (
    <div>
      <div style={{ marginTop: -10 }} />
      <div className="dashboard-pageHeader">
        <div>Contacts</div>
        <div className="dashboard-pageHeaderBox">
          <Button
            type="primary"
            loading={mutation?.isPending}
            onClick={form.submit}
          >
            Update Contacts
          </Button>
        </div>
      </div>
      {contextHolder}
      <Form form={form} layout="vertical" onFinish={mutation?.mutate}>
        <Container>
          <Row>
            <Col sm={6}>
              <Form.Item
                label="Admin Email"
                name="adminEmail"
                rules={[
                  {
                    type: "email",
                    message: "Invalid Email Format",
                  },
                  {
                    required: true,
                    message: "Please Enter Admin Email",
                  },
                ]}
              >
                <Input placeholder="Admin Email" size="large" />
              </Form.Item>
              <Form.Item
                label="SupportInfo Email"
                name="supportInfoEmail"
                rules={[
                  {
                    type: "email",
                    message: "Invalid email format",
                  },
                  {
                    required: true,
                    message: "Please Enter SupportInfo Email",
                  },
                ]}
              >
                <Input placeholder="SupportInfo Email" size="large" />
              </Form.Item>
              <Form.Item
                label="Contact Email"
                name="contactEmail"
                rules={[
                  {
                    type: "email",
                    message: "Invalid email format",
                  },
                  {
                    required: true,
                    message: "Please Enter Contact Email",
                  },
                ]}
              >
                <Input placeholder="Contact Email" size="large" />
              </Form.Item>
            </Col>
            <Col sm={6}>
              <Form.Item
                label="Contact Number"
                name="contactNumber"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Contact Number",
                  },
                ]}
              >
                <Input placeholder="Contact Number" size="large" />
              </Form.Item>
              <Form.Item
                label="Address"
                name="address"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Address",
                  },
                ]}
              >
                <Input.TextArea placeholder="Address" rows={3} size="large" />
              </Form.Item>
            </Col>
          </Row>
        </Container>
      </Form>
    </div>
  );
}

export default Contacts;
