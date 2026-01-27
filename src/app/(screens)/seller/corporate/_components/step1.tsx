import { Col, Container, Row } from "react-bootstrap";
import { Form, Input, Button, Select, notification } from "antd";
import {
  FcBullish,
  FcCustomerSupport,
  FcInTransit,
  FcIphone,
  FcSalesPerformance,
} from "react-icons/fc";
import { TbTruckReturn } from "react-icons/tb";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import PrefixSelector from "../../../../../components/prefixSelector/page";
import API from "../../../../../config/API";
import { POST } from "../../../../../util/apicall";
import { useSession } from "next-auth/react";
function Step1({ moveToNextStep, formData }: any) {
  const [loading, setLoading] = useState(false);
  const { data: User }: any = useSession();
  const Auth = User?.user;
  const [Notifications, contextHolder] = notification.useNotification();
  const userType = User?.role;
  const onFinish = async (values: any) => {
    // alert('submitting.')
    try {
      await checkEmailandPhone(values);
    } catch (error) {
      console.log(error);
    }
  };
  // const checkEmailandPhone = async (values: any) => {

  //   const url = API.USER_CHECK_IFEXIS;
  //   if (Auth) {
  //     //only if user is not signed in we'll check if the phone or email is already used
  //     moveToNextStep({ step1Data: values });
  //   } else {
  //     try {
  //       setLoading(true);
  //       const obj = {
  //         email: values?.email,
  //         phone: values.phone,
  //       };
  //       const response: any = await POST(url, obj);
  //       if (response.status) {
  //         moveToNextStep({ step1Data: values });
  //       } else {
  //         Notifications["error"]({
  //           message: response?.message ?? "",
  //         });
  //       }
  //     } catch (err) {
  //       Notifications["error"]({
  //         message: `Something went wrong`,
  //       });
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  // };
  // const checkEmailandPhone = async (values: any) => {
  //   const url = API.USER_CHECK_IFEXIS;

  //   if (Auth) {
  //     moveToNextStep({ step1Data: values });
  //   } else {
  //     try {
  //       setLoading(true);
  //       const obj = {
  //         email: values?.email,
  //         phone: values.phone,
  //       };

  //       const response: any = await POST(url, obj);

  //       if (response.status) {
  //         moveToNextStep({ step1Data: values });
  //       } else {
  //         // Show specific error messages for phone/email existence
  //         if (response.type === "phone") {
  //           Notifications["error"]({
  //             message:
  //               "This phone number is already registered. Please use a different number.",
  //           });
  //         } else if (response.type === "email") {
  //           Notifications["error"]({
  //             message:
  //               "This email is already registered. Please use a different email.",
  //           });
  //         } else {
  //           Notifications["error"]({
  //             message:
  //               response?.message || "This information is already registered",
  //           });
  //         }
  //       }
  //     } catch (err) {
  //       Notifications["error"]({
  //         message: "Something went wrong",
  //       });
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  // };
  const checkEmailandPhone = async (values: any) => {
    const url = API.USER_CHECK_IFEXIS;
    if (Auth) {
      //only if user is not signed in we'll check if the phone or email is already used
      moveToNextStep({ step1Data: values });
    } else {
      try {
        setLoading(true);
        const obj = {
          email: values?.email,
          phone: values.phone,
        };

        const response: any = await POST(url, obj);

        if (response.status) {
          moveToNextStep({ step1Data: values });
        } else {
          // Show specific error messages for phone/email existence
          if (response.type === "phone") {
            Notifications["error"]({
              message:
                "This phone number is already registered. Please use a different number.",
            });
          } else if (response.type === "email") {
            Notifications["error"]({
              message:
                "This email is already registered. Please use a different email.",
            });
          } else {
            Notifications["error"]({
              message:
                response?.message || "This information is already registered",
            });
          }
        }
      } catch (err) {
        Notifications["error"]({
          message: "Something went wrong",
        });
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <div>
      {contextHolder}
      <Container>
        <Row className="gy-4">
          <Col xs={12} md={7}>
            <div className="seller-card">
              <h5 className="sellerRegister-subHeading mb-4">
                Personal Information
              </h5>
              <Form
                onFinish={onFinish}
                initialValues={{
                  first_name: Auth
                    ? User?.user?.first_name
                    : formData?.first_name,
                  last_name: Auth
                    ? (User?.user?.last_name ?? formData?.last_name)
                    : formData?.last_name,
                  email: Auth
                    ? (User?.user?.email ?? formData?.email)
                    : formData?.email,
                  password: Auth
                    ? User?.user?.password
                      ? "**********"
                      : formData?.password
                    : formData?.password,
                  confirm_password: Auth
                    ? User?.user?.password
                      ? "**********"
                      : formData?.password
                    : formData?.password,
                  code: Auth ? (User?.user?.countrycode ?? "+234") : "+234",
                  phone: Auth
                    ? (User?.user?.phone ?? formData.phone)
                    : formData.phone,
                }}
                layout="vertical"
              >
                <Row>
                  <Col sm={6} xs={12}>
                    <Form.Item
                      label={
                        <span className="input-form-label">First Name</span>
                      }
                      name={"first_name"}
                      rules={[
                        { required: true, message: "Name is required" },
                        { max: 50, message: "Name is too long" },
                      ]}
                    >
                      <Input
                        placeholder="Enter name"
                        size="large"
                        disabled={userType === "user" && User?.data?.first_name}
                      />
                    </Form.Item>
                  </Col>
                  <Col sm={6} xs={12}>
                    <Form.Item
                      label={
                        <span className="input-form-label">Last Name</span>
                      }
                      name={"last_name"}
                      rules={[
                        { required: true, message: "Name is required" },
                        { max: 50, message: "Name is too long" },
                      ]}
                    >
                      <Input
                        placeholder="Enter name"
                        size="large"
                        disabled={userType === "user" && User?.data?.last_name}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={
                    <span className="input-form-label">Email Address</span>
                  }
                  name={"email"}
                  rules={[
                    { required: true, message: "Email is required" },
                    {
                      type: "email",
                      message: "The input is not valid E-mail!",
                    },
                    { max: 100, message: "Email is too long" },
                  ]}
                >
                  <Input
                    placeholder="Enter email"
                    size="large"
                    disabled={userType === "user"}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="input-form-label">Phone Number</span>}
                  name="phone"
                  rules={[
                    {
                      required: true,
                      message: "Input your phone number!",
                    },
                    { max: 16, message: "Phone number is Invalid" },
                    { min: 7, message: "Phone number is Invalid" },
                  ]}
                >
                  <Input
                    addonBefore={<PrefixSelector />}
                    style={{ width: "100%" }}
                    size="large"
                    placeholder="Enter Phone Number"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    disabled={userType === "user" && User?.data?.phone}
                  />
                </Form.Item>

                <Row>
                  <Col xs={12} sm={6}>
                    <Form.Item
                      label={<span className="input-form-label">Password</span>}
                      name="password"
                      rules={[
                        {
                          required: true,
                          message: "Password is required",
                          min: 8,
                        },
                        { max: 20, message: "Password is too long" },
                      ]}
                      hasFeedback
                    >
                      <Input.Password
                        placeholder="Enter password"
                        size="large"
                        disabled={userType === "user" && User?.data?.password}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Form.Item
                      label={
                        <span className="input-form-label">
                          Confirm Password
                        </span>
                      }
                      name="confirm_password"
                      rules={[
                        { required: true, message: "Confirm password" },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(
                                "The new password that you entered do not match!",
                              ),
                            );
                          },
                        }),
                      ]}
                      dependencies={["password"]}
                      hasFeedback
                    >
                      <Input.Password
                        placeholder="Confirm password"
                        size="large"
                        disabled={userType === "user" && User?.data?.password}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item className="mt-4">
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={loading}
                    className="btn-primary-custom"
                  >
                    Continue
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Col>
          <Col xs={12} md={5}>
            <div className="seller-info-panel">
              <h4 className="sellerRegister-subHeading">
                Why sell on {API.NAME}?
              </h4>
              <div className="sellerRegister-text1 mb-4">
                Customers love having a trusted destination where they can
                purchase a wide variety of goods. As a seller, you take part in
                offering those shoppers better selection, better prices, and a
                top-notch customer experience.
              </div>
              <Row className="g-3">
                <Col md="6">
                  <div className="p-2">
                    <FcInTransit size={28} />
                    <div className="sellerRegister-text2 mt-2 mb-1">
                      Sell Across Nigeria
                    </div>
                    <div
                      className="sellerRegister-text1"
                      style={{ fontSize: 13 }}
                    >
                      Reach millions of customers
                    </div>
                  </div>
                </Col>
                <Col md="6">
                  <div className="p-2">
                    <FcBullish size={28} />
                    <div className="sellerRegister-text2 mt-2 mb-1">
                      Higher Profits
                    </div>
                    <div
                      className="sellerRegister-text1"
                      style={{ fontSize: 13 }}
                    >
                      With 5% Commission*
                    </div>
                  </div>
                </Col>
                <Col md="6">
                  <div className="p-2">
                    <FcCustomerSupport size={28} />
                    <div className="sellerRegister-text2 mt-2 mb-1">
                      24x7 Support
                    </div>
                    <div
                      className="sellerRegister-text1"
                      style={{ fontSize: 13 }}
                    >
                      Dedicated Seller Support Team
                    </div>
                  </div>
                </Col>
                <Col md="6">
                  <div className="p-2">
                    <FcSalesPerformance size={28} />
                    <div className="sellerRegister-text2 mt-2 mb-1">
                      Fast Payments
                    </div>
                    <div
                      className="sellerRegister-text1"
                      style={{ fontSize: 13 }}
                    >
                      Get paid in 7-10 days
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default Step1;
