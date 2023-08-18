import { useId, useCallback, useEffect } from "react";
import { useTheme } from "@mui/styles";
import { map } from "./core/MapView";

const MapPositions = ({ positions: pos, onClick }) => {
  const id = useId();

  const hydrolicId = useId();

  const theme = useTheme();

  const positions = [];

  pos.forEach((item, index) => {
    positions.push({ ...item, index });
  });
  console.log(positions);
  const isHydrolic = (item) => item?.attributes["Hydrolic Status"] === "yes";
  const isNotHydrolic = (item) => item?.attributes["Hydrolic Status"] === "No";

  const onMouseEnter = () => (map.getCanvas().style.cursor = "pointer");
  const onMouseLeave = () => (map.getCanvas().style.cursor = "");

  const onMarkerClick = useCallback(
    (event) => {
      event.preventDefault();
      const feature = event.features[0];
      if (onClick) {
        onClick(feature.properties.id, feature.properties.index);
      }
    },
    [onClick],
  );

  useEffect(() => {
    map.addSource(id, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });
    map.addLayer({
      id,
      type: "circle",
      source: id,
      paint: {
        "circle-radius": 5,
        "circle-color": theme.palette.colors.geometry,
      },
    });

    map.on("mouseenter", id, onMouseEnter);
    map.on("mouseleave", id, onMouseLeave);
    map.on("click", id, onMarkerClick);

    return () => {
      map.off("mouseenter", id, onMouseEnter);
      map.off("mouseleave", id, onMouseLeave);
      map.off("click", id, onMarkerClick);

      if (map.getLayer(id)) {
        map.removeLayer(id);
      }
      if (map.getSource(id)) {
        map.removeSource(id);
      }
    };
  }, [onMarkerClick]);

  // RED POINTS

  useEffect(() => {
    map.addSource(hydrolicId, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });
    map.addLayer({
      id: hydrolicId,
      type: "circle",
      source: hydrolicId,
      paint: {
        "circle-radius": 5,
        "circle-color": theme.palette.colors.negative,
      },
    });

    map.on("mouseenter", hydrolicId, onMouseEnter);
    map.on("mouseleave", hydrolicId, onMouseLeave);
    map.on("click", hydrolicId, onMarkerClick);

    return () => {
      map.off("mouseenter", hydrolicId, onMouseEnter);
      map.off("mouseleave", hydrolicId, onMouseLeave);
      map.off("click", hydrolicId, onMarkerClick);

      if (map.getLayer(hydrolicId)) {
        map.removeLayer(hydrolicId);
      }
      if (map.getSource(hydrolicId)) {
        map.removeSource(hydrolicId);
      }
    };
  }, [onMarkerClick]);

  useEffect(() => {
    map.getSource(id).setData({
      type: "FeatureCollection",
      features: positions.filter(isNotHydrolic).map((position, index) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [position.longitude, position.latitude],
        },
        properties: {
          index: position.index,
          id: position.id,
        },
      })),
    });
    map.getSource(hydrolicId).setData({
      type: "FeatureCollection",
      features: positions.filter(isHydrolic).map((position, index) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [position.longitude, position.latitude],
        },
        properties: {
          index: position.index,
          id: position.id,
        },
      })),
    });
  }, [positions]);

  return null;
};

export default MapPositions;
