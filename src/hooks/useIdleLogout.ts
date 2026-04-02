"use client";
import { useCallback, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useAppDispatch } from "@/redux/hooks";
import { clearReduxData } from "@/lib/clear_redux";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "touchmove",
  "click",
] as const;

/**
 * Logs out the authenticated user after 30 minutes of inactivity.
 * Resets the countdown on any mouse, keyboard, scroll, or touch event.
 * Has no effect for unauthenticated (guest) users.
 */
export const useIdleLogout = () => {
  const { status } = useSession();
  const dispatch = useAppDispatch();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback(() => {
    clearReduxData(dispatch);
    signOut({ callbackUrl: "/" });
  }, [dispatch]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logout, IDLE_TIMEOUT_MS);
  }, [logout]);

  useEffect(() => {
    if (status !== "authenticated") return;

    resetTimer();

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [status, resetTimer]);
};
