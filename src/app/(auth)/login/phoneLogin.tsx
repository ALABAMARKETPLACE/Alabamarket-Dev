import React, { useState } from "react";
import { Button, Form, Input, Select, notification } from "antd";
import { BiErrorCircle } from "react-icons/bi";
import { InputOTP } from "antd-input-otp";
import { Auth } from "@/util/firebaseProvider";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from "firebase/auth";
import PrefixSelector from "@/components/prefixSelector/page";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { storeToken } from "@/redux/slice/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import API from "@/config/API";
import { GET } from "@/util/apicall";


function PhoneLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [verification, setverification] = useState(false);
  const [autho, setautho] = useState<any>(null);
  const [data, setdata] = useState<any>({});
  const [error, setError] = useState<any>(null);
  const [notificationApi, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();
  const navigation = useRouter();
  const dispatch = useAppDispatch();
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

  const LoginPhone = async (values: any) => {
    const url = `${API.USER_CHECK_PHONE}${values.phone}`; 
    const response: any = await GET(url); 
    console.log('response',response)
    try {
      // Check if the user exists
      const response: any = await GET(url); 
      if (response?.data===false) { 
        setError("This phone number is not registered. Please create an account.");
        setIsLoading(false);
        return;
      }
  
      setdata(values);
      setIsLoading(true);
      checkuser();
      setError("");
  
      const recaptchas = await new RecaptchaVerifier(Auth, "recaptcha", {});
      const phone = `${values.code}${values.phone}`;
  
      const checkPhone: any = await signInWithPhoneNumber(Auth, phone, recaptchas);
      if (checkPhone?.verificationId) {
        setautho(checkPhone);
        setverification(true);
      } else {
        setError("Phone Login Failed.. Try later");
      }
      setIsLoading(false);
    } catch (err: any) {
      console.log(err);
      if (err?.message?.includes("invalid-phone")) {
        setError("Invalid Phone number Try again");
      } else {
        setError("Phone Login Failed.. Try later");
      }
      setverification(false);
      setIsLoading(false);
    }
  };
  
  const verifyOtp = async (values: any) => {
    try {
      setIsLoading(true);
      let otp = values.otp.join("");
      let verify = await autho.confirm(otp);
      const token = await verify?.user?.getIdToken();
      if (token) {
        await PhoneLogin(token);
      } else throw new Error("No token found.");
    } catch (err: any) {
      if (err?.message?.includes("invalid-verification")) {
        setError("Invalid Otp, Please try again");
      } else {
        setError("Phone Login failed. Please try later.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const PhoneLogin = async (token: string) => {
    try {
      setIsLoading(true);
      const result: any = await signIn("phone", {
        redirect: false,
        code: data?.code,
        idToken: token,
      });
      if (result.ok) {
        const session: any = await getSession();
        dispatch(
          storeToken({
            token: session?.token,
            refreshToken: session?.refreshToken,
          })
        );
        navigation.replace("/auth");
      } else {
        notificationApi.error({
          message: result.error || "something went wrong.",
        });
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="PhoneLogin">
      {contextHolder}
      <div>
        <div className="LoginScreen-txt2">
          {verification
            ? `Enter OTP send to your mobile number ${data?.code} ${data?.phone}`
            : "Enter your phone Number and we’ll check for you."}
        </div>
        <br />
        <Form
          onFinish={verification ? verifyOtp : LoginPhone}
          initialValues={{ code: "+91" }}
          form={form}
        >
          {verification ? (
            <Form.Item
              name="otp"
              rules={[
                {
                  required: true,
                  message: "Input 6 digit verification code !",
                },
              ]}
            >
              <InputOTP autoFocus inputType="numeric" length={6} />
            </Form.Item>
          ) : (
            <>
              <Form.Item
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "Input your phone number!",
                  },
                  { min: 8, message: "Please enter a valid phone number" },
                  { max: 14, message: "Please enter a valid phone number" },
                ]}
              >
                <Input
                  addonBefore={<PrefixSelector />}
                  style={{ width: "100%" }}
                  size="large"
                  placeholder="Enter Phone Number"
                  type="number"
                />
              </Form.Item>
              <div id="recaptcha"></div>
            </>
          )}
          {error ? (
            <div className="LoginScreen-errortxt">
              <BiErrorCircle />
              &nbsp;
              {error}
            </div>
          ) : null}
          <Form.Item>
            <Button
              loading={isLoading}
              block
              size="large"
              type="primary"
              htmlType="submit"
              style={{ height: 45 }}
            >
              {verification ? "Login" : "Get OTP"}
            </Button>
            {error ? (
              <Button
                className="mt-2"
                block
                size="large"
                style={{ height: 40 }}
                htmlType="submit"
                onClick={(values: any) => {
                  LoginPhone(values);
                  form.setFieldsValue({ otp: "" });
                }}
              >
                {"Resend OTP"}
              </Button>
            ) : null}
          </Form.Item>
        </Form>
        <hr />
      </div>
    </div>
  );
}
export default PhoneLogin;
