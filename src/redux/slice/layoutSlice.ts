import { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "@/redux/createSlices";

interface LayoutState {
  isSideMenuOpen: boolean;
}

const initialState: LayoutState = {
  isSideMenuOpen: false,
};

export const LayoutSlice = createAppSlice({
  name: "Layout",
  initialState,
  reducers: {
    toggleSideMenu: (state: LayoutState) => {
      state.isSideMenuOpen = !state.isSideMenuOpen;
    },
    setSideMenuOpen: (state: LayoutState, action: PayloadAction<boolean>) => {
      state.isSideMenuOpen = action.payload;
    },
  },
  selectors: {
    reduxIsSideMenuOpen: (state: LayoutState) => state.isSideMenuOpen,
  },
});

export const { toggleSideMenu, setSideMenuOpen } = LayoutSlice.actions;
export const { reduxIsSideMenuOpen } = LayoutSlice.selectors;
