import React, { useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import {
  Form,
  Input,
  Button,
  notification,
  Radio,
  Select,
  Checkbox,
} from "antd";
// COMMENTED: OTP verification disabled
// import {
//   RecaptchaVerifier,
//   signInWithPhoneNumber,
//   signOut,
// } from "firebase/auth";
import { FaUsersGear, FaLocationDot } from "react-icons/fa6";
// import { Auth } from "../../../../../util/firebaseProvider";
import { TbCategoryFilled } from "react-icons/tb";
import { IoEarthSharp } from "react-icons/io5";
// import useToggle from "../../../../../shared/hook/useToggle";
import languagesList from "../../../../../shared/helpers/language.json";
import hobbiesList from "../../../../../shared/helpers/hobbies.json";
import educationLevels from "../../../../../shared/helpers/educationlevels.json";
// import OtpModal from "../../_components/otpModal";
import PrefixSelector from "../../../../../components/prefixSelector/page";
import API from "../../../../../config/API";

function IndividualStep1({
  register,
  loading,
  states,
  moveToNextStep,
  goBack,
}: any) {
  // COMMENTED: OTP-related states no longer needed
  // const [verification, setVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [otpLoading, setOtpLoading] = useState(false);
  // const [autho, setAutho] = useState<any>(null);
  // const [visible, toggleModal] = useToggle(false);
  const [error, setError] = useState<boolean>(false);
  const [notificationApi, contextHolder] = notification.useNotification();
  // const [otpVerified, setOtpVerified] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const [form] = Form.useForm();
  const { Option } = Select;

  // COMMENTED: Firebase OTP verification disabled
  // const checkuser = async () => {
  //   try {
  //     let user: any = Auth.currentUser;
  //     if (user?.phoneNumber) {
  //       await signOut(user);
  //     }
  //   } catch (err) {
  //     console.log("checkuser err", err);
  //   }
  // };

  // const LoginPhone = async (values: any) => {
  //   try {
  //     setFormData(values);
  //     setIsLoading(true);
  //     checkuser();
  //     let recaptchas = new RecaptchaVerifier(Auth, "recaptcha", {});
  //     let phone = `${values.code}${values.phone}`;
  //     let checkPhone: any = await signInWithPhoneNumber(
  //       Auth,
  //       phone,
  //       recaptchas
  //     );
  //     if (checkPhone?.verificationId) {
  //       setAutho(checkPhone);
  //       setVerification(true);
  //       toggleModal(true);
  //     } else {
  //       setError(true);
  //     }
  //     setIsLoading(false);
  //   } catch (err) {
  //     setVerification(false);
  //     toggleModal(false);
  //     console.log("LoginPhone = = = >", err);
  //     setIsLoading(false);
  //     setError(true);
  //   }
  // };

  // const verifyOtp = async (otp: string) => {
  //   try {
  //     setOtpLoading(true);
  //     let verify = await autho.confirm(otp);
  //     if (verify?.user?.phoneNumber) {
  //       setOtpVerified(true);
  //       setError(false);
  //       register(formData);
  //       moveToNextStep();
  //     }
  //   } catch (err) {
  //     setOtpLoading(false);
  //     setError(true);
  //     notificationApi.error({ message: `invalid otp plase try again!` });
  //     setVerification(false);
  //   } finally {
  //     setOtpLoading(false);
  //   }
  // };

  // Direct registration without OTP verification
  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true);
      setFormData(values);
      setError(false);
      // Call register directly without OTP
      await register(values);
      moveToNextStep();
    } catch (err) {
      setError(true);
      notificationApi.error({
        message: `Registration failed. Please try again!`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {contextHolder}
      <Container>
        <Row>
          <Col md={4}>
            <Form
              form={form}
              onFinish={handleSubmit}
              initialValues={{ code: "+971" }}
            >
              <div className="input-form-label">Enter Name</div>
              <Form.Item
                name={"name"}
                rules={[{ required: true, message: "name is required" }]}
              >
                <Input placeholder="Enter name" size="large" />
              </Form.Item>
              <div className="input-form-label">Enter Email</div>
              {/* <Form.Item
                name={"email"}
                rules={[
                  { required: true, message: "email is required" },
                  {
                    type: "email",
                    message: "The input is not valid E-mail!",
                  },
                ]}
              >
                <Input placeholder="Enter email" size="large" />
              </Form.Item> */}
              <Form.Item
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
                <Input placeholder="Enter email" size="large" />
              </Form.Item>
              <div className="input-form-label">Mobile Number</div>
              <Form.Item
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "Input your phone number!",
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

              <div className="input-form-label">Gender</div>
              <Form.Item
                name={"gender"}
                rules={[{ required: true, message: "Gender is required" }]}
              >
                <Radio.Group size="large">
                  <Radio value="male">Male</Radio>
                  <Radio value="female">Female</Radio>
                  <Radio value="other">Other</Radio>
                </Radio.Group>
              </Form.Item>
              <Row>
                <Col sm={6} xs={12}>
                  <div className="input-form-label">Age</div>
                  <Form.Item
                    name={"age"}
                    rules={[{ required: true, message: "Age is required" }]}
                  >
                    <Input placeholder="Enter Age" type="number" size="large" />
                  </Form.Item>
                </Col>
                <Col sm={6} xs={12}>
                  <div className="input-form-label">Prefered Language</div>
                  <Form.Item
                    name={"language"}
                    rules={[
                      {
                        required: true,
                        message: "Preferred Language is required",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select Language"
                      size="large"
                      showSearch={true}
                    >
                      {languagesList.map((language: any) => (
                        <Option key={language.value} value={language.value}>
                          {language.title}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <div className="input-form-label">Education</div>
              <Form.Item name="education">
                <Select placeholder="Educational Qualification" size="large">
                  {educationLevels.map((level) => (
                    <Option key={level.key} value={level.key}>
                      {level.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <div className="input-form-label">Emirates</div>
              <Form.Item
                name={"business_location"}
                rules={[{ required: true, message: "Location is required" }]}
              >
                <Select placeholder="States" size="large">
                  {states?.map((item: any) => {
                    return (
                      <Select.Option key={item.id} value={item.name}>
                        {item.name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>

              <div className="input-form-label">Visa Status</div>
              <Form.Item
                name={"visa_status"}
                rules={[{ required: true, message: "Visa Status is required" }]}
              >
                <Select placeholder="Select Visa Status" size="large">
                  <Select.Option value="active">Active</Select.Option>
                  <Select.Option value="expired">Expired</Select.Option>
                </Select>
              </Form.Item>

              <div className="input-form-label">Interest</div>
              <Form.Item
                name={"interest"}
                rules={[{ required: true, message: "Interest is required" }]}
              >
                <Select
                  placeholder="Select Interest"
                  size="large"
                  showSearch={true}
                >
                  {hobbiesList.map((interest) => (
                    <Option key={interest.hobby} value={interest.hobby}>
                      {interest.hobby}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Checkbox>
                By continuing, I agree to {API.NAME}’s{" "}
                <a href="/terms_of_service" target="_blank">
                  Terms of Use
                </a>{" "}
                &{" "}
                <a href="/privacy-policy" target="_blank">
                  Privacy Policy
                </a>
              </Checkbox>
              <Row>
                <Col>
                  <br />
                  <Form.Item>
                    {/* COMMENTED: Recaptcha not needed without OTP */}
                    {/* {verification ? null : <div id="recaptcha"></div>} */}
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isLoading || loading}
                      size="large"
                      block
                    >
                      Submit & Continue
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Col>
          <Col md={8}>
            <div className="sellerRegister-box2">
              <p className="sellerRegister-subHeading">
                Grow your business faster by selling on {API.NAME}
              </p>
              <p className="sellerRegister-text1">
                Accelerate your business growth on {API.NAME}, a dynamic
                marketplace connecting sellers with a vast and engaged audience.
                Leverage cutting-edge features, seamless user experience, and
                data-driven insights to elevate your brand and boost sales. Join{" "}
                {API.NAME} now and propel your business into the future of
                online commerce.
              </p>
              <Row>
                {data.map((item) => (
                  <Col md={6} key={item.id}>
                    <div className="IndividualStep1-Box1">
                      <div style={{ marginTop: 10 }}>{item.icon}</div>
                      <div style={{ marginLeft: 10 }}>
                        <div className="sellerRegister-text2 mt-3">
                          {item.count}
                        </div>
                        <div className="sellerRegister-text1">{item.text}</div>
                      </div>
                    </div>
                    <br />
                  </Col>
                ))}
              </Row>
            </div>
          </Col>
        </Row>
        <br />
      </Container>
      {/* COMMENTED: OTP Modal not needed */}
      {/* <OtpModal
        open={visible}
        closeModal={() => toggleModal()}
        getOtp={verifyOtp}
        loading={otpLoading}
      /> */}
    </div>
  );
}

const data = [
  {
    id: "unique_id_1",
    icon: <FaUsersGear size={20} color="grey" />,
    count: "50,000+ AED",
    text: "Suppliers are selling commission-free",
  },
  {
    id: "unique_id_2",
    icon: <FaLocationDot size={20} color="grey" />,
    count: "19000+",
    text: "Pincodes supported for delivery",
  },
  {
    id: "unique_id_3",
    icon: <TbCategoryFilled size={20} color="grey" />,
    count: "700 +",
    text: "Categories to sell",
  },
  {
    id: "unique_id_4",
    icon: <IoEarthSharp size={20} color="grey" />,
    count: "Crore of",
    text: "Customers buy across world",
  },
];

export default IndividualStep1;
