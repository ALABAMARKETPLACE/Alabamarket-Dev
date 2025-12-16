import { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "@/redux/createSlices";
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
    reduxLatLong: (
      location: initialState
    ): { latitude: number; longitude: number } => {
      return {
        latitude: location?.location?.latitude ?? null,
        longitude: location?.location?.longitude ?? null,
      };
    },
    reduxFullAddress: (location: initialState): { full_address: string } => ({
      full_address:
        location?.location?.full_address ?? location?.location?.postal_code,
    }),
  },
});

export const { storeLocation, clearLocation } = LocationSlice.actions;

export const { reduxLocation, reduxFullAddress, reduxLatLong } =
  LocationSlice.selectors;
