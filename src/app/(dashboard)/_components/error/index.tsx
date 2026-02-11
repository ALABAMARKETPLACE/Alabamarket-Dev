import { Button, Result } from "antd";
import { useRouter } from "next/navigation";
import React from "react";
import { FiAlertTriangle, FiRefreshCw, FiHome } from "react-icons/fi";

interface ErrorProps {
  description?: string;
  title?: string;
  status?: "404" | "500" | "403" | "error";
  onRetry?: () => void;
  showHomeButton?: boolean;
}

function Error({
  description,
  title,
  status = "500",
  onRetry,
  showHomeButton = true,
}: ErrorProps) {
  const router = useRouter();

  return (
    <div className="dashboard-error">
      <div className="dashboard-error__container">
        <div className="dashboard-error__icon">
          <FiAlertTriangle />
        </div>
        <h2 className="dashboard-error__title">{title ?? `Error ${status}`}</h2>
        <p className="dashboard-error__description">
          {description ?? "Sorry, something went wrong. Please try again."}
        </p>
        <div className="dashboard-error__actions">
          {onRetry && (
            <Button
              type="primary"
              icon={<FiRefreshCw />}
              onClick={onRetry}
              className="dashboard-error__btn"
            >
              Try Again
            </Button>
          )}
          {showHomeButton && (
            <Button
              type={onRetry ? "default" : "primary"}
              icon={<FiHome />}
              onClick={() => router.push("/auth/dashboard")}
              className="dashboard-error__btn"
            >
              Go to Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Error;
