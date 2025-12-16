import { createSlice } from "@reduxjs/toolkit";
export const CheckoutSlice = createSlice({
  name: "Checkout",
  initialState: {
    Checkout: [],
    address: {},
    order: {},
  },

  reducers: {
    storeCheckout: (state, action) => {
      state.Checkout = action.payload;
    },
    storeAddress: (state, action) => {
      state.address = action.payload;
    },
    storeFinal: (state, action) => {
      state.order = action.payload;
    },
    clearCheckout: (state) => {
      state.Checkout = [];
      state.address = {};
      state.order = {};
    },
  },
});

export const { storeCheckout, storeAddress, storeFinal, clearCheckout } =
  CheckoutSlice.actions;
export default CheckoutSlice.reducer;
