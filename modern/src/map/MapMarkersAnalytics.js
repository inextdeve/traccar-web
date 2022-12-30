import { useId, useCallback, useEffect } from "react";
import { map } from "./core/MapView";

const MapMarkersAnalytics = ({ positions, onClick }) => {
  const id = useId();

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
    [onClick]
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
      type: "symbol",
      source: id,
      layout: {
        "icon-image": "{category}-{color}",
        "icon-allow-overlap": true,
      },
      paint: {
        "icon-halo-blur": 1,
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

  useEffect(() => {
    map.getSource(id).setData({
      type: "FeatureCollection",
      features: positions.map((position, index) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [position.longitude, position.latitude],
        },
        properties: {
          index,
          id: position.id,
          category: position.category || "default",
          color: position.color || "primary",
        },
      })),
    });
  }, [positions]);

  return null;
};

export default MapMarkersAnalytics;
