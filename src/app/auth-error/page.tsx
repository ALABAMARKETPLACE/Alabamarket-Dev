"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/assets/images/new-logo.jpeg";

const ERROR_MAP: Record<string, { title: string; message: string }> = {
  Configuration: {
    title: "Server Configuration Error",
    message:
      "There is a problem with the server configuration. Please contact support if this persists.",
  },
  AccessDenied: {
    title: "Access Denied",
    message:
      "You do not have permission to sign in. Your account may be pending approval or has been suspended.",
  },
  Verification: {
    title: "Link Expired",
    message:
      "This sign-in link is no longer valid. It may have been used already or has expired.",
  },
  OAuthSignin: {
    title: "Sign-In Failed",
    message: "An error occurred while starting the sign-in process. Please try again.",
  },
  OAuthCallback: {
    title: "Authentication Failed",
    message:
      "Something went wrong while completing sign-in. Please try again or use a different method.",
  },
  OAuthCreateAccount: {
    title: "Account Creation Failed",
    message: "We could not create an account with this provider. Please try again.",
  },
  EmailCreateAccount: {
    title: "Account Creation Failed",
    message: "We could not create an account with this email. Please try again.",
  },
  Callback: {
    title: "Callback Error",
    message: "An error occurred in the authentication callback. Please try again.",
  },
  Default: {
    title: "Authentication Error",
    message: "An unexpected error occurred during sign-in. Please try again.",
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorCode = searchParams.get("error") ?? "Default";
  const info = ERROR_MAP[errorCode] ?? ERROR_MAP["Default"];

  return (
    <div style={styles.page}>
      {/* Card */}
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <Image src={Logo} alt="AlabaMart" height={38} style={{ objectFit: "contain" }} />
        </div>

        {/* Icon */}
        <div style={styles.iconRing}>
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#dc2626"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Error badge */}
        <div style={styles.badge}>Sign-In Error</div>

        {/* Title */}
        <h1 style={styles.title}>{info.title}</h1>

        {/* Message */}
        <p style={styles.message}>{info.message}</p>

        {/* Error code */}
        {errorCode && errorCode !== "Default" && (
          <div style={styles.codeBox}>
            <span style={styles.codeLabel}>Error code</span>
            <code style={styles.codeValue}>{errorCode}</code>
          </div>
        )}

        {/* Actions */}
        <div style={styles.actions}>
          <Link href="/login" style={styles.primaryBtn}>
            Back to Login
          </Link>
          <button style={styles.secondaryBtn} onClick={() => router.push("/")}>
            Go Home
          </button>
        </div>

        {/* Help */}
        <p style={styles.help}>
          Need help?{" "}
          <a href="mailto:customerservice@alabamarketplace.com" style={styles.helpLink}>
            Contact support
          </a>
        </p>
      </div>

      {/* Background decoration */}
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#fff9f6" }} />}>
      <AuthErrorContent />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #fff9f6 0%, #fff4ee 40%, #fff 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    position: "relative",
    overflow: "hidden",
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: "44px 40px 36px",
    maxWidth: 460,
    width: "100%",
    boxShadow: "0 8px 48px rgba(0,0,0,0.10), 0 2px 12px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    position: "relative",
    zIndex: 1,
  },
  logoWrap: {
    marginBottom: 28,
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
    border: "2px solid #fecaca",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    boxShadow: "0 4px 20px rgba(220, 38, 38, 0.15)",
  },
  badge: {
    display: "inline-block",
    background: "#fee2e2",
    color: "#dc2626",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
    padding: "4px 14px",
    borderRadius: 100,
    border: "1px solid #fecaca",
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: "#1a1a2e",
    margin: "0 0 10px",
    lineHeight: 1.3,
  },
  message: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 1.7,
    margin: "0 0 20px",
    maxWidth: 360,
  },
  codeBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "8px 14px",
    marginBottom: 24,
    fontSize: 12,
  },
  codeLabel: {
    color: "#9ca3af",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.4px",
    fontSize: 10,
  },
  codeValue: {
    color: "#374151",
    fontFamily: "monospace",
    fontWeight: 700,
    fontSize: 12,
    background: "transparent",
    border: "none",
    padding: 0,
  },
  actions: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
    width: "100%",
    marginBottom: 22,
  },
  primaryBtn: {
    display: "block",
    width: "100%",
    background: "linear-gradient(135deg, #ff5f15 0%, #ff8c42 100%)",
    color: "#fff",
    padding: "14px 24px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 15,
    textDecoration: "none",
    boxShadow: "0 6px 20px rgba(255, 95, 21, 0.35)",
    transition: "all 0.2s",
    border: "none",
    cursor: "pointer",
  },
  secondaryBtn: {
    display: "block",
    width: "100%",
    background: "transparent",
    color: "#4b5563",
    padding: "13px 24px",
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 15,
    border: "1.5px solid #e5e7eb",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  help: {
    fontSize: 12,
    color: "#9ca3af",
    margin: 0,
  },
  helpLink: {
    color: "#ff5f15",
    textDecoration: "none",
    fontWeight: 600,
  },
  bgCircle1: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,95,21,0.07) 0%, transparent 70%)",
    top: -120,
    right: -120,
    pointerEvents: "none",
  },
  bgCircle2: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,95,21,0.05) 0%, transparent 70%)",
    bottom: -80,
    left: -80,
    pointerEvents: "none",
  },
};
