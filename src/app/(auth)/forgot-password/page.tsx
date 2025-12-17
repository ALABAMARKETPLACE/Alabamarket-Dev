"use client";
import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Button, Form, Input, notification } from "antd";
import { POST } from "@/util/apicall";;
import { useRouter } from "next/navigation";
import API  from "@/config/API_ADMIN";

function ForgotPassword() {
  const [notificationApi, contextHolder] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const ForgotPassword = async (val: any) => {
    try {
      setIsLoading(true);
      let url = API.USER_FORGOT_PASSWORD;
      const obj = {
        email: val?.email,
      };
      const response: any = await POST(url, obj);
      if (response.status) {
        notificationApi.success({
          message: `Password Reset link has been sent to your mail id. Please check`,
        });
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        notificationApi.error({ message: response.message ?? "" });
      }
    } catch (err) {
      notificationApi.error({ message: `Ooops something went wrong...!` });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="Screen-box">
      {contextHolder}
      <br /> <br />
      <Container>
        <Row>
          <Col sm={4} xs={12}></Col>
          <Col sm={4} xs={12}>
            <h2 className="LoginScreen-txt1">Forgot Your Password ?</h2>
            <div className="LoginScreen-txt2">
              Please enter your email address to retrieve your password
            </div>
            <br />
            <div className="LoginScreen-box1">
              <Form onFinish={ForgotPassword}>
                <Form.Item
                  name={"email"}
                  rules={[
                    { required: true, message: "Please enter your email" },
                    {
                      type: "email",
                      message: "The input is not valid E-mail!",
                    },
                  ]}
                >
                  <Input size="large" placeholder="Enter Email" />
                </Form.Item>

                <Row>
                  <Col sm={6} xs={12}></Col>
                  <Col sm={6} xs={12}>
                    <Button
              
                      block
                      size="large"
                      type="primary"
                      htmlType="submit"
                    >
                      Send Request
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
            <br />
          </Col>
          <Col sm={4} xs={12}></Col>
        </Row>
      </Container>
    </div>
  );
}

export default ForgotPassword;
