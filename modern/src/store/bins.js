import { createSlice } from "@reduxjs/toolkit";

const { reducer, actions } = createSlice({
  name: "bins",
  initialState: {
    bins: [],
    showFilter: false,
    filter: "",
    filterSet: {},
  },
  reducers: {
    updateBins(state, action) {
      state.bins = action.payload;
    },
    toggleShowFilter(state) {
      state.showFilter = !state.showFilter;
    },
    updateFilter(state, action) {
      state.filter = action.payload;
    },
    updateFilterSet(state, action) {
      state.filterSet = action.payload;
    },
  },
});

export { actions as binsActions };
export { reducer as binsReducer };
