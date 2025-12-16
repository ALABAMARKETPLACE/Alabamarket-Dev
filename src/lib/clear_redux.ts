import { clearToken } from "@/redux/slice/authSlice";
import { clearCart } from "@/redux/slice/cartSlice";

export const clearReduxData = (dispatch: any) => {
  dispatch(clearCart());
  dispatch(clearToken());
};
