"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Hook that monitors session expiration and redirects to home page
 * when the session automatically ends
 */
export const useSessionExpiration = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const previousSessionRef = useRef<any>(null);

  useEffect(() => {
    // Check if session was previously active but is now inactive
    if (previousSessionRef.current && !session && status === "unauthenticated") {
      // Session has expired - redirect to home
      router.push("/");
    }

    // Update the previous session reference
    previousSessionRef.current = session;
  }, [session, status, router]);

  return { session, status };
};
