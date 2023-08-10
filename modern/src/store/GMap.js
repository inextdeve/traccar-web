import { createSlice } from "@reduxjs/toolkit";

const { reducer, actions } = createSlice({
  name: "gmap",
  initialState: {
    directions: [],
  },
  reducers: {
    setDirections(state, action) {
      state.directions=action.payload;
    },
    
  },
});

export { actions as gmapActions };
export { reducer as gmapReducer };
