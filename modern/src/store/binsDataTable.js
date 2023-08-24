import { createSlice } from "@reduxjs/toolkit";

const { reducer, actions } = createSlice({
  name: "binsDataTable",
  initialState: {
    items: [],
    selected: [],
    openEditDialog: false,
    openAddDialog: false,
  },
  reducers: {
    setItems(state, action) {
      state.items = action.payload;
    },
    setSelected(state, action) {
      state.selected = action.payload;
    },
    setOpenEditDialog(state, action) {
      state.openEditDialog = action.payload;
    },
    setOpenAddDialog(state, action) {
      state.openAddDialog = action.payload;
    },
  },
});

export { actions as binsDataTableActions };
export { reducer as binsDataTableReducer };
