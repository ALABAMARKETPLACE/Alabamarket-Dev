import { createSlice } from "@reduxjs/toolkit";
export const UserSlice = createSlice({
  name: "User",
  initialState: {
    user: {},
    auth: false,
  },
  reducers: {
    login: (state: any, action) => {
      state.user = action.payload;
      state.auth = true;
    },
    logout: (state, action) => {
      state.user = {};
      state.auth = false;
    },
    update: (state: any, action) => {
      state.user.data = action.payload;
    },
  },
});

export const { login, logout, update } = UserSlice.actions;

