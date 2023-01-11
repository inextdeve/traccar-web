import { createSlice } from "@reduxjs/toolkit";

const { reducer, actions } = createSlice({
  name: "geofences",
  initialState: {
    items: {},
    bins: [],
  },
  reducers: {
    refresh(state, action) {
      state.items = {};
      action.payload.forEach((item) => (state.items[item.id] = item));
    },
    update(state, action) {
      action.payload.forEach((item) => (state.items[item.id] = item));
    },
    updateBins(state, action) {
      state.bins = action.payload;
    },
  },
});

export { actions as geofencesActions };
export { reducer as geofencesReducer };
