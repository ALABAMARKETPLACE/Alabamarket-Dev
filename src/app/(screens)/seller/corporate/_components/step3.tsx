import { Form, Input, Button, Select } from "antd";
import { Col, Row, Container } from "react-bootstrap";
import Country from "../../../../../shared/helpers/countryCode.json";
import React from "react";
function Step3({ moveToNextStep, goBack, formData }: any) {
  const [form] = Form.useForm();
  const { Option } = Select;
  const onFinish = async (values: any) => {
    moveToNextStep({ step3Data: values });
  };
  return (
    <div className="sellerRegister-stepbox">
      <Container>
        <Row className="gy-4">
          <Col xs={12} md={7}>
            <div className="seller-card">
              <h5 className="sellerRegister-subHeading mb-4">
                Seller Identity
              </h5>
              <Form
                form={form}
                onFinish={onFinish}
                layout="vertical"
                initialValues={{
                  seller_name: formData?.seller_name,
                  citizenship_country: formData?.citizenship_country,
                  issue_country: formData?.issue_country,
                  id_type: formData?.id_type,
                }}
              >
                <Form.Item
                  label={
                    <span className="input-form-label">Seller Full Name</span>
                  }
                  name="seller_name"
                  rules={[
                    { required: true, message: "Please Provide Seller name" },
                    { max: 50, message: "Seller Name is too long" },
                  ]}
                >
                  <Input placeholder="Enter Full Name" size="large" />
                </Form.Item>

                <Row>
                  <Col xs={12} md={6}>
                    <Form.Item
                      label={
                        <span className="input-form-label">
                          Citizenship Country
                        </span>
                      }
                      name="citizenship_country"
                    >
                      <Select
                        placeholder="Select Country"
                        size="large"
                        showSearch={true}
                      >
                        {Country?.map((item: any) => (
                          <Option key={item.name} value={item.name}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={6}>
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 802ee6b (Done)
                    <Form.Item
                      label={
                        <span className="input-form-label">ID Proof Type</span>
                      }
<<<<<<< HEAD
=======
                    <Form.Item 
                      label={<span className="input-form-label">ID Proof Type</span>}
>>>>>>> 3dcf364 (Done)
=======
>>>>>>> 802ee6b (Done)
                      name="id_type"
                    >
                      <Select placeholder="Select Type" size="large">
                        <Option key="NIN">NIN</Option>
                        <Option key="Passport">Passport</Option>
                        <Option value="Driving Liscence">
                          Drivers License
                        </Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row>
                  <Col xs={12} md={6}>
                    <Form.Item
                      label={
                        <span className="input-form-label">Issue Country</span>
                      }
                      name="issue_country"
                    >
                      <Select
                        placeholder="Select Country"
                        size="large"
                        showSearch={true}
                      >
                        {Country?.map((item: any) => (
                          <Option key={item.name} value={item.name}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row className="mt-4">
                  <Col md={6} xs={6}>
                    <Button
                      onClick={() => goBack()}
                      block
                      size="large"
                      className="btn-secondary-custom"
                    >
                      Back
                    </Button>
                  </Col>
                  <Col md={6} xs={6}>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        block
                        size="large"
                        className="btn-primary-custom"
                      >
                        Continue
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </Col>
          <Col xs={12} md={5}>
            <div className="seller-info-panel">
              <h4 className="sellerRegister-subHeading">
                Identity Verification
              </h4>
              <div className="sellerRegister-text1">
                <p className="mb-4">
                  To comply with regulations and ensure a safe marketplace, we
                  need to verify the identity of the account holder.
                </p>

                <div className="mb-3">
<<<<<<< HEAD
<<<<<<< HEAD
                  <strong style={{ color: "#334155" }}>Seller Name</strong>
=======
                  <strong style={{color: '#334155'}}>ID Proof Details</strong>
>>>>>>> 3dcf364 (Done)
=======
                  <strong style={{ color: "#334155" }}>Seller Name</strong>
>>>>>>> 802ee6b (Done)
                  <p className="mt-1">
                    Provide the full name as it appears on your official ID
                    document.
                  </p>
                </div>

                <div className="mb-3">
                  <strong style={{ color: "#334155" }}>ID Proof Details</strong>
                  <p className="mt-1">
                    Select the type of ID you will be uploading in the next step
                    (Passport, Driver's License, or NIN). Ensure the Issue
                    Country and Expiry Date match the document.
                  </p>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default Step3;
