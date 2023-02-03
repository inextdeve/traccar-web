import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
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
import Popup from "../common/components/Popup";
import { URL, ALTURL } from "../common/util/constant";
import MyMapButton from "../map/core/Buttons";

const MainMap = ({ filteredPositions, selectedPosition, onEventsClick }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.session.user.attributes.apitoken);
  const loading = useSelector((state) => state.bins.loading);

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
  const filteredBins = useSelector((state) => state.bins.filteredBins);
  const refresh = useSelector((state) => state.bins.refresh);

  const { to, from } = useSelector((state) => state.analytics);
  const dateTo = {
    date: moment(to, moment.HTML5_FMT.DATETIME_LOCAL)
      .toISOString()
      .split("T")[0],
    time: moment(to, moment.HTML5_FMT.DATETIME_LOCAL)
      .toISOString()
      .split("T")[1]
      .split(".")[0],
  };
  const dateFrom = {
    date: moment(from, moment.HTML5_FMT.DATETIME_LOCAL)
      .toISOString()
      .split("T")[0],
    time: moment(from, moment.HTML5_FMT.DATETIME_LOCAL)
      .toISOString()
      .split("T")[1]
      .split(".")[0],
  };

  const reportedBins = useSelector((state) => state.bins.reportedBins);

  useEffect(() => {
    const fetchData = async () => {
      const reportedBinData = await fetch(
        `${ALTURL}/?token=${token}&report_bins&time_f=${dateFrom.time}&date_f=${dateFrom.date}&time_t=${dateTo.time}&date_t=${dateTo.date}`
      );
      const data = await reportedBinData.json();
      dispatch(binsActions.updateReportedBins(data));
    };
    fetchData();
  }, []);

  useEffect(() => {
    dispatch(binsActions.updateLoading(true));
    const reportedBinData = fetch(
      `${ALTURL}/?token=${token}&report_bins&time_f=${dateFrom.time}&date_f=${dateFrom.date}&time_t=${dateTo.time}&date_t=${dateTo.date}`
    ).then((response) => {
      return response.json();
    });
    const allBinsData = fetch(`${URL}/?token=${token}&bins&limit=0;10000`).then(
      (response) => response.json()
    );

    Promise.all([reportedBinData, allBinsData])
      .then((response) => {
        dispatch(binsActions.updateLoading(false));
        const [reportedBins, data] = response; // data is for all bins i don't change it for the function need to change all things

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
                  report = { is: true, status: parseInt(isReported.status) };
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

      const data = await fetch(`${URL}/?token=${token}&bin=${id}`);

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
  };

  const showBins = useSelector((state) => state.bins.showBins);

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
