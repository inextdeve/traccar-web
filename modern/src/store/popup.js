import { createSlice } from "@reduxjs/toolkit";

const { reducer, actions } = createSlice({
  name: "popup",
  initialState: {
    show: false,
    data: {
      id: null,
      binType: null,
    },
  },
  reducers: {
    show(state) {
      state.show = true;
    },
    hide(state) {
      state.show = false;
    },
    updateData(state, action) {
      state.data = { ...state.data, ...action.payload };
    },
  },
});

export { actions as popupActions };
export { reducer as popupReducer };
