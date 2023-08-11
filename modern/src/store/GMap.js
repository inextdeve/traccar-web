import { createSlice } from "@reduxjs/toolkit";

const { reducer, actions } = createSlice({
  name: "gmap",
  initialState: {
    loading: false,
    distanceNTime: { duration: null, distance: null },
  },
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setDistanceNTime(state, action) {
      state.distanceNTime = action.payload;
    },
  },
});

export { actions as gmapActions };
export { reducer as gmapReducer };
