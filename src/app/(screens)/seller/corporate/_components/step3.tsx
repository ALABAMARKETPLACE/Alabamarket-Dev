import { Form, Input, Button, Select, DatePicker } from "antd";
import dayjs from "dayjs";
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
        <Row>
          <Col md={{ span: 12, offset: 0 }} lg={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
            <div style={{ animation: "fadeInUp 0.6s ease-out" }}>
              <Form
                form={form}
                onFinish={onFinish}
                layout="vertical"
                initialValues={{
                  seller_name: formData?.seller_name,
                  citizenship_country: formData?.citizenship_country,
                  birth_country: formData?.birth_country,
                  dob: formData?.dob ? dayjs(formData?.dob) : null,
                  issue_country: formData?.issue_country,
                  expiry_date: formData?.expiry_date
                    ? dayjs(formData?.expiry_date)
                    : null,
                  id_type: formData?.id_type,
                }}
              >
                {/* Personal Information Section */}
                <div style={{ marginBottom: "32px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px", color: "#1d1d1d", letterSpacing: "0.3px", fontFamily: "global.$SemiBold" }}>
                    👤 Personal Information
                  </h3>
                  <div style={{ background: "#fafbfc", padding: "20px", borderRadius: "12px", border: "1px solid #e8e8e8" }}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24}>
                        <div className="input-form-label">Seller Name</div>
                        <Form.Item
                          name="seller_name"
                          rules={[
                            { required: true, message: "Please Provide Seller name" },
                            {
                              max: 50,
                              message: "Seller Name is too long",
                            },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="Enter your full name" size="large" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                </div>

                {/* Citizenship & Birth Section */}
                <div style={{ marginBottom: "32px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px", color: "#1d1d1d", letterSpacing: "0.3px", fontFamily: "global.$SemiBold" }}>
                    🌍 Citizenship & Birth Information
                  </h3>
                  <div style={{ background: "#fafbfc", padding: "20px", borderRadius: "12px", border: "1px solid #e8e8e8" }}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <div className="input-form-label">Citizenship Country</div>
                        <Form.Item 
                          name="citizenship_country"
                          style={{ marginBottom: 0 }}
                        >
                          <Select
                            placeholder="Select your citizenship country"
                            size="large"
                            showSearch={true}
                          >
                            {Country?.map((item: any) => {
                              return (
                                <Option key={item.name} value={item.name}>
                                  {item.name}
                                </Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div className="input-form-label">Birth Country</div>
                        <Form.Item 
                          name="birth_country"
                          style={{ marginBottom: 0 }}
                        >
                          <Select
                            placeholder="Select your birth country"
                            size="large"
                            showSearch={true}
                          >
                            {Country?.map((item: any) => {
                              return (
                                <Option key={item.name} value={item.name}>
                                  {item.name}
                                </Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <div className="input-form-label">Date of Birth</div>
                        <Form.Item 
                          name="dob"
                          style={{ marginBottom: 0 }}
                        >
                          <DatePicker
                            placeholder="Select your date of birth"
                            style={{ width: "100%" }}
                            size="large"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                </div>

                {/* ID Proof Section */}
                <div style={{ marginBottom: "32px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px", color: "#1d1d1d", letterSpacing: "0.3px", fontFamily: "global.$SemiBold" }}>
                    🆔 ID Proof Details
                  </h3>
                  <div style={{ background: "#fafbfc", padding: "20px", borderRadius: "12px", border: "1px solid #e8e8e8" }}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <div className="input-form-label">ID Proof Type</div>
                        <Form.Item 
                          name="id_type"
                          style={{ marginBottom: 0 }}
                        >
                          <Select placeholder="Select ID type" size="large">
                            <Option key="NIN">NIN</Option>
                            <Option key="Passport">Passport</Option>
                            <Option value="Driving Liscence">Drivers License</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div className="input-form-label">ID Issue Country</div>
                        <Form.Item 
                          name="issue_country"
                          style={{ marginBottom: 0 }}
                        >
                          <Select
                            placeholder="Select issuing country"
                            size="large"
                            showSearch={true}
                          >
                            {Country?.map((item: any) => {
                              return (
                                <Option key={item.name} value={item.name}>
                                  {item.name}
                                </Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <div className="input-form-label">ID Expiry Date</div>
                        <Form.Item 
                          name="expiry_date"
                          style={{ marginBottom: 0 }}
                        >
                          <DatePicker
                            placeholder="Select expiry date"
                            style={{ width: "100%" }}
                            size="large"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                </div>

                {/* Action Buttons */}
                <Row gutter={[12, 12]} style={{ marginTop: "32px" }}>
                  <Col xs={24} sm={12}>
                    <Button onClick={() => goBack()} block size="large" style={{ height: "44px" }}>
                      ← Back
                    </Button>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item style={{ marginBottom: 0 }}>
                      <Button type="primary" htmlType="submit" block size="large" style={{ height: "44px" }}>
                        Continue →
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default Step3;
