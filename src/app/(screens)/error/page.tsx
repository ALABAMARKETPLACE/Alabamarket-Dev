"use client";
import { Button, Result } from "antd";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const msg = searchParams.get("msg");
  const status = searchParams.get("status");

  // Determine the result status and title based on the status parameter
  const getResultConfig = () => {
    switch (status) {
      case "pending":
        return {
          status: "info" as const,
          title: "Application Pending",
          subTitle: msg || "Your application is currently under review. Please wait for admin approval.",
        };
      case "rejected":
        return {
          status: "error" as const,
          title: "Application Rejected",
          subTitle: msg || "Your application has been rejected. Please contact support for more information.",
        };
      case "suspended":
        return {
          status: "warning" as const,
          title: "Account Suspended",
          subTitle: msg || "Your account has been suspended. Please contact support.",
        };
      case "server_error":
        return {
          status: "500" as const,
          title: "Server Error",
          subTitle: msg || "Server is not available. Please try again later.",
        };
      case "error":
        return {
          status: "error" as const,
          title: "Error",
          subTitle: msg || "Something went wrong. Please try again.",
        };
      default:
        // If no status but has message, show info
        if (msg) {
          return {
            status: "info" as const,
            title: "Notice",
            subTitle: msg,
          };
        }
        // Default error
        return {
          status: "500" as const,
          title: "500",
          subTitle: "Sorry, something went wrong.",
        };
    }
  };

  const config = getResultConfig();

  return (
    <Result
      status={config.status}
      title={config.title}
      subTitle={config.subTitle}
      extra={
        <Link href="/">
          <Button type="primary">Back Home</Button>
        </Link>
      }
    />
  );
}

function Error() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}

export default Error;
