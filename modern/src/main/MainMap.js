import React, { useCallback, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { LinearProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import MapView from "../map/core/MapView";
import MapSelectedDevice from "../map/main/MapSelectedDevice";
import MapAccuracy from "../map/main/MapAccuracy";
import MapGeofence from "../map/MapGeofence";
import MapCurrentLocation from "../map/MapCurrentLocation";
import PoiMap from "../map/main/PoiMap";
import MapPadding from "../map/MapPadding";
import { devicesActions, analyticsActions, binsActions } from "../store";
import MapDefaultCamera from "../map/main/MapDefaultCamera";
import MapLiveRoutes from "../map/main/MapLiveRoutes";
import MapPositions from "../map/MapPositions";
import MapOverlay from "../map/overlay/MapOverlay";
import MapGeocoder from "../map/geocoder/MapGeocoder";
import MapScale from "../map/MapScale";
import MapNotification from "../map/notification/MapNotification";
import useFeatures from "../common/util/useFeatures";
import MapMarkersAnalytics from "../map/MapMarkersAnalytics";
import MapMarkersNearbyStops from "../map/MapMarkersNearbyStops";
import Popup from "../common/components/Popup";
import { URL } from "../common/util/constant";
import MyMapButton from "../map/core/Buttons";
import { useConfirm } from "material-ui-confirm";

const MainMap = ({ filteredPositions, selectedPosition, onEventsClick }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const confirm = useConfirm();

  const token = useSelector((state) => state.session.user.attributes.apitoken);
  const loading = useSelector((state) => state.bins.loading);
  // Selected Bin in popup
  const binId = useSelector(state => state.analytics.popup.id);

  const nearbyStops = useSelector((state) => state.devices.nearbyStops);

  const desktop = useMediaQuery(theme.breakpoints.up("md"));

  const eventsAvailable = useSelector((state) => !!state.events.items.length);

  const features = useFeatures();

  const onMarkerClick = useCallback(
    (_, deviceId) => {
      dispatch(devicesActions.select(deviceId));
    },
    [dispatch]
  );
  const binsPositions = useSelector((state) => state.bins.bins);
  const filteredBins = useSelector((state) => state.bins.filteredBins);
  const refresh = useSelector((state) => state.bins.refresh);

  const reportedBins = useSelector((state) => state.bins.reportedBins);

  useEffect(() => {
    const fetchData = async () => {
      const reportedBinData = await fetch(`${URL}/api/bins/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await reportedBinData.json();

      dispatch(binsActions.updateReportedBins(data || []));
    };
    fetchData();
  }, [refresh]);

  useEffect(() => {
    dispatch(binsActions.updateLoading(true));
    const reportedBinData = fetch(`${URL}/api/bins/reports`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => response.json());
    const allBinsData = fetch(`${URL}/api/bins`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => response.json());
    Promise.all([reportedBinData, allBinsData])
      .then((response) => {
        dispatch(binsActions.updateLoading(false));
        let [reportedBins, data] = response; // data is for all bins i don't change it for the function need to change all things

        if (reportedBins === null) {
          reportedBins = [];
        }

        dispatch(binsActions.updateLoading(false));
        const filterSet = {
          route: [...new Set(data.map((item) => item.route))],
          bintype: [...new Set(data.map((item) => item.bintype))],
          center_name: [...new Set(data.map((item) => item.center_name))],
        };

        dispatch(binsActions.updateFilterSet(filterSet));

        dispatch(
          binsActions.updateBins(
            data.map(
              ({
                id_bin,
                status,
                latitude,
                longitude,
                bintype,
                center_name,
                route,
                description,
                centerid,
                routid,
                bintypeid,
                time,
              }) => {
                let category = "";
                let report = { is: false, status: null };

                let isReported = reportedBins.find((item) => {
                  return parseInt(item.id_bin) === parseInt(id_bin);
                });

                if (isReported) {
                  category = parseInt(isReported.status)
                    ? "trashInfo"
                    : "trashWarning";
                  report = {
                    is: true,
                    status: parseInt(isReported.status),
                  };
                } else {
                  category =
                    status === "unempty" ? "trashNegative" : "trashPositive";
                }

                return {
                  id: id_bin,
                  category,
                  latitude,
                  longitude,
                  bintype,
                  center_name,
                  route,
                  status,
                  binType: bintype,
                  report,
                  description,
                  centerid,
                  routid,
                  bintypeid,
                  time,
                };
              }
            )
          )
        );
      })
      .catch(() => dispatch(binsActions.updateLoading(false)));
  }, [refresh]);

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

      const data = await fetch(`${URL}/api/bins/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const binData = await data.json();

      let isReported = reportedBins.find((item) => {
        return parseInt(item.id_bin) === parseInt(id);
      });

      if (isReported) {
        dispatch(analyticsActions.updateBinData([...binData, isReported]));
        return;
      }

      dispatch(analyticsActions.updateBinData(binData));
    },
    [binsPositions]
  );
  const onClose = () => {
    dispatch(analyticsActions.updatePopup(false));
    dispatch(analyticsActions.updateBinData(null));
    dispatch(devicesActions.updateNearbyStops([]))
  };

  const showBins = useSelector((state) => state.bins.showBins);

  const onNearbyStopsMarkersClick = useCallback(async (position) => {
    
    try {
      await confirm({ description: `This will update the position of the selected bin to here !` });
      const newPosition = JSON.parse(position);
      
      // Modify the position of the bin
      dispatch(binsActions.updateBins(filteredBins.map((bin) => {
        if (bin.id === binId) {
          
          return {...bin, longitude: newPosition.longitude, latitude: newPosition.latitude}
        }
        return bin;
      })));

      // Set the update in the DB
      const response = await fetch(`${URL}/api/bins`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({id_bin: binId,position: `${newPosition.latitude} ${newPosition.longitude}`}),
      });

      if (response.status >= 400 && response.status < 600) {
        const errorMessage = await response.json();
        throw new Error(
          errorMessage?.message || "Server Error: The item cannot updated"
        );
      }

    } catch (error) {
      console.log(error)
    }
  },[nearbyStops])

  return (
    <>
      {loading ? <LinearProgress /> : null}
      <Popup
        desktopPadding={theme.dimensions.drawerWidthDesktop}
        onClose={onClose}
      />
      <MapView>
        <MyMapButton />
        <MapOverlay />
        <MapGeofence />
        {showBins ? (
          <MapMarkersAnalytics positions={filteredBins} onClick={onMarkClick} />
        ) : null}
        <MapMarkersNearbyStops positions={nearbyStops} onClick={onNearbyStopsMarkersClick}/>
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
