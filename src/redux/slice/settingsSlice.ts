import { createAppSlice } from "@/redux/createSlices";
import { PayloadAction } from "@reduxjs/toolkit";
interface initialState {
  settings: any;
}
const initialState: initialState = {
  settings: {},
};
export const SettingsSlice = createAppSlice({
  name: "Settings",
  initialState,
  reducers: {
    storeSettings: (state, action: PayloadAction<any>) => {
      state.settings = action.payload;
    },
    clearSettings: (state) => {
      state.settings = {};
    },
  },
  selectors: {
    reduxSettings: (settings: initialState) => settings?.settings ?? {},
    reduxSearchRadius: (settings: initialState): number =>
      settings?.settings?.radius ?? 10,
  },
});

export const { storeSettings, clearSettings } = SettingsSlice.actions;

export const { reduxSettings, reduxSearchRadius } = SettingsSlice.selectors;
