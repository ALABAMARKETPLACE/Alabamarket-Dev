"use client";
import { Button, Input, Modal, notification } from "antd";
import React, { use, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,

} from "firebase/auth";
import { Auth } from "@/util/firebaseProvider";
import API from "@/config/API";
import { POST, PUT } from "@/util/apicall";
import listItems from "./listItems.json"
import { signOut, useSession } from "next-auth/react";
const listItems2 = [
  {
    text: "Reactivation is easy.",
    className: "profile-dashboard-txt11",
  },
  {
    text: `Simply Login with your registered email id or mobile number and password combination used prior to deactivation. Your account data is fully restored. Default settings are applied, and you will be subscribed to receive promotional emails from ${API.NAME}.`,
    className: "profile-dashboard-txt12",
  },
  {
    text: `${API.NAME} retains your account data for you to conveniently start off from where you left if you decide to reactivate your account`,
    className: "profile-dashboard-txt11",
  },
  {
    text: "Remember: Account Reactivation can be done on the desktop version Only.",
    className: "profile-dashboard-txt11",
  },
];
const checkuser = async () => {
  try {
    let user: any = Auth.currentUser;
    if (user?.phoneNumber) {
      signOut(user);
    }
  } catch (err) {
    console.log("checkuser err", err);
  }
};

function DeactivateModal(props: any) {
  const { data : session } : any = useSession();
  const User = session?.user;
  const [autho, setautho] = useState<any>(null);
  const [verification, setverification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [enterOtp, setEnterOtp] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [notificationApi, contextHolder] = notification.useNotification();
  const LoginPhone = async () => {
    try {
      setIsLoading(true);
      checkuser();
      let recaptchas = new RecaptchaVerifier(Auth, "recaptcha", {});
      let phone = User?.countrycode + User?.phone;
      let checkPhone: any = await signInWithPhoneNumber(
        Auth,
        phone,
        recaptchas
      );
      if (checkPhone?.verificationId) {
        setautho(checkPhone);
        setverification(true);
        setEnterOtp(true);
      } else {
        // setError(true);
      }
      setIsLoading(false);
    } catch (err) {
      setverification(false);
      setEnterOtp(false);
      console.log("LoginPhone = = = >", err);
      setIsLoading(false);
      //   setError(true);
    }
  };
  const verifyOtp = async () => {
    if (otp.length) {
      try {
        setOtpLoading(true);
        let verify = await autho.confirm(otp);
        const token = await verify?.user?.getIdToken();
        if (token) {
          deactivateAccount(token);
        }
      } catch (err) {
        notificationApi.success({
          message: `Failed to Verify`,
        });
        setOtpLoading(false);
        setverification(false);
      } finally {
      }
    }
  };
  const deactivateAccount = async (token: string) => {
    try {
      setIsLoading(true);
      const url = API.USER_DEACTIVATE;
      const body = { idToken: token };
      const response: any = await PUT(url, body);
      if (response.status) {
        // dispatch(update(response));
        setEnterOtp(false);
        notificationApi.success({
          message: `Your Account has been Deactivated Successfully`,
        });
        props?.cancelModal();
        signOut()
      } else {
        notificationApi.error({ message: response.message ?? "" });
      }
    } catch (err) {
      notificationApi.error({
        message: "Failed to Update your Account status.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const verifyEmail = async () => {
    try {
      setIsLoading(true);
      const response: any = await POST(API.USER_REQUEST_DEACTIVATE, {});
      if (response?.status) {
        notificationApi.success({
          message: `Account deactivation link has been sent to your registred Email ID, please check, Valid for only 5 minute`,
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      notificationApi.error({ message: `something went wrong!` });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Modal
      width={1000}
      open={props?.open || false}
      //   onOk={handleOk}
      onCancel={() => {
        props?.cancelModal();
        setEnterOtp(false);
        setverification(false);
      }}
      footer={null}
      centered
    >
      {contextHolder}
      <div>
        <Row>
          <Col md={8}>
            <div className="profile-dashboard-Box3">
              When you deactivate your account
            </div>
            {listItems.map((item: any) => (
              <ul>
                <li key={item.text} className="profile-dashboard-txt10">
                  {item.text}
                </li>
              </ul>
            ))}
            <div className="profile-dashboard-Box3">
              How do I reactivate my {API.NAME} account?
            </div>
            {listItems2.map((item) => (
              <div style={{ paddingLeft: "14px" }}>
                <p key={item.text} className={item.className}>
                  {item.text}
                </p>
              </div>
            ))}
          </Col>
          <Col md={4}>
            <div className="profile-dashboard-Box3">
              Are you sure you want to leave?
            </div>
            <Input
              size="large"
              placeholder="Email Address"
              defaultValue={User?.email}
              disabled
            ></Input>
            <br />
            <br />
            <Input
              size="large"
              placeholder="Mobile Number"
              defaultValue={
                User?.phone_verify
                  ? User?.countrycode + " " + User?.phone
                  : ""
              }
              disabled
            ></Input>
            <br />

            {enterOtp ? (
              <>
                <br />
                <Input
                  size="large"
                  placeholder="Enter Recieved OTP"
                  onChange={(e: any) => setOtp(e?.target?.value)}
                ></Input>
              </>
            ) : null}
            <br />
            <br />
            <Button
              size="large"
              block
              className="profile-dashboard-Btn2"
              onClick={
                verification
                  ? verifyOtp
                  : User?.phone_verify
                  ? LoginPhone
                  : verifyEmail
              }
              loading={isLoading}
            >
              {verification
                ? "CONFIRM DEACTIVATION"
                : User?.phone_verify
                ? "Verify Phone Number"
                : "Verify Email ID"}
            </Button>
            {verification ? null : <div id="recaptcha"></div>}
            <br />
            <br />
            <div
              className="profile-dashboard-Box4"
              onClick={() => {
                props?.cancelModal();
                setEnterOtp(false);
                setverification(false);
              }}
            >
              NO LET ME STAY !
            </div>
          </Col>
        </Row>
      </div>
    </Modal>
  );
}

export default DeactivateModal;
