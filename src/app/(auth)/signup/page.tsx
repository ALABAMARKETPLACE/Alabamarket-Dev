"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, notification, Space } from "antd";
import { BiErrorCircle } from "react-icons/bi";
import { Container, Row, Col } from "react-bootstrap";
import GmailLogin from "../login/gmailLogin";
import PrefixSelector from "@/components/prefixSelector/page";
import { GET, POST } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import useDebounceQuery from "@/shared/hook/useDebounceQuery";
import { getSession, signIn } from "next-auth/react";
import { useAppDispatch } from "@/redux/hooks";
import { storeToken } from "@/redux/slice/authSlice";
import bgImage from "@/assets/images/position1.jpg";
import "./style.scss";

export default function SignupScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationApi, contextHolder] = notification.useNotification();
  const [phoneTaken, setPhoneTaken] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailId, setEmailId] = useState("");
  const [emailTaken, setEmailTaken] = useState(false);
  const [successmodal, setSuccessmodal] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const debouncePhone = useDebounceQuery(phoneNumber, 300);
  const debounceEmail = useDebounceQuery(emailId, 300);

  const handleSignup = async (values: any) => {
    await Signup(values);
  };

  const Signup = async (values: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const body = {
        email: values?.email,
        password: values?.password,
        first_name: values?.firstname,
        last_name: values?.lastname,
        phone: values?.phone,
        countrycode: values?.code,
      };

      const signupRes: any = await POST(API.SIGNUP, body);

      if (signupRes?.status) {
        setSignupSuccess(true);

        notificationApi.success({
          message: "Account created successfully!",
          description: "Logging you in...",
          duration: 2,
        });

        const result: any = await signIn("credentials", {
          redirect: false,
          email: values?.email,
          password: values?.password,
        });

        if (result?.ok) {
          const session: any = await getSession();
          dispatch(
            storeToken({
              token: session?.token,
              refreshToken: session?.refreshToken,
            })
          );

          setTimeout(() => {
            if (signupRes?.data?.type === "user") {
              router.push("/");
            } else {
              router.push("/auth");
            }
          }, 1000);
        } else {
          setError("Account created but login failed. Please login manually.");
        }
      } else {
        setError(signupRes?.message || "Signup failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkPhoneNumber = async () => {
    if (signupSuccess || isLoading) return;

    if (phoneNumber?.length > 8) {
      try {
        const response = await GET(`${API.USER_CHECK_PHONE}${phoneNumber}`);
        setPhoneTaken(response?.status ? response?.data : false);
      } catch (err) {
        setPhoneTaken(false);
      }
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkEmailId = async () => {
    if (signupSuccess || isLoading) return;

    if (isValidEmail(emailId)) {
      try {
        const response = await GET(`${API.USER_CHECK_EMAIL}${emailId}`);
        setEmailTaken(response?.status ? response?.data : false);
      } catch (err) {
        setEmailTaken(false);
      }
    } else {
      setEmailTaken(false);
    }
  };

  useEffect(() => {
    checkPhoneNumber();
  }, [debouncePhone]);

  useEffect(() => {
    checkEmailId();
  }, [debounceEmail]);

  return (
    <div className="Screen-box">
      {contextHolder}
      
      <div className="auth-container">
        {/* Left Side - Image */}
        <div className="auth-image-side" style={{ backgroundImage: `url(${bgImage.src})` }}>
          <div className="auth-image-text">
            <h3>Join Our Community</h3>
            <p>Create an account to unlock exclusive deals, personalized recommendations, and faster checkout.</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-side">
          <h2 className="signupScreen-txt1">Create your account</h2>
          <div className="signupScreen-txt2">
            Join Alabamarket today to access exclusive deals, track orders, and enjoy a seamless shopping experience.
          </div>

          <Form
            onFinish={handleSignup}
            initialValues={{ code: "+234" }}
            layout="vertical"
          >
            <Row>
              <Col sm={6} xs={6}>
                <Form.Item
                  name={"firstname"}
                  rules={[
                    {
                      required: true,
                      message: "Please enter firstname",
                    },
                    {
                      max: 30,
                      message: "Firstname is too long",
                    },
                  ]}
                >
                  <Input placeholder="First Name" size="large" />
                </Form.Item>
              </Col>
              <Col sm={6} xs={6}>
                <Form.Item
                  name={"lastname"}
                  rules={[
                    {
                      required: true,
                      message: "Please enter lastname",
                    },
                    {
                      max: 30,
                      message: "Lastname is too long",
                    },
                  ]}
                >
                  <Input placeholder="Last Name" size="large" />
                </Form.Item>
              </Col>
            </Row>
            {phoneTaken ? (
              <p className="text-danger my-0 py-0">
                This Phone number is already used
              </p>
            ) : null}
            <Form.Item
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Please input your phone number",
                },
                {
                  max: 14,
                  message: "Phone Number is Invalid",
                },
                {
                  min: 8,
                  message: "Please enter a valid phone number",
                },

                () => ({
                  validator(_, value) {
                    if (phoneTaken) {
                      return Promise.reject(new Error(""));
                    }
                    return Promise.resolve("Phone Number available");
                  },
                }),
              ]}
            >
              <Space.Compact style={{ width: "100%" }}>
                <PrefixSelector />
                <Input
                  style={{ width: "100%" }}
                  size="large"
                  placeholder="Enter Phone Number"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onKeyPress={(e) => {
                    const isNumber = /^[0-9]*$/;
                    if (!isNumber.test(e?.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(ph) => setPhoneNumber(ph?.target?.value)}
                />
              </Space.Compact>
            </Form.Item>

            {emailTaken ? (
              <p className="text-danger my-0 py-0">
                This Email Id is already used
              </p>
            ) : null}
            <Form.Item
              name={"email"}
              rules={[
                {
                  required: true,
                  message: "Please enter your email id",
                },
                {
                  type: "email",
                  message: "Please enter valid email id",
                },
                {
                  max: 60,
                  message: "Email id is Invalid",
                },
                () => ({
                  validator(_, value) {
                    if (emailTaken) {
                      return Promise.reject(new Error(""));
                    }
                    return Promise.resolve("EmailId available");
                  },
                }),
              ]}
            >
              <Input
                placeholder="Enter Email Address"
                size="large"
                onChange={(em) => setEmailId(em?.target?.value)}
              />
            </Form.Item>

            <Form.Item
              name={"password"}
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
                {
                  min: 8,
                  message: "Password must be minimum 8 characters.",
                },
                {
                  max: 16,
                  message: "Password is too long",
                },
              ]}
              hasFeedback
            >
              <Input.Password size="large" placeholder="Enter Password" />
            </Form.Item>
            <Form.Item
              name={"confirm"}
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!",
                },
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
                size="large"
                placeholder="Confirm Password"
              />
            </Form.Item>
            {error ? (
              <div className="signupScreen-errortxt">
                <BiErrorCircle /> &nbsp;
                {error}
              </div>
            ) : null}
            <Button
              block
              size="large"
              className="btn-clr"
              htmlType="submit"
              loading={isLoading}
              style={{ height: 45 }}
            >
              Create Account
            </Button>
          </Form>

          <br />

          <GmailLogin
            closeModal={() => setSuccessmodal(false)}
            openModal={() => setSuccessmodal(true)}
          />
          <br />
          <div
            className="signupScreen-txt4"
            onClick={() => router.push("/login")}
          >
            Already have an account?{" "}
            <span
              className="signupScreen-txt5"
              style={{ color: "#FF5F15" }}
            >
              Login
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
