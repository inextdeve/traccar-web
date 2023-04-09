import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { analyticsActions } from "../store";
import MapView from "./core/MapView";
import MapCamera from "./MapCamera";
import MapMarkersAnalytics from "./MapMarkersAnalytics";
import { URL } from "../common/util/constant";

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
    const data = await fetch(`${URL}/api/bins/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

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
