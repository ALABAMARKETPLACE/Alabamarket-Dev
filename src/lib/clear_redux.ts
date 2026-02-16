import { clearToken } from "@/redux/slice/authSlice";
import { clearCart } from "@/redux/slice/cartSlice";

export const LOCATION_PROMPTED_KEY = "alaba_location_prompted";

export const clearReduxData = (dispatch: any) => {
  dispatch(clearCart());
  dispatch(clearToken());
  // Reset location prompt flag so the modal shows once on next login
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCATION_PROMPTED_KEY);
  }
};
