"use client";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { useParams, useRouter } from "next/navigation";
import OrderSubstitutionForm from "../_components/orderSubstitutionForm";
import SelectedProductsSubstitution from "../_components/selectedProductsSubstitution";
import { Row, Col } from "react-bootstrap";
import SimiliarProductSubstitution from "../_components/similiarProductSubstitution";
import { Form, notification, Steps, Card, Button } from "antd";
import { useState } from "react";
import { ArrowLeftOutlined, SwapOutlined, SearchOutlined, CheckCircleOutlined } from "@ant-design/icons";
import API from "@/config/API";
import { POST } from "@/util/apicall";
import { useSession } from "next-auth/react";

interface formType {
  availableQuantity: number;
  substitueQuantity: number;
  orderId: number;
  orderItemId: number;
  remark: string;
  substitute: number[];
  [key: string]: unknown;
}

interface SubstituteItem {
  _id: number;
  image: string;
  name: string;
  price?: string;
  [key: string]: unknown;
}

export default function OrderSubstitution() {
  const router = useRouter();
  const { substitute } = useParams();
  const { data: sessionData } = useSession();
  const session = sessionData as { role?: string; type?: string; user?: { role?: string; type?: string } } | null;
  const userRole = session?.role || session?.user?.role;
  const userType = session?.type || session?.user?.type;
  const isAdmin = userRole === "admin" || userType === "admin";

  const [selectSubstitute, setSelectSubstitute] = useState<SubstituteItem[]>([]);
  const [form] = Form.useForm();
  const [notificationApi, contextHolder] = notification.useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [realOrderId, setRealOrderId] = useState<number | null>(null);

  const orderId = substitute?.[1] || "";

  const functionCall = (data: SubstituteItem[]) => {
    setSelectSubstitute(data);
  };

  const handleSubmit = async () => {
    if (submitting) return;

    // Step 1 — validate form fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let values: any;
    try {
      values = await form.validateFields();
    } catch {
      notificationApi.error({
        message: "Incomplete Form",
        description: "Please fill in all required fields before submitting.",
      });
      return;
    }

    // Step 2 — order must be loaded
    if (!realOrderId) {
      notificationApi.error({
        message: "Order Not Loaded",
        description: "Please wait for the order details to finish loading.",
      });
      return;
    }

    // Step 3 — must have at least one replacement product
    if (selectSubstitute.length === 0) {
      notificationApi.error({
        message: "No Replacement Selected",
        description: "Please add at least one replacement product before submitting.",
      });
      return;
    }

    const formValues: formType = {
      ...values,
      orderId: realOrderId!,
      orderItemId: Number(values.orderItemId),
      substitueQuantity: Number(values.substituteQuantity),
      availableQuantity: Number(values.availableQuantity),
      substitute: selectSubstitute.map((item: SubstituteItem) => item._id).filter((id) => id > 0),
    };

    setSubmitting(true);
    try {
      await POST(API.ORDER_SUBSTITUTION, formValues);
      notificationApi.success({
        message: "Substitution Submitted",
        description: "The order substitution request was submitted successfully.",
      });
      router.push(`/auth/orders/${orderId}`);
    } catch (apiErr: unknown) {
      notificationApi.error({
        message: "Submission Failed",
        description: "Could not submit the substitution request. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const currentStep = selectSubstitute.length > 0 ? 1 : 0;

  return (
    <div>
      {contextHolder}

      <PageHeader
        title={"Order Substitution"}
        bredcume={"Dashboard / Orders / Substitution"}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push(`/auth/orders/${orderId}`)}
        >
          Back to Order
        </Button>
      </PageHeader>

      <div className="sub-page-wrapper">
        {/* Step progress */}
        <Card className="sub-steps-card" variant="borderless">
          <Steps
            size="small"
            current={currentStep}
            items={[
              {
                title: "Select Item",
                description: "Choose which item to replace",
                icon: <SwapOutlined />,
              },
              {
                title: "Pick Replacements",
                description: "Browse & add similar products",
                icon: <SearchOutlined />,
              },
              {
                title: "Submit",
                description: "Review and confirm",
                icon: <CheckCircleOutlined />,
              },
            ]}
          />
        </Card>

        <Row className="gy-4">
          {/* Left: form + product browser */}
          <Col md={8}>
            {/* Step 1 — substitution details form */}
            <Card
              className="sub-section-card"
              title={
                <span className="sub-section-title">
                  <span className="sub-step-num">1</span>
                  Item to Substitute
                </span>
              }
              variant="borderless"
            >
              <Form
                form={form}
                name="orderSubstitutionForm"
                labelAlign="left"
                wrapperCol={{ flex: 1 }}
                layout="vertical"
              >
                <OrderSubstitutionForm
                  orderId={orderId}
                  form={form}
                  isAdmin={isAdmin}
                  onOrderLoaded={(id) => setRealOrderId(id)}
                />
              </Form>
            </Card>

            {/* Step 2 — browse similar products */}
            <Card
              className="sub-section-card mt-3"
              title={
                <span className="sub-section-title">
                  <span className="sub-step-num">2</span>
                  Browse Replacement Products
                </span>
              }
              variant="borderless"
            >
              <SimiliarProductSubstitution
                select={selectSubstitute}
                changeData={functionCall}
                isAdmin={isAdmin}
              />
            </Card>
          </Col>

          {/* Right: selected products + submit */}
          <Col md={4}>
            <div style={{ position: "sticky", top: 24 }}>
              <SelectedProductsSubstitution
                select={selectSubstitute}
                changeData={functionCall}
                handleSubmit={handleSubmit}
                submitting={submitting}
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
