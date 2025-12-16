
"use client"
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { useParams } from "next/navigation";
import OrderSubstitutionForm from "../_components/orderSubstitutionForm";
import SelectedProductsSubstitution from "../_components/selectedProductsSubstitution";
import { Row, Col } from "react-bootstrap";
import SimiliarProductSubstitution from "../_components/similiarProductSubstitution";
import { Form, Input, notification } from 'antd';
import { useState, useEffect } from "react";
import API from "@/config/API";
import { POST } from "@/util/apicall";
import { useRouter } from "next/navigation";

interface formType {
  availableQuantity: number;
  orderId: number;
  orderItemId: number;
  remark: string;
  substitute: number[]
}

export default function OrderSubstitution() {
  const router = useRouter()
  const { substitute } = useParams();
  const [selectSubstitute, setSelectSubstitute] = useState<any>([]);
  // const [formValues, setFormValues] = useState<any>({});
  const [form] = Form.useForm();
  const [notificationApi, contextHolder] = notification.useNotification();

  const functionCall = (data: any) => {
    setSelectSubstitute(data);
  };

  const handleSubmit = async () => {

    try {
      const values = await form.validateFields();
      let formValues:formType = await {
        ...values, orderId: Number(values.orderId),
        orderItemId: Number(values.orderItemId),
        availableQuantity: Number(values.availableQuantity),
        substitute: selectSubstitute.map((item: any) => item._id)
      }

      if (selectSubstitute.length == 0) {
        notificationApi.error({
          message: 'Products Not selected',
          description: 'Select atleast one product for substitution.'
        });
      }
      else {
        const response: any = await POST(API.ORDER_SUBSTITUTION, formValues)
        notificationApi.success({
          message: 'Substitution Successful',
          description: 'Order substitution was Submited'
        });
        router.push(`/auth/orders/${substitute?.[1]}`)
      }

    } catch (errorInfo: any) {
      console.log(errorInfo);
      notificationApi.error({
        message: 'Validation Error',
        description: 'Please check the form fields and try again'
      });
    }

  }

  return (
    <div>
      {contextHolder}

      <PageHeader
        title={"Order Substitution"}
        bredcume={"Dashboard / Orders / Substitution"}
      />
      <div>
        <h4>Order Substitution : #{substitute?.[1]}</h4>
        <Row>
          <Col md={8}>
            <Form
              form={form}
              name="orderSubstitutionForm"
              labelAlign="left"
              wrapperCol={{ flex: 1 }}
              layout="vertical"
            >
              <OrderSubstitutionForm
                orderId={substitute?.[1]}
                form={form}
              />
            </Form>
            <SimiliarProductSubstitution
              select={selectSubstitute}
              changeData={functionCall}
            />

          </Col>
          <Col md={4}>
            <SelectedProductsSubstitution
              select={selectSubstitute}
              changeData={functionCall}
              handleSubmit={handleSubmit}
            />

          </Col>
        </Row>
      </div>
    </div>
  );
}
