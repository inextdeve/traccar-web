import { createSlice } from "@reduxjs/toolkit";

const { reducer, actions } = createSlice({
  name: "devices",
  initialState: {
    items: {},
    cameraList: [],
    selectedCamera: [],
    selectedId: null,
    showCamera: false,
    showCameraList: false,
  },
  reducers: {
    refresh(state, action) {
      //For generating position
      const getRandom = (min, max) =>
        Math.floor(Math.random() * (max - min + 1) + min);
      state.items = {};
      action.payload.forEach((item) => (state.items[item.id] = item));
      state.cameraList = action.payload
        .filter((item) => item.attributes.mdvr)
        .map((item) => {
          return { ...item, top: getRandom(0, 50), left: getRandom(30, 40) };
        });
    },
    update(state, action) {
      action.payload.forEach((item) => (state.items[item.id] = item));
    },
    select(state, action) {
      state.selectedId = action.payload;
    },
    remove(state, action) {
      delete state.items[action.payload];
    },
    updateShowCamera(state, action) {
      state.showCamera = action.payload;
    },
    updateShowCameraList(state, action) {
      state.showCameraList = action.payload;
    },
    updateSelectedCamera(state, action) {
      const alreadyExist = state.selectedCamera.some(
        (item) => item?.id === action.payload.id && !item?.removed
      );
      if (!alreadyExist) {
        state.selectedCamera = [...state.selectedCamera, action.payload];
      }
    },
    removeCamera(state, action) {
      state.selectedCamera = state.selectedCamera.map((item) => {
        if (item.id === action.payload) {
          return { ...item, removed: true };
        }
        return item;
      });
    },
  },
});

export { actions as devicesActions };
export { reducer as devicesReducer };
