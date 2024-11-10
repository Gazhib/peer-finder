import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  username: "",
  email: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    getInfo(state, action) {
      state.username = action.payload.username;
      state.email = action.payload.email;
    },
    clearInfo(state) {
      state.username = "";
      state.email = "";
    },
  },
});

export { userSlice };
