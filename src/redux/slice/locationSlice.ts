import { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "@/redux/createSlices";
import { createSelector } from "@reduxjs/toolkit";

interface initialState {
  location: any;
}
const initialState: initialState = {
  location: {},
};
export const LocationSlice = createAppSlice({
  name: "Location",
  initialState,
  reducers: {
    storeLocation: (state, action: PayloadAction<any>) => {
      state.location = action.payload;
    },
    clearLocation: (state) => {
      state.location = {};
    },
  },
  selectors: {
    reduxLocation: (location: initialState) => location?.location,
    reduxLocationBase: (location: initialState) => location?.location,
  },
});

export const { storeLocation, clearLocation } = LocationSlice.actions;

export const { reduxLocation, reduxLocationBase } = LocationSlice.selectors;

// Memoized selector to prevent unnecessary re-renders and hydration issues
export const reduxLatLong = createSelector(
  [reduxLocationBase],
  (location: any): { latitude: number | null; longitude: number | null } => {
    return {
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
    };
  }
);

// Memoized selector to prevent unnecessary re-renders and hydration issues
export const reduxFullAddress = createSelector(
  [reduxLocationBase],
  (location: any): { full_address: string | null } => ({
    full_address: location?.full_address ?? location?.postal_code ?? null,
  })
);
