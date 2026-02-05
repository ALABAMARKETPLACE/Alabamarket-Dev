"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { clearReduxData } from "@/lib/clear_redux";

/**
 * Hook that monitors session expiration and redirects to home page
 * when the session automatically ends
 */
export const useSessionExpiration = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const previousSessionRef = useRef<any>(null);

  useEffect(() => {
    // Check if session was previously active but is now inactive
    if (
      previousSessionRef.current &&
      !session &&
      status === "unauthenticated"
    ) {
      // Session has expired - clear Redux data and redirect to home
      clearReduxData(dispatch);
      router.push("/");
    }

    // Update the previous session reference
    previousSessionRef.current = session;
  }, [session, status, router, dispatch]);

  return { session, status };
};
