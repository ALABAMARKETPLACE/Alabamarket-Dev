import { useState } from "react";
import { Col, Row, Container } from "react-bootstrap";
import { Tag, Button, notification } from "antd";
import { FaMobileAlt } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Success from "../../../../../assets/images/success.gif";
import React from "react";
import Image from "next/image";

function Step5({
  loading,
  success,
  formData,
  register,
  goBack,
  phoneNumber,
}: any) {
  const navigation = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [notificationApi, contextHolder] = notification.useNotification();

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      await register(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sellerRegister-stepbox">
      {contextHolder}
      <Container>
        <Row className="justify-content-center">
          <Col md={8}>
            <div className="seller-card text-center">
              {success ? (
                <div className="py-5">
                  <div style={{ maxWidth: 200, margin: "0 auto 20px" }}>
                    <Image
                      src={Success}
                      style={{ width: "100%", height: "auto" }}
                      alt="Success"
                    />
                  </div>
                  <h4 className="sellerRegister-Heading mb-3">
                    Registration Successful!
                  </h4>
                  <p className="sellerRegister-text1 mb-4">
                    Your application has been submitted successfully. Our team
                    will review your details and approve your account shortly.
                  </p>

                  <Row className="justify-content-center g-3">
                    <Col md={5} sm={6}>
                      <Button
                        block
                        size="large"
                        onClick={() => navigation.back()}
                        className="btn-secondary-custom"
                      >
                        Go Back
                      </Button>
                    </Col>
                    <Col md={5} sm={6}>
                      <Button
                        type="primary"
                        block
                        size="large"
                        onClick={() => navigation.push("/login")}
                        className="btn-primary-custom"
                      >
                        Proceed to Login
                      </Button>
                    </Col>
                  </Row>
                </div>
              ) : (
                <>
                  <h4 className="sellerRegister-Heading mb-2">
                    Review & Submit
                  </h4>
                  <p className="sellerRegister-text1 mb-5">
                    Please review your information before final submission.
                  </p>

                  <div
                    className="text-start p-4 mb-4"
                    style={{ background: "#f8fafc", borderRadius: 12 }}
                  >
                    <h6 className="sellerRegister-text2 mb-3">
                      Contact Information
                    </h6>
                    <div className="sellerReviewRow mb-3">
                      <div className="sellerReviewValue">
                        <FaMobileAlt size={18} className="text-muted me-2" />
                        <span className="sellerReviewValueText">
                          {phoneNumber}
                        </span>
                      </div>
                      <Tag color="orange" className="sellerReviewTag">
                        Verification Pending
                      </Tag>
                    </div>
                    <div className="sellerReviewRow">
                      <div className="sellerReviewValue">
                        <FiMail size={18} className="text-muted me-2" />
                        <span className="sellerReviewValueText">
                          {formData.step1Data.email}
                        </span>
                      </div>
                      <Tag color="orange" className="sellerReviewTag">
                        Verification Pending
                      </Tag>
                    </div>
                  </div>

                  <div
                    className="text-start p-4 mb-4"
                    style={{ background: "#f8fafc", borderRadius: 12 }}
                  >
                    <h6 className="sellerRegister-text2 mb-3">
                      Uploaded Documents
                    </h6>
                    {formData?.step4Data?.id_proof && (
                      <div className="d-flex align-items-center justify-content-between mb-2 p-2 bg-white rounded border">
                        <span
                          className="text-truncate me-2"
                          style={{ maxWidth: "70%" }}
                        >
                          ID Proof:{" "}
                          {formData?.step4Data?.id_proof?.file?.name ||
                            formData?.step4Data?.id_proof?.file?.path}
                        </span>
                        <Tag color="blue">Ready to Upload</Tag>
                      </div>
                    )}
                    {formData?.step4Data?.trn_upload && (
                      <div className="d-flex align-items-center justify-content-between p-2 bg-white rounded border">
                        <span
                          className="text-truncate me-2"
                          style={{ maxWidth: "70%" }}
                        >
                          Business Reg:{" "}
                          {formData?.step4Data?.trn_upload?.file?.name ||
                            formData?.step4Data?.trn_upload?.file?.path}
                        </span>
                        <Tag color="blue">Ready to Upload</Tag>
                      </div>
                    )}
                  </div>

                  <Row className="g-3 align-items-stretch sellerReviewActions">
                    <Col xs={12} sm={6} md={6}>
                      <Button
                        onClick={() => goBack()}
                        block
                        size="large"
                        className="btn-secondary-custom"
                        disabled={isLoading || loading}
                      >
                        Back
                      </Button>
                    </Col>
                    <Col xs={12} sm={6} md={6}>
                      <Button
                        type="primary"
                        loading={isLoading || loading}
                        onClick={handleRegister}
                        block
                        size="large"
                        className="btn-primary-custom"
                      >
                        Submit Application
                      </Button>
                    </Col>
                  </Row>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default Step5;
