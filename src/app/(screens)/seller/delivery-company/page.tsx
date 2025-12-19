"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Form, Input, Button, notification, Select, Checkbox } from "antd";
import API from "../../../../config/API";
import { GET, POST } from "../../../../util/apicall";
import PrefixSelector from "../../../../components/prefixSelector/page";
import "../../seller/style.scss";

function DeliveryCompanyRegistration() {
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [form] = Form.useForm();
  const navigation = useRouter();

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      let url = API.STATES;
      let response: any = await GET(url);
      if (response.status) {
        setStates(response.data);
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const payload = {
        business_name: values.business_name,
        phone: values.phone,
        state: values.state,
        city: values.city,
        bank_name: values.bank_name,
        account_number: values.account_number,
        email: values.email,
        password: values.password,
        countrycode: values.code || "+971",
      };

      let url = API.DELIVERY_COMPANY_REGISTER;
      const response: any = await POST(url, payload);

      if (response.status) {
        notification.success({
          message: "Success",
          description:
            "Registration successful! Your application is pending approval.",
        });
        form.resetFields();
        setTimeout(() => {
          navigation.push("/seller");
        }, 2000);
      } else {
        notification.error({
          message: "Registration Failed",
          description: response.message || "Please try again.",
        });
      }
    } catch (err: any) {
      console.error("API Error:", err);
      notification.error({
        message: "Something went wrong!",
        description: err.message || "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Screen-box">
      <br />
      <Container>
        <div className="sellerRegister-row">
          <h4 className="sellerRegister-Heading">
            Register as Delivery Company
          </h4>
        </div>
        <hr />
        <Row>
          <Col md={6}>
            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              initialValues={{ code: "+971" }}
            >
              <h5 className="mb-3">Business Information</h5>

              <Form.Item
                label="Business / Company Name"
                name="business_name"
                rules={[
                  { required: true, message: "Business name is required" },
                ]}
              >
                <Input placeholder="Enter business name" size="large" />
              </Form.Item>

              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "Phone number is required",
                  },
                ]}
              >
                <Input
                  addonBefore={<PrefixSelector />}
                  size="large"
                  placeholder="Enter Phone Number"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </Form.Item>

              <h5 className="mb-3 mt-4">Location</h5>

              <Form.Item
                label="State"
                name="state"
                rules={[{ required: true, message: "State is required" }]}
              >
                <Select placeholder="Select State" size="large">
                  {states?.map((item: any) => (
                    <Select.Option key={item.id} value={item.name}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="City"
                name="city"
                rules={[{ required: true, message: "City is required" }]}
              >
                <Input placeholder="Enter city" size="large" />
              </Form.Item>

              <h5 className="mb-3 mt-4">Payment Details</h5>

              <Form.Item
                label="Bank Name"
                name="bank_name"
                rules={[{ required: true, message: "Bank name is required" }]}
              >
                <Input placeholder="Enter bank name" size="large" />
              </Form.Item>

              <Form.Item
                label="Account Number"
                name="account_number"
                rules={[
                  { required: true, message: "Account number is required" },
                ]}
              >
                <Input
                  placeholder="Enter account number"
                  size="large"
                  type="number"
                />
              </Form.Item>

              <h5 className="mb-3 mt-4">Account Login</h5>

              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Email is required",
                  },
                  {
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                    message: "Please enter a valid email address",
                  },
                ]}
              >
                <Input placeholder="Enter email address" size="large" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Password is required" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
              >
                <Input.Password placeholder="Enter password" size="large" />
              </Form.Item>

              <Form.Item
                name="terms"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("You must accept the terms and conditions")
                          ),
                  },
                ]}
              >
                <Checkbox>
                  I agree to {API.NAME}'s{" "}
                  <a href="/terms_of_service" target="_blank">
                    Terms & Conditions
                  </a>
                </Checkbox>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                >
                  Register Company
                </Button>
              </Form.Item>

              <Button
                size="large"
                block
                onClick={() => navigation.push("/seller")}
              >
                Back
              </Button>
            </Form>
          </Col>
          <Col md={6}>
            <div className="sellerRegister-box2">
              <h5 className="sellerRegister-subHeading">
                Partner with {API.NAME} as a Delivery Company
              </h5>
              <p className="sellerRegister-text1">
                Join our growing network of delivery partners and expand your
                business reach. Enjoy seamless order management, timely
                payments, and dedicated support.
              </p>
              <ul className="sellerRegister-text1">
                <li>Access to thousands of daily orders</li>
                <li>Competitive delivery rates</li>
                <li>Reliable and timely payments</li>
                <li>Real-time order tracking system</li>
                <li>24/7 customer support</li>
              </ul>
            </div>
          </Col>
        </Row>
        <br />
      </Container>
    </div>
  );
}

export default DeliveryCompanyRegistration;
