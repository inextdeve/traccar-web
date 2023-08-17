import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { chunkArray } from "../../common/util/converter";
import { useDispatch } from "react-redux";
import { gmapActions } from "../../store";
//Icon Test
import trashNegative from "../../resources/images/png/trashNegative.png";
import trashPositive from "../../resources/images/png/trashPositive.png";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 26.9555741,
  lng: 49.5683506,
};

function GMap() {
  const dispatch = useDispatch();

  const [waypoints, setWayPoints] = useState([]);

  const [directions, setDirections] = useState(null);

  const [map, setMap] = React.useState(null);

  const [legs, setLegs] = useState([]);

  const directionsRendererRef = useRef(null);

  const binsVisibility = useSelector((state) => state.GMap.binsVisibility);
  useEffect(() => {
    console.log("visi", binsVisibility);
  }, [binsVisibility]);

  const googleMapsApiKey = useSelector(
    (state) => state.session.server.attributes["Google Map Api Key"]
  );

  //Items (Bins)
  const data = useSelector((state) => state.GMap.items);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey,
  });

  useEffect(() => {
    if (data) {
      setWayPoints(
        data.map((point) => ({
          location: `${point.latitude},${point.longitude}`,
        }))
      );
    }
  }, [data]);

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
    console.log("res", responses);
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

  useEffect(() => {
    //Flush the previous pathline from the map
    if (directionsRendererRef.current)
      directionsRendererRef.current.setMap(null);

    if (directions) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true, // Hide markers
      });

      directionsRendererRef.current.setDirections(directions);
    }
  }, [directions]);

  useEffect(() => {
    if (!directions) return;
    const legs = [];

    directions.routes[0].legs.forEach((leg) => {
      legs.push(...leg.steps);
    });
    setLegs(legs);
  }, [directions]);

  const onLoad = React.useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      onUnmount={onUnmount}
      onLoad={onLoad}
    >
      {/* Child components, such as markers, info windows, etc. */}
      {/* {directions && <DirectionsRenderer directions={directions} />} */}
      {/* {legs &&
        legs.map((step, index) => {
          return (
            <Marker
              key={index}
              position={step.start_location}
              label={{ text: (index + 1).toString(), color: "white" }} // Use numeric label
            />
          );
        })} */}
      {binsVisibility &&
        data.map(({ empted, longitude, latitude, id_bin }) => (
          <Marker
            key={id_bin}
            position={{
              lat: parseFloat(latitude),
              lng: parseFloat(longitude),
            }}
            icon={empted ? trashPositive : trashNegative}
          />
        ))}
    </GoogleMap>
  ) : (
    <></>
  );
}

export default React.memo(GMap);
