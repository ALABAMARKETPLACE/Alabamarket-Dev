"use client";
import React, { useEffect, useState } from 'react';
import { Modal, Button, Spin, Alert, Descriptions, Typography } from 'antd';
import { CreditCardOutlined, LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { usePaystack } from '@/hooks/usePaystack';
import { PaystackInitializeRequest } from '@/types/paystack.types';
import { formatAmountDisplay } from '@/utils/paystackHelpers';

const { Title, Text } = Typography;

interface PaystackModalProps {
  visible: boolean;
  onClose: () => void;
  paymentData: PaystackInitializeRequest;
  onSuccess?: (reference: string) => void;
  onError?: (error: string) => void;
  customerName?: string;
}

const PaystackModal: React.FC<PaystackModalProps> = ({
  visible,
  onClose,
  paymentData,
  onSuccess,
  onError,
  customerName,
}) => {
  const {
    initializePayment,
    isLoading,
    error,
    paymentStatus,
    clearPaymentData,
  } = usePaystack();

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (paymentStatus === 'success' && onSuccess) {
      onSuccess(paymentData.reference || '');
    } else if (paymentStatus === 'failed' && onError) {
      onError(error || 'Payment failed');
    }
  }, [paymentStatus, onSuccess, onError, error, paymentData.reference]);

  const handlePayNow = async () => {
    try {
      setIsProcessing(true);
      const result = await initializePayment(paymentData);
      
      if (result.status && result.data?.data?.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = result.data.data.authorization_url;
      }
    } catch (err: any) {
      console.error('Payment initialization failed:', err);
      if (onError) {
        onError(err.message || 'Payment initialization failed');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    clearPaymentData();
    onClose();
  };

  const isButtonLoading = isLoading || isProcessing;

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center' }}>
          <CreditCardOutlined style={{ fontSize: '24px', color: '#00C9A7', marginRight: '8px' }} />
          <Title level={4} style={{ margin: 0, display: 'inline' }}>
            Complete Payment
          </Title>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={500}
      centered
      maskClosable={!isButtonLoading}
      closable={!isButtonLoading}
    >
      <div style={{ padding: '20px 0' }}>
        {/* Payment Summary */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #e9ecef'
        }}>
          <Title level={5} style={{ marginBottom: '16px', color: '#495057' }}>
            Payment Summary
          </Title>
          
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Amount">
              <Text strong style={{ fontSize: '18px', color: '#00C9A7' }}>
                {formatAmountDisplay(paymentData.amount)}
              </Text>
            </Descriptions.Item>
            
            <Descriptions.Item label="Email">
              <Text>{paymentData.email}</Text>
            </Descriptions.Item>
            
            {customerName && (
              <Descriptions.Item label="Customer">
                <Text>{customerName}</Text>
              </Descriptions.Item>
            )}
            
            <Descriptions.Item label="Currency">
              <Text>Nigerian Naira (₦)</Text>
            </Descriptions.Item>
            
            {paymentData.reference && (
              <Descriptions.Item label="Reference">
                <Text code>{paymentData.reference}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>

        {/* Payment Methods Info */}
        <div style={{ marginBottom: '20px' }}>
          <Title level={5} style={{ marginBottom: '12px' }}>
            Accepted Payment Methods
          </Title>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ 
              background: '#fff', 
              border: '1px solid #d9d9d9', 
              borderRadius: '4px', 
              padding: '8px 12px',
              fontSize: '12px'
            }}>
              💳 Debit/Credit Cards
            </div>
            <div style={{ 
              background: '#fff', 
              border: '1px solid #d9d9d9', 
              borderRadius: '4px', 
              padding: '8px 12px',
              fontSize: '12px'
            }}>
              🏦 Bank Transfer
            </div>
            <div style={{ 
              background: '#fff', 
              border: '1px solid #d9d9d9', 
              borderRadius: '4px', 
              padding: '8px 12px',
              fontSize: '12px'
            }}>
              📱 USSD
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert
            message="Payment Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '20px' }}
          />
        )}

        {/* Success Display */}
        {paymentStatus === 'success' && (
          <Alert
            message="Payment Successful"
            description="Your payment has been processed successfully."
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            style={{ marginBottom: '20px' }}
          />
        )}

        {/* Failed Display */}
        {paymentStatus === 'failed' && (
          <Alert
            message="Payment Failed"
            description="Your payment could not be processed. Please try again."
            type="error"
            showIcon
            icon={<CloseCircleOutlined />}
            style={{ marginBottom: '20px' }}
          />
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button
            size="large"
            onClick={handleClose}
            disabled={isButtonLoading}
            style={{ minWidth: '120px' }}
          >
            Cancel
          </Button>
          
          <Button
            type="primary"
            size="large"
            onClick={handlePayNow}
            loading={isButtonLoading}
            disabled={paymentStatus === 'success' || paymentStatus === 'failed'}
            style={{ 
              minWidth: '120px',
              background: '#00C9A7',
              borderColor: '#00C9A7'
            }}
            icon={isButtonLoading ? <LoadingOutlined /> : <CreditCardOutlined />}
          >
            {isButtonLoading ? 'Processing...' : `Pay ${formatAmountDisplay(paymentData.amount)}`}
          </Button>
        </div>

        {/* Security Notice */}
        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center',
          fontSize: '12px',
          color: '#6c757d'
        }}>
          <div style={{ marginBottom: '8px' }}>
            🔒 Your payment is secured by Paystack
          </div>
          <div>
            All transactions are encrypted and processed securely
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PaystackModal;