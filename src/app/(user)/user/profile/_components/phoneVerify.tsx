"use client";
import { Button, Form, notification } from "antd";
import { InputOTP } from "antd-input-otp";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from "firebase/auth";
import React, { useState } from "react";
import { BiErrorCircle } from "react-icons/bi";
import "../../style.scss";
import { Auth } from "@/util/firebaseProvider";
import { PUT } from "@/util/apicall";
import API from "@/config/API";

function PhoneVerifyOtp(props: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [verification, setVerification] = useState(false);
  const [data, setData] = useState<any>({});
  const [error, setError] = useState<any>(null);
  const [resendInitiated, setResendInitiated] = useState(false);
  const [notificationApi, contextHolder] = notification.useNotification();

  const checkUser = async () => {
    try {
      let user: any = Auth.currentUser;
      if (user?.phoneNumber) {
        signOut(user);
      }
    } catch (err) {
      console.log("checkuser err", err);
    }
  };

  const resendOtp = async () => {
    try {
      setResendInitiated(true);
      checkUser();
      let recaptchas = await new RecaptchaVerifier(Auth, "recaptcha", {});
      let phone = `${data.countrycode}${data.phone}`;
      let checkPhone: any = await signInWithPhoneNumber(
        Auth,
        phone,
        recaptchas
      );

      if (checkPhone?.verificationId) {
        props.setAutho(checkPhone);
        setVerification(true);
      } else {
        setError("Something went wrong during resend");
      }
      setResendInitiated(false);
    } catch (err) {
      setVerification(false);
      console.log("ResendOtp error", err);
      setResendInitiated(false);
      setError("Failed to resend OTP. Try again.");
    }
  };

  const LoginVerifyOtp = async (values: any) => {
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
        props.setAutho(checkPhone);
        setVerification(true);
      } else {
        setError("Something went wrong");
      }
      setIsLoading(false);
    } catch (err) {
      setVerification(false);
      console.log("LoginPhone error", err);
      setIsLoading(false);
      setError("Something went wrong");
    }
  };

  const verifyOtp = async (values: any) => {
    try {
      setIsLoading(true);
      let otp = values.otp.join("");
      let verify = await props.autho.confirm(otp);
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
      console.log(data);
      let body = {
        countryCode: data?.code,
        idToken: token,
      };
      var loginRes: any = await PUT(url, body);
      if (loginRes.status == true) {
        notificationApi.success({ message: loginRes.message });
        // dispatch(update(loginRes?.data));
        props.close();
        setIsLoading(false);
      } else {
        notificationApi.error({ message: loginRes.message });
        setError(loginRes.message);
      }
    } catch (err) {
      notificationApi.error({ message: "Something went wrong." });
      console.log("err on PhoneVerifyOtp", err);
    } finally {
      setIsLoading(false);
    }
  };

  const [inputValue, setInputValue] = useState("");
  const handlePhoneInputChange = (e: any) => {
    const inputValue = e?.target?.value;
    setInputValue(inputValue);
  };

  return (
    <div className="PhoneLogin">
      {contextHolder}
      <div>
        <div className="LoginScreen-txt2">
          <div>
            <div className="PhoneVerifyOtp-txt2">OTP Verification </div>
            We will send you a <b>One Time Password</b> on your Mobile Number
          </div>
        </div>
        <br />
        <Form onFinish={props.verification ? verifyOtp : LoginVerifyOtp}>
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

          {error ? (
            <div className="LoginScreen-errortxt">
              <BiErrorCircle />
              &nbsp;
              {error}. Try another way
            </div>
          ) : null}

          <Form.Item>
            <Button
              loading={isLoading}
              block
              type="primary"
              htmlType="submit"
              style={{ height: 40 }}
            >
              VERIFY & PROCEED
            </Button>
          </Form.Item>

          {verification && !resendInitiated && (
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <Button onClick={resendOtp}>RESEND OTP</Button>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
}
export default PhoneVerifyOtp;
