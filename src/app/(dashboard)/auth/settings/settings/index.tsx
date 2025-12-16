"use client";
import API from "@/config/API_ADMIN";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { reduxSettings, storeSettings } from "@/redux/slice/settingsSlice";
import { PUT } from "@/util/apicall";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input, notification, Select } from "antd";
import React, { useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import currencyList from "../../../../../shared/helpers/currencies.json";
function Settings() {
  const typeOptions = [
    { name: "Single Vendor", value: "single" },
    { name: "Multi Store", value: "multi" },
  ];
  const locationOptions = [
    { name: "true", value: "true" },
    { name: "false", value: "false" },
  ];
  const [form] = Form.useForm();
  const [Notifications, contextHolder] = notification.useNotification();
  const settings = useAppSelector(reduxSettings);
  const reduxDispatch = useAppDispatch();

  useEffect(() => {
    form.setFieldsValue({
      type: settings.type,
      isLocation: settings.isLocation == true ? "true" : "false",
      currency: settings.currency,
      radius: settings.radius ?? 0,
    });
  }, [settings]);
  const mutation = useMutation({
    mutationFn: (body: any) => {
      return PUT(API.SETTINGS + settings?.id, body);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      Notifications["success"]({
        message: "Settings updated successfully.",
      });
      reduxDispatch(storeSettings(data?.data));
    },
  });
  return (
    <div>
      <div style={{ marginTop: -10 }} />
      <div className="dashboard-pageHeader">
        <div>Settings</div>
        <div className="dashboard-pageHeaderBox">
          <Button
            type="primary"
            loading={mutation?.isPending}
            onClick={form.submit}
          >
            Update Settings
          </Button>
        </div>
      </div>
      {contextHolder}
      <Form form={form} layout="vertical" onFinish={mutation?.mutate}>
        <Container>
          <Row>
            <Col sm={6}>
              <Form.Item
                label="Type"
                name="type"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Type",
                  },
                ]}
              >
                <Select
                  optionLabelProp="name"
                  allowClear
                  options={typeOptions}
                  size="large"
                />
              </Form.Item>
              <Form.Item
                label="Location"
                name="isLocation"
                rules={[
                  {
                    required: true,
                    message: "Please Select Location",
                  },
                ]}
              >
                <Select
                  optionLabelProp="name"
                  allowClear
                  options={locationOptions}
                  size="large"
                  placeholder={"Select Location"}
                />
              </Form.Item>
            </Col>
            <Col sm={6}>
              <Form.Item
                label="Search Radius (Km)"
                name="radius"
                rules={[
                  {
                    required: true,
                    message: "Please Select Search Radius",
                  },
                ]}
              >
                <Input type="number" size="large" />
              </Form.Item>
              <Form.Item
                label="Currency"
                name="currency"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Currency",
                  },
                ]}
              >
                <Select
                  placeholder="Select Currency"
                  showSearch={true}
                  fieldNames={{
                    label: "currency_code",
                    value: "currency_code",
                  }}
                  options={currencyList}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </Container>
      </Form>
    </div>
  );
}

export default Settings;
