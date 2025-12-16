import React, { useState, useEffect } from "react";
import { Col, Row, Container } from "react-bootstrap";
import { Form, Button, Alert, Radio, Card } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import FilePicker from "../../_components/filePicker";
import { GET } from "../../../../../util/apicall";

function Step4({ moveToNextStep, goBack, formData }: any) {
  const [form] = Form.useForm();
  const [file, setFile] = useState<any>(formData?.step4Data?.id_proof || null);
  const [file2, setFile2] = useState<any>(
    formData?.step4Data?.trn_upload || null
  );
  const [error, seterror] = useState<any>(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(
    formData?.step4Data?.subscription_plan || "standard"
  );
  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState<boolean>(false);

  // Update states when formData changes (e.g., when user goes back to this step)
  useEffect(() => {
    if (formData?.step4Data?.subscription_plan) {
      setSelectedPlan(formData.step4Data.subscription_plan);
    }
    if (formData?.step4Data?.id_proof) {
      setFile(formData.step4Data.id_proof);
    }
    if (formData?.step4Data?.trn_upload) {
      setFile2(formData.step4Data.trn_upload);
    }
  }, [formData?.step4Data]);

  // Fetch active subscription plans (public endpoint)
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        const resp: any = await GET("subscription-plans/public/active");
        const serverPlans: any[] = Array.isArray(resp?.data) ? resp.data : [];
        if (serverPlans.length > 0) {
          // Map server DTO to current UI model
          const mapped = serverPlans.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price_per_day ?? 0),
            currency: "₦",
            duration: "per day",
            min_products: p.min_products,
            max_products: p.max_products,
            boosts: 0,
            description: `For ${p.min_products} - ${p.max_products} products`,
            features: [],
            popular: false,
            color: "#808080",
          }));
          setPlans(mapped);
        }
      } catch (e) {
        setPlans([]);
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleFileUpload = (file: any) => {
    setFile(file);
  };
  const handleFileUpload2 = (file: any) => {
    setFile2(file);
  };

  const onFinish = async (values: any) => {
    try {
      if (file.file && file2.file) {
        const selectedPlanData = plans.find((p) => p.id === selectedPlan);
        const obj: any = {
          id_proof: file,
          trn_upload: file2,
          subscription_plan: selectedPlan,
          // Add plan id explicitly for backend if selectedPlan is numeric
          ...(selectedPlanData?.id && typeof selectedPlanData.id === "number"
            ? { subscription_plan_id: selectedPlanData.id }
            : {}),
          subscription_data: selectedPlanData,
        };
        moveToNextStep({ step4Data: obj });
      } else {
        seterror(true);
        setTimeout(() => {
          seterror(false);
        }, 1400);
      }
    } catch (err) {
      console.log("err", err);
      seterror(true);
      setTimeout(() => {
        seterror(false);
      }, 1400);
    }
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
                  id_type: formData?.id_type,
                  id_proof: formData?.id_proof,
                }}
              >
                {/* Document Upload Section */}
                <div style={{ marginBottom: "32px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px", color: "#1d1d1d", letterSpacing: "0.3px", fontFamily: "global.$SemiBold" }}>
                    📄 Upload Documents
                  </h3>
                  <div style={{ background: "#fafbfc", padding: "20px", borderRadius: "12px", border: "1px solid #e8e8e8" }}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24}>
                        <div className="input-form-label">ID Proof Document</div>
                        <div style={{ marginBottom: "4px", fontSize: "12px", color: "#666" }}>
                          Upload a clear image or PDF of your ID proof (NIN, Passport, or Driver's License)
                        </div>
                        <Form.Item 
                          name="id_proof"
                          style={{ marginBottom: 0 }}
                        >
                          <FilePicker onSubmit={handleFileUpload} fileName={file?.file} />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <div className="input-form-label">Business Registration Document</div>
                        <div style={{ marginBottom: "4px", fontSize: "12px", color: "#666" }}>
                          Upload your Business Registration or Trade License document
                        </div>
                        <Form.Item
                          name={"trn_upload"}
                          rules={[
                            {
                              message: "Business Registration Document is required",
                            },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <FilePicker
                            onSubmit={handleFileUpload2}
                            fileName={file2?.file}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <div style={{ padding: "12px", backgroundColor: "#fff7e6", border: "1px solid #ffa940", borderRadius: "8px", marginBottom: "12px" }}>
                          <span style={{ color: "#ffa940", fontSize: "13px", fontWeight: 500, display: "flex", gap: "8px", alignItems: "center" }}>
                            ⚠️ Ensure documents are clear, readable, and in good quality. Blurry or invalid documents will cause rejection.
                          </span>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>

                {/* Subscription Plan Section */}
                <div style={{ marginBottom: "32px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px", color: "#1d1d1d", letterSpacing: "0.3px", fontFamily: "global.$SemiBold" }}>
                    💳 Choose Your Subscription Plan
                  </h3>
                  <div style={{ background: "#fafbfc", padding: "20px", borderRadius: "12px", border: "1px solid #e8e8e8" }}>
                    <Radio.Group
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      style={{ width: "100%" }}
                    >
                      <Row style={{ marginBottom: 20 }}>
                        {plans.map((plan) => (
                          <Col md={6} key={plan.id} style={{ marginBottom: 15 }}>
                            <Card
                              style={{
                                height: "100%",
                                border:
                                  selectedPlan === plan.id
                                    ? `2px solid ${plan.color}`
                                    : "1px solid #e8e8e8",
                                cursor: "pointer",
                                position: "relative",
                                borderRadius: "10px",
                                transition: "all 0.3s ease"
                              }}
                              onClick={() => setSelectedPlan(plan.id)}
                              hoverable
                            >
                              {plan.popular && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: -10,
                                    right: 20,
                                    background: plan.color,
                                    color: "#fff",
                                    padding: "4px 12px",
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    zIndex: 1,
                                  }}
                                >
                                  POPULAR
                                </div>
                              )}
                              <Radio value={plan.id} style={{ width: "100%" }}>
                                <div>
                                  <div
                                    style={{
                                      fontSize: 16,
                                      fontWeight: 600,
                                      color: plan.color,
                                      marginBottom: 8,
                                    }}
                                  >
                                    {plan.name}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 22,
                                      fontWeight: 700,
                                      color: "#1d1d1d",
                                      marginBottom: 5,
                                    }}
                                  >
                                    {plan.currency}
                                    {plan.price.toLocaleString()}
                                    <span
                                      style={{
                                        fontSize: 13,
                                        fontWeight: 400,
                                        color: "#666",
                                      }}
                                    >
                                      {" "}
                                      / {plan.duration}
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 12,
                                      color: "#666",
                                      marginBottom: 8,
                                    }}
                                  >
                                    {plan.description}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 600,
                                      color: plan.color,
                                      marginBottom: 8,
                                    }}
                                  >
                                    Pricing: {plan.duration}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 600,
                                      color: "#333",
                                      marginBottom: 10,
                                    }}
                                  >
                                    Products: {plan.min_products} – {plan.max_products}
                                  </div>
                                  {plan.features?.length > 0 && (
                                    <ul
                                      style={{
                                        paddingLeft: 20,
                                        fontSize: 11,
                                        margin: 0,
                                      }}
                                    >
                                      {plan.features
                                        .slice(0, 3)
                                        .map((feature: string, idx: number) => (
                                          <li
                                            key={idx}
                                            style={{ color: "#333", marginBottom: 2 }}
                                          >
                                            {feature}
                                          </li>
                                        ))}
                                    </ul>
                                  )}
                                </div>
                              </Radio>
                              {selectedPlan === plan.id && (
                                <CheckCircleOutlined
                                  style={{
                                    position: "absolute",
                                    top: 15,
                                    right: 15,
                                    fontSize: 20,
                                    color: plan.color,
                                  }}
                                />
                              )}
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </Radio.Group>
                  </div>
                </div>

                {/* Alerts */}
                {error && (
                  <div style={{ marginBottom: "20px" }}>
                    <Alert
                      description={
                        <h6 style={{ color: "#ff4d4f", margin: 0 }}>
                          ❌ Please upload both required documents before continuing
                        </h6>
                      }
                      type="error"
                    />
                  </div>
                )}

                <div style={{ marginBottom: "20px" }}>
                  <Alert
                    description={
                      <div style={{ fontSize: "13px" }}>
                        ⚠️ <b>Document Verification Important:</b> Please ensure that the documents are thoroughly verified before uploading. If there are any issues with the uploaded documents, your account registration will not be processed.
                      </div>
                    }
                    type="warning"
                    closable
                  />
                </div>

                {/* Action Buttons */}
                <Row gutter={[12, 12]} style={{ marginTop: "32px" }}>
                  <Col xs={24} sm={12}>
                    <Button block onClick={() => goBack()} size="large" style={{ height: "44px" }}>
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

export default Step4;
