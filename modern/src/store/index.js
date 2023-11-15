import { combineReducers, configureStore } from "@reduxjs/toolkit";

import { errorsReducer as errors } from "./errors";
import { sessionReducer as session } from "./session";
import { devicesReducer as devices } from "./devices";
import { eventsReducer as events } from "./events";
import { geofencesReducer as geofences } from "./geofences";
import { groupsReducer as groups } from "./groups";
import { driversReducer as drivers } from "./drivers";
import { maintenancesReducer as maintenances } from "./maintenances";
import { reportsReducer as reports } from "./reports";
import { analyticsReducer as analytics } from "./analytics";
import { popupReducer as popup } from "./popup";
import { binsReducer as bins } from "./bins";
import { gmapReducer as GMap } from "./GMap";
import { dbManagementReducer as dbManagement } from "./dbManagement";
import throttleMiddleware from "./throttleMiddleware";

const reducer = combineReducers({
  errors,
  session,
  devices,
  events,
  geofences,
  groups,
  drivers,
  maintenances,
  reports,
  analytics,
  popup,
  bins,
  GMap,
  dbManagement,
});

export { errorsActions } from "./errors";
export { sessionActions } from "./session";
export { devicesActions } from "./devices";
export { eventsActions } from "./events";
export { geofencesActions } from "./geofences";
export { groupsActions } from "./groups";
export { driversActions } from "./drivers";
export { maintenancesActions } from "./maintenances";
export { reportsActions } from "./reports";
export { analyticsActions } from "./analytics";
export { popupActions } from "./popup";
export { binsActions } from "./bins";
export { gmapActions } from "./GMap";
export { dbManagementActions } from "./dbManagement";

export default configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }).concat(throttleMiddleware),
});
// Use this params inside getDefaultMiddleware Fn if you get warning about middlware
/* 
{
    immutableCheck: false,
    serializableCheck: false,
  }
*/