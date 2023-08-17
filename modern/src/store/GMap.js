import { createSlice } from "@reduxjs/toolkit";

const { reducer, actions } = createSlice({
  name: "gmap",
  initialState: {
    items: [],
    loading: false,
    binsVisibility: false,
    distanceNTime: { duration: null, distance: null },
  },
  reducers: {
    setItems(state, action) {
      state.items = action.payload;
    },
    setBinVisiblity(state) {
      state.binsVisibility = !state.binsVisibility;
    },
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
