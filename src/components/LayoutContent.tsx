"use client";
import { useSessionExpiration } from "@/hooks/useSessionExpiration";
import { useSyncGuestCartOnLogin } from "@/hooks/useSyncGuestCartOnLogin";
import { useIdleLogout } from "@/hooks/useIdleLogout";
import { ReactNode } from "react";

export default function LayoutContent({ children }: { children: ReactNode }) {
  // Monitor session expiration and redirect to home when session ends
  useSessionExpiration();

  // Sync guest cart to backend when user logs in
  useSyncGuestCartOnLogin();

  // Auto-logout after 5 minutes of inactivity (users and admins)
  useIdleLogout();

  return <>{children}</>;
}
