"use client";
import React from 'react';
import { Card, Typography, Tag, Descriptions, Button, Space } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  CopyOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { PaystackVerificationData } from '@/types/paystack.types';
import { 
  formatAmountDisplay, 
  formatPaymentDate, 
  getChannelDisplayName,
  getPaymentStatusColor,
  getPaymentStatusText 
} from '@/utils/paystackHelpers';

const { Title, Text, Paragraph } = Typography;

interface PaymentStatusProps {
  paymentData: PaystackVerificationData;
  onDownloadReceipt?: () => void;
  onCopyReference?: () => void;
  showActions?: boolean;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  paymentData,
  onDownloadReceipt,
  onCopyReference,
  showActions = true,
}) => {
  const getStatusIcon = () => {
    switch (paymentData.status) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} />;
      case 'abandoned':
        return <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '24px' }} />;
      case 'pending':
        return <ClockCircleOutlined style={{ color: '#1890ff', fontSize: '24px' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#8c8c8c', fontSize: '24px' }} />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentData.status) {
      case 'success':
        return {
          title: 'Payment Successful!',
          description: 'Your payment has been processed successfully.',
          color: '#52c41a'
        };
      case 'failed':
        return {
          title: 'Payment Failed',
          description: paymentData.gateway_response || 'Your payment could not be processed.',
          color: '#ff4d4f'
        };
      case 'abandoned':
        return {
          title: 'Payment Cancelled',
          description: 'You cancelled the payment process.',
          color: '#faad14'
        };
      case 'pending':
        return {
          title: 'Payment Pending',
          description: 'Your payment is being processed.',
          color: '#1890ff'
        };
      default:
        return {
          title: 'Payment Status Unknown',
          description: 'Unable to determine payment status.',
          color: '#8c8c8c'
        };
    }
  };

  const statusInfo = getStatusMessage();

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(paymentData.reference);
      if (onCopyReference) {
        onCopyReference();
      }
    } catch (error) {
      console.error('Failed to copy reference:', error);
    }
  };

  return (
    <Card
      style={{ 
        maxWidth: 600,
        margin: '0 auto',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}
      bodyStyle={{ padding: '32px' }}
    >
      {/* Status Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ marginBottom: '16px' }}>
          {getStatusIcon()}
        </div>
        
        <Title level={3} style={{ color: statusInfo.color, marginBottom: '8px' }}>
          {statusInfo.title}
        </Title>
        
        <Text style={{ fontSize: '16px', color: '#6c757d' }}>
          {statusInfo.description}
        </Text>
      </div>

      {/* Payment Details */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '24px', 
        borderRadius: '8px', 
        marginBottom: '24px',
        border: '1px solid #e9ecef'
      }}>
        <Title level={5} style={{ marginBottom: '16px', color: '#495057' }}>
          Payment Details
        </Title>

        <Descriptions column={1} size="middle" colon={false}>
          <Descriptions.Item 
            label={<Text strong>Amount</Text>}
            labelStyle={{ minWidth: '120px' }}
          >
            <Text strong style={{ fontSize: '18px', color: '#00C9A7' }}>
              {formatAmountDisplay(paymentData.amount)}
            </Text>
          </Descriptions.Item>

          <Descriptions.Item 
            label={<Text strong>Status</Text>}
            labelStyle={{ minWidth: '120px' }}
          >
            <Tag 
              color={getPaymentStatusColor(paymentData.status as any)}
              style={{ fontSize: '12px', padding: '4px 8px' }}
            >
              {getPaymentStatusText(paymentData.status as any)}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item 
            label={<Text strong>Reference</Text>}
            labelStyle={{ minWidth: '120px' }}
          >
            <Space>
              <Text code style={{ fontSize: '14px' }}>
                {paymentData.reference}
              </Text>
              {showActions && (
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={handleCopyReference}
                  title="Copy Reference"
                />
              )}
            </Space>
          </Descriptions.Item>

          <Descriptions.Item 
            label={<Text strong>Payment Method</Text>}
            labelStyle={{ minWidth: '120px' }}
          >
            <Text>{getChannelDisplayName(paymentData.channel as any)}</Text>
          </Descriptions.Item>

          {paymentData.paid_at && (
            <Descriptions.Item 
              label={<Text strong>Date & Time</Text>}
              labelStyle={{ minWidth: '120px' }}
            >
              <Text>{formatPaymentDate(paymentData.paid_at)}</Text>
            </Descriptions.Item>
          )}

          <Descriptions.Item 
            label={<Text strong>Currency</Text>}
            labelStyle={{ minWidth: '120px' }}
          >
            <Text>{paymentData.currency}</Text>
          </Descriptions.Item>

          {paymentData.fees > 0 && (
            <Descriptions.Item 
              label={<Text strong>Transaction Fee</Text>}
              labelStyle={{ minWidth: '120px' }}
            >
              <Text>{formatAmountDisplay(paymentData.fees)}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      </div>

      {/* Customer Information */}
      {paymentData.customer && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '24px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          border: '1px solid #e9ecef'
        }}>
          <Title level={5} style={{ marginBottom: '16px', color: '#495057' }}>
            Customer Information
          </Title>

          <Descriptions column={1} size="middle" colon={false}>
            <Descriptions.Item 
              label={<Text strong>Name</Text>}
              labelStyle={{ minWidth: '120px' }}
            >
              <Text>
                {paymentData.customer.first_name} {paymentData.customer.last_name}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item 
              label={<Text strong>Email</Text>}
              labelStyle={{ minWidth: '120px' }}
            >
              <Text>{paymentData.customer.email}</Text>
            </Descriptions.Item>

            {paymentData.customer.phone && (
              <Descriptions.Item 
                label={<Text strong>Phone</Text>}
                labelStyle={{ minWidth: '120px' }}
              >
                <Text>{paymentData.customer.phone}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>
      )}

      {/* Card Information (for card payments) */}
      {paymentData.authorization && paymentData.channel === 'card' && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '24px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          border: '1px solid #e9ecef'
        }}>
          <Title level={5} style={{ marginBottom: '16px', color: '#495057' }}>
            Card Information
          </Title>

          <Descriptions column={1} size="middle" colon={false}>
            <Descriptions.Item 
              label={<Text strong>Card Type</Text>}
              labelStyle={{ minWidth: '120px' }}
            >
              <Text style={{ textTransform: 'capitalize' }}>
                {paymentData.authorization.brand} {paymentData.authorization.card_type}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item 
              label={<Text strong>Last 4 Digits</Text>}
              labelStyle={{ minWidth: '120px' }}
            >
              <Text>****{paymentData.authorization.last4}</Text>
            </Descriptions.Item>

            <Descriptions.Item 
              label={<Text strong>Bank</Text>}
              labelStyle={{ minWidth: '120px' }}
            >
              <Text>{paymentData.authorization.bank}</Text>
            </Descriptions.Item>

            <Descriptions.Item 
              label={<Text strong>Country</Text>}
              labelStyle={{ minWidth: '120px' }}
            >
              <Text>{paymentData.authorization.country_code}</Text>
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}

      {/* Actions */}
      {showActions && paymentData.status === 'success' && (
        <div style={{ textAlign: 'center' }}>
          <Space size="middle">
            {onDownloadReceipt && (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={onDownloadReceipt}
                style={{ 
                  background: '#00C9A7',
                  borderColor: '#00C9A7'
                }}
              >
                Download Receipt
              </Button>
            )}
          </Space>
        </div>
      )}

      {/* Transaction ID Footer */}
      <div style={{ 
        marginTop: '24px', 
        paddingTop: '16px', 
        borderTop: '1px solid #e9ecef',
        textAlign: 'center'
      }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Transaction ID: {paymentData.id} | Domain: {paymentData.domain}
        </Text>
      </div>
    </Card>
  );
};

export default PaymentStatus;