import { createSlice } from "@reduxjs/toolkit";

const { reducer, actions } = createSlice({
  name: "binsDataTable",
  initialState: {
    items: [],
    selected: [],
  },
  reducers: {
    setItems(state, action) {
      state.items = action.payload;
    },
    setSelected(state, action) {
        state.selected = action.payload;
    },
  },
});

export { actions as binsDataTableActions };
export { reducer as binsDataTableReducer };
