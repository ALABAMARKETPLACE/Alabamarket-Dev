"use client";

import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Button, Space, Typography, Divider, Alert } from 'antd';
import { SplitPayment, SplitPaymentPreview } from '@/components/payment/SplitPayment';
import { usePaystack } from '@/hooks/usePaystack';
import splitPaymentHelpers from '@/utils/splitPaymentHelpers';

const { Title, Text, Paragraph } = Typography;

/**
 * Example component showing how to integrate split payments
 * This is for demonstration and testing purposes
 */
export const SplitPaymentExample: React.FC = () => {
  const [form] = Form.useForm();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  
  const { calculateSplit, formatSplitAmount, toKobo } = usePaystack();

  const onFinish = (values: any) => {
    // Validate the data
    const validation = splitPaymentHelpers.validateSplitPaymentData({
      email: values.email,
      amount: values.amount,
      storeId: values.storeId,
    });

    if (!validation.isValid) {
      console.error('Validation errors:', validation.errors);
      return;
    }

    setPaymentData(values);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (reference: string) => {
    console.log('Payment successful:', reference);
    setShowPayment(false);
    form.resetFields();
    setPaymentData(null);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  const handleCancel = () => {
    setShowPayment(false);
  };

  // Calculate split preview
  const amount = Form.useWatch('amount', form) || 0;
  const amountInKobo = toKobo(amount);
  const splitCalculation = amount > 0 ? calculateSplit(amountInKobo) : null;
  const formattedAmounts = splitCalculation ? formatSplitAmount(splitCalculation) : null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <Title level={2}>Split Payment Example</Title>
        <Paragraph>
          This example demonstrates how to integrate Paystack split payments in your application.
          The payment will automatically split 5% to the platform and 95% to the seller.
        </Paragraph>

        <Divider />

        {!showPayment ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Form */}
            <div>
              <Title level={4}>Payment Details</Title>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                  amount: 100,
                  storeId: 1,
                  email: 'customer@test.com',
                  storeName: 'Test Store',
                }}
              >
                <Form.Item
                  label="Customer Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Email is required' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input placeholder="customer@example.com" />
                </Form.Item>

                <Form.Item
                  label="Amount (₦)"
                  name="amount"
                  rules={[
                    { required: true, message: 'Amount is required' },
                    { type: 'number', min: 1, message: 'Minimum amount is ₦1' }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="100"
                    min={1}
                    precision={2}
                    formatter={value => `₦ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    // parser={value => value!.replace(/₦\s?|(,*)/g, '')}
                  />
                </Form.Item>

                <Form.Item
                  label="Store ID"
                  name="storeId"
                  rules={[
                    { required: true, message: 'Store ID is required' },
                    { type: 'number', min: 1, message: 'Valid Store ID required' }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="1"
                    min={1}
                  />
                </Form.Item>

                <Form.Item
                  label="Store Name (Optional)"
                  name="storeName"
                >
                  <Input placeholder="Test Store" />
                </Form.Item>

                <Form.Item
                  label="Order ID (Optional)"
                  name="orderId"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="123"
                    min={1}
                  />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" block size="large">
                    Initialize Split Payment
                  </Button>
                </Form.Item>
              </Form>
            </div>

            {/* Preview */}
            <div>
              <Title level={4}>Payment Preview</Title>
              
              {amount > 0 ? (
                <div>
                  <SplitPaymentPreview amount={amount} />
                  
                  <Alert
                    message="Split Breakdown"
                    description={
                      formattedAmounts ? 
                        `Seller receives ${formattedAmounts.seller} directly to their bank account. Platform fee is ${formattedAmounts.admin}.` :
                        'Enter an amount to see the split breakdown'
                    }
                    type="info"
                    className="mt-4"
                    showIcon
                  />
                </div>
              ) : (
                <Card size="small" style={{ backgroundColor: '#f8f9fa' }}>
                  <Text type="secondary">
                    Enter an amount to see the payment breakdown
                  </Text>
                </Card>
              )}

              <div className="mt-6">
                <Title level={5}>How Split Payments Work:</Title>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Customer pays the full amount</li>
                  <li>95% goes directly to seller's bank account</li>
                  <li>5% goes to platform account</li>
                  <li>Settlement is automatic through Paystack</li>
                  <li>Real-time tracking and reporting</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* Payment Component */
          <div>
            <SplitPayment
              amount={paymentData.amount}
              email={paymentData.email}
              storeId={paymentData.storeId}
              orderId={paymentData.orderId}
              storeName={paymentData.storeName}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handleCancel}
            />
          </div>
        )}

        <Divider />

        {/* Code Example */}
        <div>
          <Title level={4}>Integration Code Example</Title>
          <Alert
            message="Implementation"
            description="Here's how to integrate split payments in your component:"
            type="info"
            className="mb-4"
          />

          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
            <code>{`import { SplitPayment } from '@/components/payment/SplitPayment';
import { usePaystack } from '@/hooks/usePaystack';

function CheckoutPage() {
  const { initializeSplitPayment } = usePaystack();

  return (
    <SplitPayment
      amount={100} // Amount in Naira
      email="customer@example.com"
      storeId={1}
      orderId={123}
      storeName="My Store"
      onSuccess={(reference) => {
        console.log('Payment successful:', reference);
        // Redirect to success page or update UI
      }}
      onError={(error) => {
        console.error('Payment failed:', error);
        // Handle error
      }}
    />
  );
}`}</code>
          </pre>
        </div>
      </Card>
    </div>
  );
};

export default SplitPaymentExample;