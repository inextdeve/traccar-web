import { createSlice } from "@reduxjs/toolkit";

const { reducer, actions } = createSlice({
  name: "bins",
  initialState: {
    bins: [],
    showFilter: false,
    filter: "",
    filterSet: {},
    filteredBins: [],
    loading: false,
  },
  reducers: {
    updateBins(state, action) {
      state.bins = action.payload;
      state.filteredBins = action.payload;
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
    updateFilteredBin(state, action) {
      state.filteredBins = action.payload;
    },
    updateLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export { actions as binsActions };
export { reducer as binsReducer };
