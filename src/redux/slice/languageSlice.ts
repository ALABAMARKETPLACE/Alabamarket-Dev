import { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "@/redux/createSlices";
interface initialState {
  direction: string;
}
const initialState: initialState = {
  direction: "LTR",
};
export const LanguageSlice = createAppSlice({
  name: "Language",
  initialState,
  reducers: {
    setDirection: (state, action: PayloadAction<string>) => {
      state.direction = action.payload;
    },
  },
  selectors: {
    reduxLanguageDirection: (language: initialState) => language?.direction,
  },
});

export const { setDirection } = LanguageSlice.actions;

export const { reduxLanguageDirection } = LanguageSlice.selectors;
