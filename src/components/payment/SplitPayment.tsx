"use client";

import React, { useState, useCallback } from 'react';
import { Button, Card, Divider, Typography, notification, Spin, Alert } from 'antd';
import { ShoppingCartOutlined, BankOutlined, UserOutlined } from '@ant-design/icons';
import { usePaystack } from '@/hooks/usePaystack';
import { SplitPaymentRequest } from '@/types/paystack.types';

const { Title, Text, Paragraph } = Typography;

interface SplitPaymentProps {
  amount: number; // Amount in Naira
  email: string;
  storeId: number;
  orderId?: number;
  storeName?: string;
  onSuccess?: (reference: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  className?: string;
  disabled?: boolean;
}

export const SplitPayment: React.FC<SplitPaymentProps> = ({
  amount,
  email,
  storeId,
  orderId,
  storeName,
  onSuccess,
  onError,
  onCancel,
  className,
  disabled = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [notificationApi, contextHolder] = notification.useNotification();
  
  const {
    initializeSplitPayment,
    verifyPayment,
    calculateSplit,
    formatSplitAmount,
    toKobo,
    isLoading
  } = usePaystack();

  // Calculate split breakdown
  const amountInKobo = toKobo(amount);
  const splitCalculation = calculateSplit(amountInKobo);
  const formattedAmounts = formatSplitAmount(splitCalculation);

  const handlePayment = useCallback(async () => {
    if (disabled || isProcessing) return;

    setIsProcessing(true);

    try {
      const splitPaymentData: SplitPaymentRequest = {
        email,
        amount: amountInKobo,
        store_id: storeId,
        order_id: orderId,
        split_payment: true,
        callback_url: `${window.location.origin}/payment/callback`,
        metadata: {
          store_name: storeName,
          customer_email: email,
          order_id: orderId?.toString(),
        }
      };

      // Initialize split payment
      const result = await initializeSplitPayment(splitPaymentData);

      if (result.status && result.data?.data?.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = result.data.data.authorization_url;
      } else {
        throw new Error(result.message || 'Payment initialization failed');
      }
    } catch (error: any) {
      console.error('Split payment error:', error);
      const errorMessage = error.message || 'Failed to initialize payment';
      
      notificationApi.error({
        message: 'Payment Error',
        description: errorMessage,
        duration: 5,
      });

      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [
    amount,
    email,
    storeId,
    orderId,
    storeName,
    disabled,
    isProcessing,
    initializeSplitPayment,
    onError,
    notificationApi,
    amountInKobo
  ]);

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  return (
    <>
      {contextHolder}
      <Card className={className} loading={isLoading}>
        <div className="split-payment-container">
          {/* Header */}
          <div className="text-center mb-6">
            <Title level={3} className="mb-2">
              <ShoppingCartOutlined className="mr-2" />
              Complete Payment
            </Title>
            <Text type="secondary">
              {storeName ? `Payment to ${storeName}` : 'Split Payment'}
            </Text>
          </div>

          {/* Payment Breakdown */}
          <Card size="small" className="mb-4" style={{ backgroundColor: '#f8f9fa' }}>
            <Title level={5} className="mb-3">
              Payment Breakdown
            </Title>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Text>Total Amount:</Text>
                <Text strong className="text-lg">
                  {formattedAmounts.total}
                </Text>
              </div>
              
              <Divider className="my-2" />
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <BankOutlined className="mr-2 text-blue-500" />
                  <Text>To Seller ({splitCalculation.seller_percentage}%):</Text>
                </div>
                <Text className="text-green-600 font-medium">
                  {formattedAmounts.seller}
                </Text>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <UserOutlined className="mr-2 text-gray-500" />
                  <Text>Platform Fee ({splitCalculation.admin_percentage}%):</Text>
                </div>
                <Text className="text-gray-600">
                  {formattedAmounts.admin}
                </Text>
              </div>
            </div>
          </Card>

          {/* Information Alert */}
          <Alert
            message="Secure Split Payment"
            description="Your payment will be automatically split. The seller receives their portion directly to their bank account."
            type="info"
            showIcon
            className="mb-4"
          />

          {/* Payment Actions */}
          <div className="flex gap-3 justify-center">
            <Button
              type="primary"
              size="large"
              loading={isProcessing}
              disabled={disabled}
              onClick={handlePayment}
              className="min-w-[150px]"
              icon={<BankOutlined />}
            >
              {isProcessing ? 'Processing...' : `Pay ${formattedAmounts.total}`}
            </Button>
            
            {onCancel && (
              <Button
                size="large"
                disabled={isProcessing}
                onClick={handleCancel}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Security Info */}
          <div className="text-center mt-4">
            <Text type="secondary" className="text-sm">
              🔒 Secured by Paystack • Your payment is encrypted and secure
            </Text>
          </div>
        </div>
      </Card>
    </>
  );
};

// Helper component for split payment preview (without payment action)
export const SplitPaymentPreview: React.FC<{
  amount: number;
  adminPercentage?: number;
  className?: string;
}> = ({ amount, adminPercentage = 5, className }) => {
  const { calculateSplit, formatSplitAmount, toKobo } = usePaystack();
  
  const amountInKobo = toKobo(amount);
  const splitCalculation = calculateSplit(amountInKobo, adminPercentage);
  const formattedAmounts = formatSplitAmount(splitCalculation);

  return (
    <Card size="small" className={className} style={{ backgroundColor: '#f8f9fa' }}>
      <Title level={5} className="mb-3">
        Payment Breakdown
      </Title>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Text>Total Amount:</Text>
          <Text strong className="text-lg">
            {formattedAmounts.total}
          </Text>
        </div>
        
        <Divider className="my-2" />
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <BankOutlined className="mr-2 text-blue-500" />
            <Text>To Seller ({splitCalculation.seller_percentage}%):</Text>
          </div>
          <Text className="text-green-600 font-medium">
            {formattedAmounts.seller}
          </Text>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <UserOutlined className="mr-2 text-gray-500" />
            <Text>Platform Fee ({splitCalculation.admin_percentage}%):</Text>
          </div>
          <Text className="text-gray-600">
            {formattedAmounts.admin}
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default SplitPayment;