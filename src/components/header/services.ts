import API from "@/config/API";
import { GET, POST } from "@/util/apicall";
import { storeCategory } from "@/redux/slice/categorySlice";
import { storeCart } from "@/redux/slice/cartSlice";
import { useEffect } from "react";
import { storeSettings } from "@/redux/slice/settingsSlice";
import { jwtDecode } from "jwt-decode";
import { message } from "antd";
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
  }, [dispatch]);
};

export const useTokenExpiration = () => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(reduxAccessToken);
  const refresh = useAppSelector(reduxRefreshToken);

  useEffect(() => {
    if (!accessToken) {
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
        const timer = setTimeout(() => {
          createRefreshToken();
        }, decoded.exp * 1000 - Date.now() - delay);

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
          })
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
      const url = API.CART_GET_ALL;
      const cartItems: any = await GET(url);
      if (cartItems.status) {
        dispatch(storeCart(cartItems.data));
      }
    } catch (err) {}
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
