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
        <Row className="gy-4">
          <Col xs={12} md={7}>
            <div className="seller-card">
              <h5 className="sellerRegister-subHeading mb-4">Upload Documents</h5>
              <Form
                form={form}
                onFinish={onFinish}
                initialValues={{
                  id_type: formData?.id_type,
                  id_proof: formData?.id_proof,
                }}
              >
                <div className="mb-4">
                  <div className="input-form-label mb-2">ID Proof Document</div>
                  <Form.Item name="id_proof">
                    <FilePicker onSubmit={handleFileUpload} fileName={file?.file} />
                  </Form.Item>
                </div>

                <div className="mb-4">
                  <div className="input-form-label mb-2">Business Registration Document</div>
                  <Form.Item
                    name={"trn_upload"}
                    rules={[
                      {
                        message: "Business Registration Number is required",
                      },
                    ]}
                  >
                    <FilePicker
                      onSubmit={handleFileUpload2}
                      fileName={file2?.file}
                    />
                  </Form.Item>
                </div>

                <hr className="my-4" style={{borderColor: '#e2e8f0'}} />

                {/* Subscription Plan Selection - DISABLED */}
                {/* <h5 className="sellerRegister-subHeading mb-3" style={{ fontSize: 18 }}>
                  Choose Subscription Plan
                </h5>
                
                <Radio.Group
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  style={{ width: "100%" }}
                >
                  <Row className="g-3">
                    {plans.map((plan) => (
                      <Col md={12} key={plan.id}>
                        <div
                          className={`p-3 ${selectedPlan === plan.id ? 'bg-orange-50' : 'bg-white'}`}
                          style={{
                            border: selectedPlan === plan.id ? `2px solid ${plan.color}` : '1px solid #e2e8f0',
                            borderRadius: 12,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onClick={() => setSelectedPlan(plan.id)}
                        >
                          <div className="d-flex align-items-center">
                            <Radio value={plan.id} className="me-3" />
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span style={{ fontWeight: 600, fontSize: 16, color: plan.color }}>{plan.name}</span>
                                <span style={{ fontWeight: 700, fontSize: 18 }}>
                                  {plan.currency}{plan.price.toLocaleString()}
                                  <small style={{ fontWeight: 400, fontSize: 12, color: '#64748b' }}>/{plan.duration}</small>
                                </span>
                              </div>
                              <div style={{ fontSize: 13, color: '#64748b' }}>{plan.description}</div>
                              <div className="mt-2 d-flex flex-wrap gap-2">
                                {plan.features.slice(0, 3).map((f: string, i: number) => (
                                  <span key={i} style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, color: '#475569' }}>
                                    {f}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {plan.popular && (
                              <div className="ms-2" style={{ background: plan.color, color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                                POPULAR
                              </div>
                            )}
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Radio.Group> */}

                <div className="mt-4">
                  <Alert
                    message="Verification Required"
                    description="Please ensure all documents are clear and readable. Blurred or cropped documents will lead to rejection."
                    type="info"
                    showIcon
                    className="mb-3"
                  />
                  
                  {error && (
                    <Alert
                      message="Missing Documents"
                      description="Please upload both ID Proof and Business Registration documents to continue."
                      type="error"
                      showIcon
                      className="mb-3"
                    />
                  )}
                </div>

                <Row className="mt-4">
                  <Col md={6} xs={6}>
                    <Button block onClick={() => goBack()} size="large" className="btn-secondary-custom">
                      Back
                    </Button>
                  </Col>
                  <Col md={6} xs={6}>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" block size="large" className="btn-primary-custom">
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
              <h4 className="sellerRegister-subHeading">Document Guidelines</h4>
              <div className="sellerRegister-text1">
                <div className="mb-4">
                  <strong style={{color: '#334155', display: 'block', marginBottom: 8}}>ID Proof Requirements</strong>
                  <ul style={{paddingLeft: 20}}>
                    <li>Must be a government-issued ID (Passport, NIN, Driver's License)</li>
                    <li>Must be valid (not expired)</li>
                    <li>Photo and text must be clearly visible</li>
                    <li>Upload full document (front and back if applicable)</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <strong style={{color: '#334155', display: 'block', marginBottom: 8}}>Business Registration</strong>
                  <ul style={{paddingLeft: 20}}>
                    <li>Upload your official Certificate of Incorporation or Business Registration certificate</li>
                    <li>Must clearly show the Business Name and Registration Number</li>
                    <li>Document must be active and valid</li>
                  </ul>
                </div>

                <div className="p-3" style={{background: '#fff', borderRadius: 8, border: '1px dashed #cbd5e1'}}>
                  <strong style={{color: '#334155'}}>Accepted Formats</strong>
                  <p className="mt-1 mb-0">JPG, PNG, PDF (Max 5MB)</p>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Step4;
