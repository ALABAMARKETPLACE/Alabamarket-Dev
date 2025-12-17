"use client";
import { Button, Col, Form, Input, Row, notification } from "antd";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from "firebase/auth";
import { InputOTP } from "antd-input-otp";
import { Auth } from "@/util/firebaseProvider";
import API from "@/config/API";
import { PUT } from "@/util/apicall";
import PrefixSelector from "@/components/prefixSelector/page";
import { useSession } from "next-auth/react";

function EditMobilenumberChange(props: any) {
  const [form] = Form.useForm();
  const { data:session, update } :any= useSession();
  const User = session?.user; 
  const [isLoading, setIsLoading] = useState(false);
  const [autho, setAutho] = useState<any>(null);
  const [data, setData] = useState<any>({});
  const [error, setError] = useState<any>(null);
  const [notificationApi, contextHolder] = notification.useNotification();
  const [otpModal, setotpModal] = useState(false);
  const [nameInput, setnameInput] = useState(true);

  const checkUser = async () => {
    try {
      let user: any = Auth.currentUser;
      if (user?.phoneNumber) {
        signOut(user);
      }
    } catch (err) {}
  };

  const LoginVerifyOtp = async () => {
    const values = await form.validateFields();
    try {
      setData(values);
      setIsLoading(true);
      checkUser();
      let recaptchas = await new RecaptchaVerifier(Auth, "recaptcha", {});
      let phone = `${values.code}${values.phone}`;
      let checkPhone: any = await signInWithPhoneNumber(
        Auth,
        phone,
        recaptchas
      );
      if (checkPhone?.verificationId) {
        setAutho(checkPhone);
        setotpModal(true);
        setnameInput(false);
      } else {
        setError("Something went wrong");
      }
      setIsLoading(false);
    } catch (err) {
      setotpModal(false);
      setnameInput(true);

      setIsLoading(false);
      setError("Something went wrong");
    }
  };
  const verifyOtp = async () => {
    const values = await form.validateFields();
    try {
      setIsLoading(true);
      let otp = values.otp.join("");
      let verify = await autho.confirm(otp);
      const token = await verify?.user?.getIdToken();
      if (token) {
        PhoneVerifyOtp(token);
      }
    } catch (err) {
      setIsLoading(false);
      setError("Something went wrong during OTP verification");
      console.log("verifyOtp err", err);
    }
  };

  const PhoneVerifyOtp = async (token: string) => {
    try {
      setIsLoading(true);
      let url = API.USER_PHONENUMBER_UPDATE;
      let body = {
        countryCode: data?.code,
        idToken: token,
      };
      var loginRes: any = await PUT(url, body);

      if (loginRes.status == true) {
        await update({
          user : {
            ...session?.user,
            phone: data?.phone,
            countrycode: data?.code,
          }
        })
        notificationApi.success({ message: loginRes.message });
        setotpModal(false);
        setIsLoading(false);
      } else {
        notificationApi.error({ message: loginRes.message });
        setError(loginRes.message);
      }
    } catch (err:any) {
      if (err.message.includes("Already Used")) {
       notificationApi.error({ message: "The number you have chosen is already in use" });

    }} finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {contextHolder}
      <Form
        form={form}
        initialValues={{ code: User?.countrycode || "+971", phone: User?.phone }}
      >
        <div style={{ display: "flex" }}>
          <Row gutter={16} justify={"start"}>
            <Col md={12} sm={12} xs={24}>
              {nameInput ? (
                <Form.Item name="phone">
                  <Input
                    addonBefore={<PrefixSelector />}
                    size="large"
                    placeholder="Enter Your Number"
                  ></Input>
                </Form.Item>
              ) : null}
            </Col>
            {otpModal ? null : <div id="recaptcha"></div>}
            {otpModal ? (
              <Col md={24}>
                <div className="input_otp">
                  <Form.Item
                    name="otp"
                    rules={[
                      {
                        required: true,
                        message: "Input 6 digit verification code!",
                      },
                    ]}
                  >
                    <InputOTP autoFocus inputType="numeric" length={6} />
                  </Form.Item>
                </div>
              </Col>
            ) : null}
            <Col md={12} sm={12} xs={24}>
              {nameInput || otpModal ? (
                <Button
                  className="Modify_btn"
                  loading={isLoading}
                  type="primary"
                  onClick={otpModal ? verifyOtp : LoginVerifyOtp}
                >
                  {otpModal ? "VERIFY" : "GET OTP"}
                </Button>
              ) : null}
            </Col>
          </Row>
        </div>
      </Form>
    </div>
  );
}

export default EditMobilenumberChange;
