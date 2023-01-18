import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import React, {
  useRef, useLayoutEffect, useEffect, useState,
} from "react";
import { SwitcherControl } from "../switcher/switcher";
import {
  useAttributePreference,
  usePreference,
} from "../../common/util/preferences";
import usePersistedState, {
  savePersistedState,
} from "../../common/util/usePersistedState";
import { mapImages } from "./preloadImages";
import useMapStyles from "./useMapStyles";
import { MapButton } from "../mapButton/mapButton";
import { useDispatch } from "react-redux";
import { binsActions } from "../../store";

const ICONS = {
  filter: `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"></path></svg>`,
  replay: `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"></path></svg>`
}

const element = document.createElement("div");
element.style.width = "100%";
element.style.height = "100%";
element.style.boxSizing = "initial";

export const map = new maplibregl.Map({
  container: element,
  attributionControl: false,
});

let ready = false;
const readyListeners = new Set();

const addReadyListener = (listener) => {
  readyListeners.add(listener);
  listener(ready);
};

const removeReadyListener = (listener) => {
  readyListeners.delete(listener);
};

const updateReadyValue = (value) => {
  ready = value;
  readyListeners.forEach((listener) => listener(value));
};

const initMap = async () => {
  if (ready) return;
  if (!map.hasImage("background")) {
    Object.entries(mapImages).forEach(([key, value]) => {
      map.addImage(key, value, {
        pixelRatio: window.devicePixelRatio,
      });
    });
  }
  updateReadyValue(true);
};

map.addControl(new maplibregl.NavigationControl());

const switcher = new SwitcherControl(
  () => updateReadyValue(false),
  (styleId) => savePersistedState("selectedMapStyle", styleId),
  () => {
    map.once("styledata", () => {
      const waiting = () => {
        if (!map.loaded()) {
          setTimeout(waiting, 33);
        } else {
          initMap();
        }
      };
      waiting();
    });
  },
);

map.addControl(switcher);



const MapView = ({ children }) => {

  const dispatch = useDispatch();

  const containerEl = useRef(null);

  const [mapReady, setMapReady] = useState(false);

  const mapStyles = useMapStyles();
  const activeMapStyles = useAttributePreference(
    "activeMapStyles",
    "locationIqStreets,osm,carto",
  );
  const [defaultMapStyle] = usePersistedState(
    "selectedMapStyle",
    usePreference("map", "locationIqStreets"),
  );
  const mapboxAccessToken = useAttributePreference("mapboxAccessToken");
  const maxZoom = useAttributePreference("web.maxZoom");

  useEffect(() => {
    if (maxZoom) {
      map.setMaxZoom(maxZoom);
    }
  }, [maxZoom]);

  useEffect(() => {
    maplibregl.accessToken = mapboxAccessToken;
  }, [mapboxAccessToken]);

  useEffect(() => {
    const filteredStyles = mapStyles.filter(
      (s) => s.available && activeMapStyles.includes(s.id),
    );
    const styles = filteredStyles.length
      ? filteredStyles
      : mapStyles.filter((s) => s.id === "osm");
    switcher.updateStyles(styles, defaultMapStyle);
  }, [mapStyles, defaultMapStyle]);

  useEffect(() => {
    const listener = (ready) => setMapReady(ready);
    addReadyListener(listener);
    return () => {
      removeReadyListener(listener);
    };
  }, []);

  useLayoutEffect(() => {
    const currentEl = containerEl.current;
    currentEl.appendChild(element);
    map.resize();
    return () => {
      currentEl.removeChild(element);
    };
  }, [containerEl]);

  useLayoutEffect(() => {
    //Filter Switcher
    const filterSwitcher = new MapButton(ICONS.filter ,() => {
      const filterDialog = document.getElementById("filterDialog");
      filterDialog.style.display = "block";
    });
    map.addControl(filterSwitcher, "top-right");

    //Refresh
    const refresh = new MapButton(ICONS.replay, () => {
      dispatch(binsActions.refresh());
    });
    map.addControl(refresh, "top-right");

  } ,[])
  

  return (
    <div style={{ width: "100%", height: "100%" }} ref={containerEl}>
      {mapReady && children}
    </div>
  );
};

export default MapView;
