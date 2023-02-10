import { createSlice } from "@reduxjs/toolkit";
import moment from "moment";

const { reducer, actions } = createSlice({
  name: "analytics",
  initialState: {
    loading: false,
    items: [],
    positions: [],
    period: "today",
    from: moment()
      .subtract(1, "day")
      .locale("en")
      .format(moment.HTML5_FMT.DATETIME_LOCAL),
    to: moment().locale("en").format(moment.HTML5_FMT.DATETIME_LOCAL),
    popup: false,
    binData: null,
    showKPI: false,
    fromToDay: {
      from: moment()
        .subtract(1, "day")
        .locale("en")
        .format(moment.HTML5_FMT.DATETIME_LOCAL),
      to: moment().locale("en").format(moment.HTML5_FMT.DATETIME_LOCAL),
    },
    chartData: null,
    equipments: [],
  },
  reducers: {
    updateLoading(state, action) {
      state.loading = action.payload;
    },
    updateItems(state, action) {
      state.items = action.payload;
    },
    updatePositions(state, action) {
      state.positions = action.payload;
    },
    refreshPositions(state, action) {
      state.positions = state.positions.filter(
        (position) => position.id !== action.payload,
      );
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
    updatePopup(state, action) {
      state.popup = action.payload;
    },
    updateBinData(state, action) {
      state.binData = action.payload;
    },
    updateShowKPI(state, action) {
      state.showKPI = action.payload;
    },
    updateChartData(state, action) {
      state.chartData = action.payload;
    },
    updateEquipments(state, action) {
      state.equipments = action.payload;
    },
  },
});

export { actions as analyticsActions };
export { reducer as analyticsReducer };
