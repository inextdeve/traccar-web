import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { chunkArray } from "../../common/util/converter";
import { useDispatch } from "react-redux";
import { gmapActions } from "../../store";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 26.9555741,
  lng: 49.5683506,
};

function GMap({ waypoints }) {
  const dispatch = useDispatch();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyARJ_KeukkNkWiSOWFZ6nJl31anmVC_R14",
  });
  const [directions, setDirections] = useState(null);

  const [map, setMap] = React.useState(null);

  const onLoad = React.useCallback(function callback(map) {
    // const directionsService = new google.maps.DirectionsService();
  }, []);

  const calculateRoute = async () => {
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();
    const waypointsGroups = chunkArray(
      Object.values(waypoints.slice(1, waypoints.length - 1)),
      23
    );
    const promises = waypointsGroups.map(async (waypointsGroup) => {
      return directionsService
        .route({
          origin: {
            query: waypoints[0].location,
          },
          destination: {
            query: waypoints[waypoints.length - 1].location,
          },
          waypoints: waypointsGroup,
          travelMode: google.maps.TravelMode.DRIVING,
        })
        .then((data) => data);
    });

    const responses = await Promise.all(promises);

    const distance =
      responses
        .map((response) => {
          return response.routes[0].legs;
        })
        .flat()
        .reduce((prev, cur) => {
          return prev + cur.distance.value;
        }, 0) / 1000;

    const duration =
      responses
        .map((response) => {
          return response.routes[0].legs;
        })
        .flat()
        .reduce((prev, cur) => {
          return prev + cur.duration.value;
        }, 0) / 60;

    dispatch(gmapActions.setDistanceNTime({ duration, distance }));

    setDirections(() => {
      return {
        request: { travelMode: "DRIVING" },
        routes: [
          {
            ...responses[0].routes[0],
            legs: responses
              .map((response) => {
                return response.routes[0].legs;
              })
              .flat(),
          },
        ],
      };
    });
  };

  useEffect(() => {
    if (isLoaded && waypoints.length) {
      calculateRoute();
    }
  }, [isLoaded, waypoints]);
  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {/* Child components, such as markers, info windows, etc. */}
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  ) : (
    <></>
  );
}

export default React.memo(GMap);
