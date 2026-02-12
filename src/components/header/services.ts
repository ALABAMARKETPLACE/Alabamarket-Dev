import API from "@/config/API";
import { GET, POST } from "@/util/apicall";
import { storeCategory } from "@/redux/slice/categorySlice";
import {
  storeCart,
  loadGuestCart,
  getGuestCartFromStorage,
  clearGuestCartFromStorage,
} from "@/redux/slice/cartSlice";
import { useEffect } from "react";
import { storeSettings } from "@/redux/slice/settingsSlice";
import { jwtDecode } from "jwt-decode";
import { App } from "antd";
import { signOut, useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearReduxData } from "@/lib/clear_redux";
import {
  reduxAccessToken,
  reduxRefreshToken,
  storeToken,
} from "@/redux/slice/authSlice";
const delay = 10000; //before this time the token will refreshed.

export const useGetSettings = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // load site settings
        const settings: any = await GET(API.SETTINGS);
        if (settings.status) {
          dispatch(storeSettings(settings.data));
        }
        // load categories
        let response: any = await GET(API.CATEGORY);
        if (response?.status) {
          dispatch(storeCategory(response?.data));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();

    // Load guest cart from localStorage on initial load
    dispatch(loadGuestCart());
  }, [dispatch]);
};

export const useTokenExpiration = () => {
  const { message } = App.useApp();
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(reduxAccessToken);
  const refresh = useAppSelector(reduxRefreshToken);

  useEffect(() => {
    if (!accessToken) {
      // No token - load guest cart
      dispatch(loadGuestCart());
      return;
    }
    try {
      const decoded: any = jwtDecode(accessToken);
      let currentDate = new Date();
      if (decoded.exp && decoded.exp * 1000 < currentDate.getTime() - delay) {
        if (!refresh) {
          handleTokenExpiration();
        } else {
          createRefreshToken();
        }
      } else {
        fetchUser();
        fetchCartItems();
        const timer = setTimeout(
          () => {
            createRefreshToken();
          },
          decoded.exp * 1000 - Date.now() - delay,
        );

        return () => clearTimeout(timer);
      }
    } catch (err) {
      console.log(err);
    }
  }, [accessToken]);

  const createRefreshToken = async () => {
    const url = API.USER_REFRESH_TOKEN;
    try {
      const response: any = await POST(url, { refreshToken: refresh });
      if (response?.status) {
        message.loading({
          type: "loading",
          content: "Updating User Info..",
          duration: 1,
        });
        dispatch(
          storeToken({
            token: response?.token,
            refreshToken: response?.refreshToken,
          }),
        );
      } else {
        handleTokenExpiration();
      }
    } catch (err) {
      handleTokenExpiration();
    } finally {
    }
  };

  const fetchUser = async () => {
    const url = API.USER_REFRESH;
    try {
      const user: any = await GET(url);
      if (user?.status && user?.data?.status == true) {
        // dispatch(update(user?.data));
      } else {
        return;
      }
    } catch (err) {}
  };

  const fetchCartItems = async () => {
    try {
      // Check if there are guest cart items to sync
      const guestCartItems = getGuestCartFromStorage();

      if (guestCartItems.length > 0) {
        console.log(
          "🛒 Syncing guest cart items to backend:",
          guestCartItems.length,
          "items",
        );

        // Sync each guest cart item to the backend
        for (const item of guestCartItems) {
          try {
            const cartData = {
              productId: item.productId || item._id,
              storeId: item.storeId || item.store_id,
              qty: Math.floor(Number(item.qty || item.quantity) || 1), // Ensure integer
            };
            await POST(API.CART, cartData);
            console.log("✅ Synced item:", item.name || item.productName);
          } catch (syncError) {
            console.error(
              "❌ Failed to sync item:",
              item.name || item.productName,
              syncError,
            );
          }
        }

        // Clear guest cart after syncing
        clearGuestCartFromStorage();
        console.log("🗑️ Guest cart cleared after sync");
      }

      // Fetch all cart items from backend
      const url = API.CART_GET_ALL;
      const cartItems: any = await GET(url);
      if (cartItems.status) {
        dispatch(storeCart(cartItems.data));
      }
    } catch (err) {
      console.error("Error fetching cart items:", err);
    }
  };

  const handleTokenExpiration = () => {
    message.warning({
      type: "loading",
      content: "Your Session Has been Expired Please Login Again..",
      duration: 2,
      onClose: async () => {
        await signOut({ callbackUrl: "/" });
        clearReduxData(dispatch);
        // logoutChannel.postMessage("Logout");
      },
    });
  };
};
