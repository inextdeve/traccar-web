import React, { useCallback, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useDispatch, useSelector } from "react-redux";
import MapView from "../map/core/MapView";
import MapSelectedDevice from "../map/main/MapSelectedDevice";
import MapAccuracy from "../map/main/MapAccuracy";
import MapGeofence from "../map/MapGeofence";
import MapCurrentLocation from "../map/MapCurrentLocation";
import PoiMap from "../map/main/PoiMap";
import MapPadding from "../map/MapPadding";
import { devicesActions, geofencesActions } from "../store";
import MapDefaultCamera from "../map/main/MapDefaultCamera";
import MapLiveRoutes from "../map/main/MapLiveRoutes";
import MapPositions from "../map/MapPositions";
import MapOverlay from "../map/overlay/MapOverlay";
import MapGeocoder from "../map/geocoder/MapGeocoder";
import MapScale from "../map/MapScale";
import MapNotification from "../map/notification/MapNotification";
import useFeatures from "../common/util/useFeatures";
import MapBinsMarkers from "../map/MapBinsMarkers";
import MapMarkersAnalytics from "../map/MapMarkersAnalytics";

const MainMap = ({ filteredPositions, selectedPosition, onEventsClick }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const desktop = useMediaQuery(theme.breakpoints.up("md"));

  const eventsAvailable = useSelector((state) => !!state.events.items.length);

  const features = useFeatures();

  const onMarkerClick = useCallback(
    (_, deviceId) => {
      dispatch(devicesActions.select(deviceId));
    },
    [dispatch]
  );
  const authenticated = useSelector((state) => !!state.session.user);
  const binsP = useSelector((state) => state.geofences.bins);
  useEffect(() => {
    if (authenticated) {
      fetch("/api/geofences")
        .then((data) => data.json())
        .then((data) => {
          dispatch(
            geofencesActions.updateBins(
              data
                .filter((item) => item.attributes.bins === "yes")
                .map((item) => ({
                  id: `${item.id}`,
                  latitude: item.area.split(" ")[0].split("(")[1],
                  longitude: item.area.split(" ")[1].split(",")[0],
                  category: "bin",
                  binType: "2 yard",
                  color: "primary",
                }))
            )
          );
        });
    }
  }, []);

  return (
    <>
      <MapView>
        <MapOverlay />
        <MapGeofence />
        <MapMarkersAnalytics positions={binsP} />
        <MapAccuracy positions={filteredPositions} />
        <MapLiveRoutes />
        <MapPositions
          positions={filteredPositions}
          onClick={onMarkerClick}
          selectedPosition={selectedPosition}
          showStatus
        />
        <MapDefaultCamera />
        <MapSelectedDevice />
        <PoiMap />
      </MapView>
      <MapScale />
      <MapCurrentLocation />
      <MapGeocoder />
      {!features.disableEvents && (
        <MapNotification enabled={eventsAvailable} onClick={onEventsClick} />
      )}
      {desktop && (
        <MapPadding left={parseInt(theme.dimensions.drawerWidthDesktop, 10)} />
      )}
    </>
  );
};

export default MainMap;
