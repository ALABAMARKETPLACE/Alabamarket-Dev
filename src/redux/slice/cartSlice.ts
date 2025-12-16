import { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "@/redux/createSlices";
interface initialState {
  items: any[];
}
const initialState: initialState = {
  items: [],
};
export const CartSlice = createAppSlice({
  name: "Cart",
  initialState,
  reducers: {
    storeCart: (state: initialState, action: PayloadAction<any[]>) => {
      state.items = action.payload;
    },
    clearCart: (state: initialState) => {
      state.items = [];
    },
  },
  selectors: {
    reduxCartItems: (cart: initialState) => cart?.items,
    reduxCartCount: (cart: initialState) => cart.items?.length ?? 0,
  },
});

export const { storeCart, clearCart } = CartSlice.actions;

export const { reduxCartItems, reduxCartCount } = CartSlice.selectors;
