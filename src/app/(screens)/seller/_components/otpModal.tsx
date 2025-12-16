import { Button, Form, Modal } from "antd";
import React, { useState } from "react";
import OtpInput from "react-otp-input";

function OtpModal(props: any) {
  const [otp, setOtp] = useState("");
  const [form] = Form.useForm();
  const formSubmitHandler = (values: any) => {
    if (values?.otp.length < 6) {
      alert("please enter otp");
    } else {
      props?.getOtp(values.otp);
      setTimeout(() => {
        handleResend();
        props?.closeModal();
      }, 1000);
    }
  };
  const handleResend = () => {
    form.resetFields();
  };

  return (
    <Modal
      title={props.title || "Enter OTP"}
      visible={props?.open}
      footer={null}
      onCancel={() => {
        return;
      }}
      className="d-flex"
      closeIcon={false}
    >
      <Form onFinish={formSubmitHandler} form={form}>
        <div className="px-3">
          <p className="mt-4">
            {props.instructions ||
              "An OTP has been sent to the registered mobile."}
          </p>
          <div>
            <p>{props.codeInputLabel || "Enter your code here"}</p>
            <div className="d-flex">
              <Form.Item
                name="otp"
                rules={[
                  {
                    required: true,
                    message: "Input 6 digit verification code !",
                  },
                ]}
              >
                <OtpInput
                  onChange={setOtp}
                  value={otp}
                  inputStyle={{
                   width: '48px',
                   padding:'5px',
                   margin:'5px',
                   height:'65px',
                   fontSize:'20px',
                   borderRadius:'4px',
                   border:'1px solid #ccc'
                  }}
                  numInputs={6}
                  renderSeparator={<span></span>}
                  renderInput={(props) => <input {...props} />}
                  //   inputType="number"
                  shouldAutoFocus={true}
                />
              </Form.Item>
            </div>
            <p
              className="resend"
              onClick={handleResend}
              style={{ cursor: "pointer" }}
            >
              {props.clearButtonText || "Clear"}
            </p>
          </div>
          <div className="d-flex justify-content-center">
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={props?.loading}
            >
              {props.verifyButtonText || "Verify"} OTP
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
}

export default OtpModal;
