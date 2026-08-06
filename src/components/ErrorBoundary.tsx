"use client";
import React, { Component, ReactNode } from "react";
import { Button } from "antd";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error.message, info.componentStack);
    this.props.onError?.(error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <DefaultFallback
          error={this.state.error}
          onReset={() => {
            this.reset();
            window.location.reload();
          }}
        />
      );
    }
    return this.props.children;
  }
}

function DefaultFallback({
  error,
  onReset,
}: {
  error: Error | null;
  onReset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        textAlign: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #fff0f0 0%, #ffe0e0 100%)",
          border: "2px solid rgba(239,68,68,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          marginBottom: 8,
        }}
      >
        ⚠️
      </div>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#1a1a2e",
          margin: 0,
        }}
      >
        Something went wrong
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "#6b7280",
          maxWidth: 400,
          lineHeight: 1.7,
          margin: 0,
        }}
      >
        An unexpected error occurred while loading this page. Your data is safe
        — please refresh to try again.
      </p>
      {process.env.NODE_ENV === "development" && error?.message && (
        <pre
          style={{
            fontSize: 11,
            color: "#ef4444",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            padding: "10px 16px",
            maxWidth: 500,
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            textAlign: "left",
            margin: 0,
          }}
        >
          {error.message}
        </pre>
      )}
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <Button
          type="primary"
          size="large"
          onClick={onReset}
          style={{ borderRadius: 10, minWidth: 140 }}
        >
          Refresh Page
        </Button>
        <Button
          size="large"
          onClick={() => (window.location.href = "/")}
          style={{ borderRadius: 10, minWidth: 120 }}
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}

export default ErrorBoundary;
