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
        <Row>
          <Col md={4}>
            <Form
              onFinish={onFinish}
              initialValues={{
                first_name: Auth
                  ? User?.user?.first_name
                  : formData?.first_name,
                last_name: Auth
                  ? User?.user?.last_name ?? formData?.last_name
                  : formData?.last_name,
                email: Auth
                  ? User?.user?.email ?? formData?.email
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
                code: Auth ? User?.user?.countrycode ?? "+234" : "+234",
                phone: Auth
                  ? User?.user?.phone ?? formData.phone
                  : formData.phone,
              }}
              // disabled={userType === 'user'}
            >
              <Row>
                <Col sm={6} xs={6}>
                  <div className="input-form-label">First Name</div>
                  <Form.Item
                    name={"first_name"}
                    rules={[
                      { required: true, message: "name is required" },
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
                <Col sm={6} xs={6}>
                  <div className="input-form-label">Last Name</div>
                  <Form.Item
                    name={"last_name"}
                    rules={[
                      { required: true, message: "name is required" },
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
              <div className="input-form-label">Enter Email</div>
              <Form.Item
                name={"email"}
                rules={[
                  { required: true, message: "email is required" },
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
              <div className="input-form-label">Enter Phone</div>
              <Form.Item
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
                  type="number"
                  disabled={userType === "user" && User?.data?.phone}
                />
              </Form.Item>
              <div className="input-form-label">Enter password</div>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "password is required", min: 8 },
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
              <div className="input-form-label">Confirm password</div>
              <Form.Item
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
                          "The new password that you entered do not match!"
                        )
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
              <Row>
                <Col md="12">
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      size="large"
                      loading={loading}
                    >
                      Continue
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Col>
          <Col md={8}>
            <div className="sellerRegister-box2">
              <h4 className="sellerRegister-subHeading">
                Why sell on {API.NAME}?
              </h4>
              <div className="sellerRegister-text1">
                Customers love having a trusted destination where they can
                purchase a wide variety of goods - which is what makes sellers
                like you so important. As a {API.NAME} seller, you take part in
                offering those shoppers better selection, better prices, and a
                top-notch customer experience.
              </div>
              <Row className="mt-3 text-start gy-3">
                <Col md="4">
                  <FcInTransit size={35} />
                  <div className="sellerRegister-text2 mt-3">
                    Sell Across Dubai
                  </div>
                  <div className="sellerRegister-text1">
                    Reach over 50 crore+ customers across 27000+ pincodes
                  </div>
                </Col>
                <Col md="4">
                  <FcBullish size={35} />
                  <div className="sellerRegister-text2 mt-3">
                    Higher Profits
                  </div>
                  <div className="sellerRegister-text1">
                    With 0% commission* , you take 100% profits with you
                  </div>
                </Col>
                <Col md="4">
                  <FcCustomerSupport size={35} />
                  <div className="sellerRegister-text2 mt-3">
                    24x7 Seller Support
                  </div>
                  <div className="sellerRegister-text1">
                    All your queries and issues are answered by our dedicated
                    Seller Support Team
                  </div>
                </Col>
                <Col md="4">
                  <FcSalesPerformance size={35} />
                  <div className="sellerRegister-text2 mt-3">
                    Fast & Regular Payments
                  </div>
                  <div className="sellerRegister-text1">
                    Get payments as fast as 7-10 days from the date of dispatch
                  </div>
                </Col>
                <Col md="4">
                  <FcIphone size={35} />
                  <div className="sellerRegister-text2 mt-3">
                    Business on the go
                  </div>
                  <div className="sellerRegister-text1">
                    Download our {API.NAME} Seller App to manage your business
                    anywhere, anytime
                  </div>
                </Col>
                <Col md="4">
                  <TbTruckReturn color="orange" size={35} />
                  <div className="sellerRegister-text2 mt-3">
                    Lower Return Charges
                  </div>
                  <div className="sellerRegister-text1">
                    With our flat and low return charges, ship your products
                    stress-free
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
