import { createSlice } from "@reduxjs/toolkit";
import moment from "moment";

const { reducer, actions } = createSlice({
  name: "analytics",
  initialState: {
    loading: false,
    items: [],
    period: "today",
    from: moment()
      .subtract(1, "hour")
      .locale("en")
      .format(moment.HTML5_FMT.DATETIME_LOCAL),
    to: moment().locale("en").format(moment.HTML5_FMT.DATETIME_LOCAL),
  },
  reducers: {
    updateLoading(state, action) {
      state.loading = action.payload;
    },
    updateItems(state, action) {
      state.items = action.payload;
    },
    updatePeriod(state, action) {
      state.period = action.payload;
    },
    updateFrom(state, action) {
      state.from = action.payload;
    },
    updateTo(state, action) {
      state.to = action.payload;
    },
  },
});

export { actions as analyticsActions };
export { reducer as analyticsReducer };
