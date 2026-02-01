"use client";
import { useSessionExpiration } from "@/hooks/useSessionExpiration";
import { ReactNode } from "react";

export default function LayoutContent({ children }: { children: ReactNode }) {
  // Monitor session expiration and redirect to home when session ends
  useSessionExpiration();

  return <>{children}</>;
}
