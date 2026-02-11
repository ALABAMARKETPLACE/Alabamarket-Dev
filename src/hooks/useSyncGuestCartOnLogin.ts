"use client";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { POST, GET } from "@/util/apicall";
import API from "@/config/API";
import {
  storeCart,
  getGuestCartFromStorage,
  clearGuestCartFromStorage,
} from "@/redux/slice/cartSlice";
import { clearGuestAddress } from "@/app/(screens)/checkout/_components/guestAddressForm";
import { notification } from "antd";

/**
 * Hook to sync guest cart items to the backend when a user logs in.
 * Should be used in a high-level component that's always mounted (e.g., LayoutContent).
 */
export function useSyncGuestCartOnLogin() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const syncAttemptedRef = useRef(false);
  const prevStatusRef = useRef(status);

  useEffect(() => {
    const syncGuestCart = async () => {
      // Only sync once per login
      if (syncAttemptedRef.current) return;

      // Check if user just logged in (status changed from unauthenticated to authenticated)
      const justLoggedIn =
        prevStatusRef.current === "unauthenticated" &&
        status === "authenticated" &&
        session?.user;

      if (!justLoggedIn) {
        prevStatusRef.current = status;
        return;
      }

      // Get guest cart from localStorage
      const guestCartItems = getGuestCartFromStorage();

      if (!guestCartItems || guestCartItems.length === 0) {
        prevStatusRef.current = status;
        return;
      }

      syncAttemptedRef.current = true;
      console.log("Syncing guest cart to backend...", guestCartItems);

      try {
        // Add each guest cart item to the backend cart
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const syncPromises = guestCartItems.map(async (item: any) => {
          const cartItem = {
            productId: item.productId,
            quantity: item.quantity,
            variantId: item.variantId || null,
          };

          try {
            await POST(API.CART, cartItem);
            return { success: true, item };
          } catch (error) {
            console.error("Failed to sync item:", item, error);
            return { success: false, item, error };
          }
        });

        const results = await Promise.all(syncPromises);
        const successCount = results.filter((r) => r.success).length;
        const failedCount = results.filter((r) => !r.success).length;

        // Clear guest cart from localStorage after sync attempt
        clearGuestCartFromStorage();
        clearGuestAddress();

        // Fetch the updated cart from backend
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cartResponse: any = await GET(API.CART_GET_ALL);
        if (cartResponse.status) {
          dispatch(storeCart(cartResponse.data));
        }

        // Show notification
        if (successCount > 0) {
          notification.success({
            message: "Cart synced",
            description: `${successCount} item(s) from your guest cart have been added to your account.`,
          });
        }

        if (failedCount > 0) {
          notification.warning({
            message: "Some items couldn't be synced",
            description: `${failedCount} item(s) couldn't be added. They may be out of stock.`,
          });
        }
      } catch (error) {
        console.error("Failed to sync guest cart:", error);
        // Clear guest cart anyway to prevent repeated attempts
        clearGuestCartFromStorage();
      }

      prevStatusRef.current = status;
    };

    syncGuestCart();
  }, [status, session, dispatch]);

  // Reset sync flag when user logs out
  useEffect(() => {
    if (status === "unauthenticated") {
      syncAttemptedRef.current = false;
    }
  }, [status]);
}

export default useSyncGuestCartOnLogin;
