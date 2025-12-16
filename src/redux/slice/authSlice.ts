import { PayloadAction, ReducerCreators } from "@reduxjs/toolkit";
import { createAppSlice } from "@/redux/createSlices";
interface initialState {
  token: string | null;
  refreshToken: string | null;
}
const initialState: initialState = {
  token: null,
  refreshToken: null,
};
export const AuthSlice = createAppSlice({
  name: "Auth",
  initialState,
  reducers: {
    storeToken: (state: initialState, action: PayloadAction<initialState>) => {
      state.token = action.payload?.token;
      state.refreshToken = action?.payload.refreshToken;
    },
    clearToken: (state: initialState) => {
      state.token = null;
      state.refreshToken = null;
    },
  },
  selectors: {
    reduxRefreshToken: (state: initialState) => state?.refreshToken,
    reduxAccessToken: (state: initialState) => state?.token,
  },
});

export const { storeToken, clearToken } = AuthSlice.actions;
export const { reduxAccessToken, reduxRefreshToken } = AuthSlice.selectors;
