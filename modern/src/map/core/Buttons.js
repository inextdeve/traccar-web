import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { map } from "./MapView";
import { MapButton, SearchButton } from "../mapButton/mapButton";
import { binsActions, devicesActions, analyticsActions } from "../../store";

const ICONS = {
  filter:
    '<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"></path></svg>',
  replay:
    '<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"></path></svg>',
  camera:
    '<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"></circle><path d="M9 2 7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"></path></svg>',
  charts:
    '<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24"><path d="M4 9h4v11H4zm12 4h4v7h-4zm-6-9h4v16h-4z"></path></svg>',
};
const MapButtons = () => {
  const dispatch = useDispatch();

  const renderConstant = useSelector((state) => state.bins.renderConstant);

  const createButton = () => {
    // Filter Switcher
    const filterSwitcher = new MapButton(
      ICONS.filter,
      () => {
        const filterDialog = document.getElementById("filterDialog");
        filterDialog.style.display = "block";
      },
      "filterId-22"
    );
    map.removeControl(filterSwitcher);
    map.addControl(filterSwitcher, "top-right");

    // Refresh
    const refresh = new MapButton(
      ICONS.replay,
      () => {
        dispatch(binsActions.refresh());
      },
      "refresh-id-383"
    );
    map.removeControl(refresh);
    map.addControl(refresh, "top-right");

    // Camera
    const camera = new MapButton(
      ICONS.camera,
      () => dispatch(devicesActions.updateShowCameraList(true)),
      "camera-37353-ca"
    );
    map.removeControl(camera);
    map.addControl(camera, "top-right");

    // Status Charts
    const kpiCharts = new MapButton(
      ICONS.charts,
      () => dispatch(analyticsActions.updateShowKPI(true)),
      "kpis-charts-status-2023-04-02"
    );
    map.removeControl(kpiCharts);
    map.addControl(kpiCharts, "top-right");

    // Search Box
    const SearchBox = new SearchButton();
    map.removeControl(SearchBox);
    map.addControl(SearchBox, "top-right");
  };

  useEffect(() => {
    if (renderConstant < 1) {
      createButton();
      dispatch(binsActions.updateRenderConstant());
    }
  }, []);
  return null;
};
export default MapButtons;
