import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { analyticsActions } from "../store";
import MapView from "./core/MapView";
import MapCamera from "./MapCamera";
import MapGeofence from "./MapGeofence";
import MapMarkersAnalytics from "./MapMarkersAnalytics";

const MapAnalytics = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.session.user.attributes.apitoken);
  const positions = useSelector((state) => state.analytics.positions);

  const onMarkClick = async (bin) => {
    const { id, binType } = JSON.parse(bin);

    dispatch(
      analyticsActions.updatePopup({
        show: true,
        id,
        binType,
      }),
    );
    dispatch(analyticsActions.updateBinData(null));

    const data = await fetch(
      `https://med-reports.almajal.co/al/api/?token=${token}&bin=${id}`,
    );

    const binData = await data.json();

    dispatch(analyticsActions.updateBinData(binData));
  };
  return (
    <>
      <MapView>
        <MapMarkersAnalytics positions={positions} onClick={onMarkClick} />
      </MapView>
      <MapCamera positions={positions} />
    </>
  );
};

export default MapAnalytics;
