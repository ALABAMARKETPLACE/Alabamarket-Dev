"use client";
import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Form, Input, Button, Select, notification } from "antd";
import { POST, GET } from "@/util/apicall";
import API from "@/config/API";
import PrefixSelector from "@/components/prefixSelector/page";
import { useQuery } from "@tanstack/react-query";
import TextArea from "antd/es/input/TextArea";

function NewAddressForm(props: any) {
  const [form] = Form.useForm();
  const [Notifications, contextHolder] = notification.useNotification();
  const [isLoading, setIsLoading] = useState<any>(false);

  // Watch for country and state selection to hide/show fields
  const countryId = Form.useWatch("country_id", form);
  const stateId = Form.useWatch("state_id", form);

  // Fetch countries
  const { data: countries, isLoading: loadingCountries } = useQuery<any>({
    queryKey: [API.COUNTRIES],
    queryFn: async () => await GET(API.COUNTRIES),
    select: (res) => (res?.status ? res?.data : []),
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // Fetch states
  const { data: states, isLoading: loadingStates } = useQuery<any>({
    queryKey: [API.STATES],
    queryFn: async () => await GET(API.STATES),
    select: (res) => (res?.status ? res?.data : []),
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  const submit = async (values: any) => {
    try {
      setIsLoading(true);

      const obj = {
        address_type: values.address_type,
        full_address: values.full_address,
        pincode: values.pincode,
        phone_no: values.phone_no,
        country_code: values?.code ?? "+234",
        country_id: values.country_id || null,
        state_id: values.state_id || null,
      };

      // Validate at least one of country or state is selected
      if (!obj.country_id && !obj.state_id) {
        Notifications["error"]({
          message: "Validation Error",
          description: "Please select either a Country or a State",
        });
        setIsLoading(false);
        return;
      }

      const response: any = await POST(API.NEW_ADDRESS_ALL, obj);

      if (response?.status) {
        Notifications["success"]({
          message: "Success",
          description: `Address added successfully.`,
        });
        form.resetFields();
        props?.onChange();
      } else {
        Notifications["error"]({
          message: `Failed to add address`,
          description: response.message,
        });
      }
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      Notifications["error"]({
        message: `Failed`,
        description: err.message || "Failed to add address",
      });
    }
  };

  return (
    <Container fluid>
      {contextHolder}
      <br />
      <Form
        form={form}
        onFinish={submit}
        layout="vertical"
        initialValues={{ address_type: "Home", code: "+234" }}
      >
        <Row>
          <Col sm={6} xs={12}>
            <div className="input-form-label">Address Type</div>
            <Form.Item
              name="address_type"
              rules={[
                { required: true, message: "Please select address type" },
              ]}
            >
              <Select size="large" placeholder="Select address type">
                <Select.Option key="Home" value="Home">
                  Home
                </Select.Option>
                <Select.Option key="Work" value="Work">
                  Work
                </Select.Option>
                <Select.Option key="Office" value="Office">
                  Office
                </Select.Option>
                <Select.Option key="Other" value="Other">
                  Other
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col sm={6} xs={12}>
            <div className="input-form-label">Phone Number</div>
            <Form.Item
              name="phone_no"
              rules={[
                { required: true, message: "Please enter phone number" },
                {
                  min: 10,
                  message: "Phone number must be at least 10 characters",
                },
                {
                  max: 20,
                  message: "Phone number must not exceed 20 characters",
                },
              ]}
            >
              <Input
                addonBefore={<PrefixSelector />}
                style={{ width: "100%" }}
                size="large"
                type="tel"
                placeholder="Phone Number"
              />
            </Form.Item>
          </Col>

          <Col sm={12} xs={12}>
            <div className="input-form-label">Full Address</div>
            <Form.Item
              name="full_address"
              rules={[
                { required: true, message: "Please enter full address" },
                {
                  min: 10,
                  message: "Address must be at least 10 characters",
                },
                {
                  max: 500,
                  message: "Address must not exceed 500 characters",
                },
              ]}
            >
              <TextArea
                rows={3}
                placeholder="Enter your complete address"
                maxLength={500}
                size="large"
              />
            </Form.Item>
          </Col>

          <Col sm={6} xs={12}>
            <div className="input-form-label">Pincode</div>
            <Form.Item
              name="pincode"
              rules={[
                { required: true, message: "Please enter pincode" },
                { min: 1, message: "Enter a valid pincode" },
                { max: 20, message: "Pincode must not exceed 20 characters" },
              ]}
            >
              <Input placeholder="Pincode" size="large" />
            </Form.Item>
          </Col>

          {/* Country Field - Hidden if State is selected */}
          {!stateId && (
            <Col sm={6} xs={12}>
              <div className="input-form-label">Country</div>
              <Form.Item
                name="country_id"
                rules={[
                  {
                    required: !stateId,
                    message: "Please select a country or state",
                  },
                ]}
              >
                <Select
                  placeholder="Select Country"
                  size="large"
                  loading={loadingCountries}
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={
                    Array.isArray(countries)
                      ? countries.map((c: any) => ({
                          value: c.id,
                          label: c.country_name,
                        }))
                      : []
                  }
                  onChange={(value) => {
                    if (value) {
                      form.setFieldValue("state_id", undefined);
                    }
                  }}
                />
              </Form.Item>
            </Col>
          )}

          {/* State Field - Hidden if Country is selected */}
          {!countryId && (
            <Col sm={6} xs={12}>
              <div className="input-form-label">State</div>
              <Form.Item
                name="state_id"
                rules={[
                  {
                    required: !countryId,
                    message: "Please select a state or country",
                  },
                ]}
              >
                <Select
                  placeholder="Select State"
                  size="large"
                  loading={loadingStates}
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={
                    Array.isArray(states)
                      ? states.map((s: any) => ({
                          value: s.id,
                          label: s.name,
                        }))
                      : []
                  }
                  onChange={(value) => {
                    if (value) {
                      form.setFieldValue("country_id", undefined);
                    }
                  }}
                />
              </Form.Item>
            </Col>
          )}

          {/* Info Message */}
          <Col sm={12}>
            <p className="text-muted" style={{ fontSize: "12px" }}>
              <i>Note: Select either Country or State (not both)</i>
            </p>
          </Col>

          <Col sm={6} xs={6}>
            {props?.closable ? (
              <Button
                block
                size="large"
                danger
                onClick={() => props?.close()}
                style={{ height: 50 }}
              >
                Cancel
              </Button>
            ) : null}
          </Col>
          <Col sm={6} xs={6}>
            <Button
              htmlType="submit"
              block
              size="large"
              type="primary"
              loading={isLoading}
              style={{ height: 50 }}
            >
              Save
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}
export default NewAddressForm;
