"use client";
import { useSessionExpiration } from "@/hooks/useSessionExpiration";
import { useSyncGuestCartOnLogin } from "@/hooks/useSyncGuestCartOnLogin";
import { ReactNode } from "react";

export default function LayoutContent({ children }: { children: ReactNode }) {
  // Monitor session expiration and redirect to home when session ends
  useSessionExpiration();
  
  // Sync guest cart to backend when user logs in
  useSyncGuestCartOnLogin();

  return <>{children}</>;
}
