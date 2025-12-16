"use client";
import React, { useEffect, useState } from "react";
import { Card, Spin, Button, Alert, Typography, Space, Progress } from "antd";
import {
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { usePaystack } from "@/hooks/usePaystack";
import PaymentStatus from "./PaymentStatus";
import { createRetryFunction } from "@/utils/paystackHelpers";

const { Title, Text, Paragraph } = Typography;

interface PaymentVerificationProps {
  reference: string;
  onVerificationComplete?: (success: boolean, data?: any) => void;
  onRetry?: () => void;
  autoVerify?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

const PaymentVerification: React.FC<PaymentVerificationProps> = ({
  reference,
  onVerificationComplete,
  onRetry,
  autoVerify = true,
  maxRetries = 3,
  retryDelay = 2000,
}) => {
  const {
    verifyPayment,
    isLoading,
    error,
    verificationData,
    paymentStatus,
    clearPaymentData,
  } = usePaystack();

  const [verificationState, setVerificationState] = useState<
    "idle" | "verifying" | "success" | "failed"
  >("idle");
  const [retryCount, setRetryCount] = useState(0);
  const [progress, setProgress] = useState(0);

  // Create retry function for verification
  const verifyWithRetry = createRetryFunction(
    () => verifyPayment(reference),
    maxRetries,
    retryDelay
  );

  const performVerification = async () => {
    if (!reference) {
      setVerificationState("failed");
      return;
    }

    try {
      setVerificationState("verifying");
      setProgress(20);

      const result: any = await verifyWithRetry();
      setProgress(80);

      if (result.status) {
        setVerificationState("success");
        setProgress(100);

        if (onVerificationComplete) {
          onVerificationComplete(true, result.data?.data);
        }
      } else {
        throw new Error(result.message || "Verification failed");
      }
    } catch (err: any) {
      console.error("Payment verification failed:", err);
      setVerificationState("failed");
      setProgress(0);

      if (onVerificationComplete) {
        onVerificationComplete(false, err);
      }
    }
  };

  const handleManualRetry = () => {
    setRetryCount((prev) => prev + 1);
    clearPaymentData();
    performVerification();

    if (onRetry) {
      onRetry();
    }
  };

  useEffect(() => {
    if (autoVerify && reference && verificationState === "idle") {
      // Small delay to show the verification process
      const timer = setTimeout(() => {
        performVerification();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [reference, autoVerify, verificationState]);

  // Update progress based on loading state
  useEffect(() => {
    if (isLoading && verificationState === "verifying") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 70) {
            return prev + 10;
          }
          return prev;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isLoading, verificationState]);

  const renderVerificationContent = () => {
    switch (verificationState) {
      case "verifying":
        return (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <Spin
              indicator={
                <LoadingOutlined style={{ fontSize: 48, color: "#00C9A7" }} />
              }
              style={{ marginBottom: "24px" }}
            />

            <Title level={4} style={{ marginBottom: "16px" }}>
              Verifying Payment
            </Title>

            <Paragraph
              style={{
                fontSize: "16px",
                color: "#6c757d",
                marginBottom: "24px",
              }}
            >
              Please wait while we verify your payment...
            </Paragraph>

            <Progress
              percent={progress}
              showInfo={false}
              strokeColor="#00C9A7"
              style={{ maxWidth: "300px", margin: "0 auto" }}
            />

            <div style={{ marginTop: "16px" }}>
              <Text type="secondary">
                Reference: <Text code>{reference}</Text>
              </Text>
            </div>

            {retryCount > 0 && (
              <div style={{ marginTop: "16px" }}>
                <Text type="secondary">
                  Retry attempt: {retryCount + 1} of {maxRetries + 1}
                </Text>
              </div>
            )}
          </div>
        );

      case "success":
        return verificationData ? (
          <PaymentStatus
            paymentData={verificationData}
            onCopyReference={() => {
              // Copy reference notification could be handled here
            }}
          />
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <CheckCircleOutlined
              style={{ fontSize: 48, color: "#52c41a", marginBottom: "16px" }}
            />
            <Title level={4} style={{ color: "#52c41a" }}>
              Payment Verified Successfully!
            </Title>
          </div>
        );

      case "failed":
        return (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <CloseCircleOutlined
              style={{ fontSize: 48, color: "#ff4d4f", marginBottom: "16px" }}
            />

            <Title level={4} style={{ color: "#ff4d4f", marginBottom: "16px" }}>
              Verification Failed
            </Title>

            {error && (
              <Alert
                message="Error Details"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: "24px", textAlign: "left" }}
              />
            )}

            <Paragraph
              style={{
                fontSize: "16px",
                color: "#6c757d",
                marginBottom: "24px",
              }}
            >
              We couldn't verify your payment. This could be due to network
              issues or the payment is still processing.
            </Paragraph>

            <div style={{ marginBottom: "24px" }}>
              <Text type="secondary">
                Reference: <Text code>{reference}</Text>
              </Text>
            </div>

            <Space direction="vertical" size="middle">
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleManualRetry}
                size="large"
                style={{
                  background: "#00C9A7",
                  borderColor: "#00C9A7",
                }}
              >
                Try Again
              </Button>

              {retryCount >= maxRetries && (
                <div>
                  <ExclamationCircleOutlined style={{ color: "#faad14" }} />
                  <Text type="secondary" style={{ marginLeft: "8px" }}>
                    If the issue persists, please contact support with your
                    reference number.
                  </Text>
                </div>
              )}
            </Space>
          </div>
        );

      default:
        return (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <Title level={4}>Ready to Verify Payment</Title>
            <Paragraph
              style={{
                fontSize: "16px",
                color: "#6c757d",
                marginBottom: "24px",
              }}
            >
              Click the button below to verify your payment.
            </Paragraph>

            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={performVerification}
              size="large"
              style={{
                background: "#00C9A7",
                borderColor: "#00C9A7",
              }}
            >
              Verify Payment
            </Button>
          </div>
        );
    }
  };

  return (
    <Card
      style={{
        maxWidth: 600,
        margin: "0 auto",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {renderVerificationContent()}
    </Card>
  );
};

export default PaymentVerification;
