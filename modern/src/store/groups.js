import { createSlice } from "@reduxjs/toolkit";

const { reducer, actions } = createSlice({
  name: "groups",
  initialState: {
    items: {
      0: {
        name: "General",
      },
    },
  },
  reducers: {
    update(state, action) {
      action.payload.forEach((item) => (state.items[item.id] = item));
    },
  },
});

export { actions as groupsActions };
export { reducer as groupsReducer };
