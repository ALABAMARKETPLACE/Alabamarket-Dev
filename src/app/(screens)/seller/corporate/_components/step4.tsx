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
          <Col md={4}>
            <Form
              form={form}
              onFinish={onFinish}
              initialValues={{
                id_type: formData?.id_type,
                id_proof: formData?.id_proof,
              }}
            >
              <div className="input-form-label">ID Proof Documents</div>
              <Form.Item name="id_proof">
                <FilePicker onSubmit={handleFileUpload} fileName={file?.file} />
              </Form.Item>
              <div className="input-form-label">
                Business Registration Document
              </div>
              <Form.Item
                name={"trn_upload"}
                rules={[
                  {
                    //  required: true,
                    message: "Business Registration Number is required",
                  },
                ]}
              >
                <FilePicker
                  onSubmit={handleFileUpload2}
                  fileName={file2?.file}
                />
              </Form.Item>

              {/* Subscription Plan Selection */}
              <div
                className="input-form-label"
                style={{ marginTop: 30, fontSize: 16, fontWeight: 600 }}
              >
                Choose Your Subscription Plan
              </div>
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
                              : "1px solid #d9d9d9",
                          cursor: "pointer",
                          position: "relative",
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
                              borderRadius: 4,
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
                                color: "#000",
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
                                marginBottom: 10,
                              }}
                            >
                              Pricing model: per day
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#333",
                                marginBottom: 10,
                              }}
                            >
                              Products: {plan.min_products} –{" "}
                              {plan.max_products}
                            </div>
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

              <Alert
                description={
                  <div>
                    Please ensure that the documents are thoroughly verified
                    before uploading. If there are any issues with the uploaded
                    documents, your account registration will not be processed.
                  </div>
                }
                type="warning"
                closable
              />
              <br />
              {error ? (
                <>
                  <Alert
                    description={
                      <h6 style={{ color: "red" }}>
                        Please select required documents
                      </h6>
                    }
                    type="error"
                  />
                  <br />
                </>
              ) : null}

              <Row>
                <Col md={6} xs={6}>
                  <Button block onClick={() => goBack()} size="large">
                    Back
                  </Button>
                </Col>
                <Col md={6} xs={6}>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" block size="large">
                      Continue
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Col>
          <Col md={8}>
            <div className="sellerRegister-box2">
              <h4 className="sellerRegister-subHeading">4. Upload Documents</h4>
              <div className="sellerRegister-text1">
                <b>ID Proof:</b> Upload the ID Proof which you have selected in
                Step3. you can upload an Image or Pdf of the same. make sure the
                data is clear and readable. if you are uploding image, upload
                good quality images.
                <br /> <br />
                <b>Business Registration Number: </b>Upload Your Business
                Registration Document. if you have. you can also upload an image
                or pdf. <br />
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Step4;
