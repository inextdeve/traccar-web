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
import MapMarkersAnalytics from "../map/MapMarkersAnalytics";
import { analyticsActions, binsActions } from "../store";
import Popup from "../common/components/Popup";

const MainMap = ({ filteredPositions, selectedPosition, onEventsClick }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.session.user.attributes.apitoken);

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
  const binsPositions = useSelector((state) => state.bins.bins);
  useEffect(() => {
    if (authenticated) {
      fetch(
        "https://med-reports.almajal.co/al/api/?token=fb329817e3ca2132d39134dd26d894b2&bins&limit=0;10"
      )
        .then((data) => data.json())
        .then((data) => {
          const filterSet = {
            route: [...new Set(data.map((item) => item.route))],
            bintype: [...new Set(data.map((item) => item.bintype))],
            center_name: [...new Set(data.map((item) => item.center_name))],
          };

          dispatch(binsActions.updateFilterSet(filterSet));

          dispatch(
            binsActions.updateBins(
              data.map(({ id_bin, status, latitude, longitude, bintype }) => ({
                id: id_bin,
                category: `${
                  status === "unempty" ? "trashNegative" : "trashPositive"
                }`,
                latitude,
                longitude,
                binType: bintype,
              }))
            )
          );
        });
    }
  }, []);

  const onMarkClick = useCallback(
    async (bin) => {
      const { id, binType } = JSON.parse(bin);

      dispatch(
        analyticsActions.updatePopup({
          show: true,
          id,
          binType,
        })
      );
      dispatch(analyticsActions.updateBinData(null));

      const data = await fetch(
        `https://med-reports.almajal.co/al/api/?token=${token}&bin=${id}`
      );

      const binData = await data.json();

      dispatch(analyticsActions.updateBinData(binData));
    },
    [binsPositions]
  );
  const onClose = () => {
    dispatch(analyticsActions.updatePopup(false));
    dispatch(analyticsActions.updateBinData(null));
  };
  return (
    <>
      <Popup
        desktopPadding={theme.dimensions.drawerWidthDesktop}
        onClose={onClose}
      />
      <MapView>
        <MapOverlay />
        <MapGeofence />
        <MapMarkersAnalytics positions={binsPositions} onClick={onMarkClick} />
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
