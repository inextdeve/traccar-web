import { createSlice } from "@reduxjs/toolkit";

const { reducer, actions } = createSlice({
  name: "dbManagement",
  initialState: {
    items: [],
    routes: [],
    types: [],
    centers: [],
    selected: [],
    openEditDialog: false,
    openAddDialog: false,
    loading: false
  },
  reducers: {
    setItems(state, action) {
      state.items = action.payload;
    },
    setRoutes(state, action) {
      state.routes = action.payload;
    },
    setTypes(state, action) {
      state.types = action.payload;
    },
    setCenters(state, action) {
      state.centers = action.payload;
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
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export { actions as dbManagementActions };
export { reducer as dbManagementReducer };
