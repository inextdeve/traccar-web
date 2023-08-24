import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { chunkArray } from "../../common/util/converter";
import { gmapActions } from "../../store";
import { URL } from "../../common/util/constant";
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

const GMap = () => {
  const dispatch = useDispatch();

  const [waypoints, setWayPoints] = useState([]);

  const [directions, setDirections] = useState(null);

  const [map, setMap] = React.useState(null);

  const [legs, setLegs] = useState([]);

  const directionsRendererRef = useRef(null);

  const binsVisibility = useSelector((state) => state.GMap.binsVisibility);

  const googleMapsApiKey = useSelector(
    (state) => state.session.server.attributes["Google Map Api Key"]
  );

  const token = useSelector((state) => state.session.user.attributes.apitoken);

  // Items (Bins)
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

    const promises = waypointsGroups.map(async (waypointsGroup) =>
      directionsService
        .route({
          origin: {
            query: waypoints[0].location,
          },
          destination: {
            query: waypoints[waypoints.length - 1].location,
          },
          waypoints: waypointsGroup,
          // eslint-disable-next-line no-undef
          travelMode: google.maps.TravelMode.DRIVING,
        })
        .then((data) => data)
    );

    const responses = await Promise.all(promises);

    const distance =
      responses
        .map((response) => response.routes[0].legs)
        .flat()
        .reduce((prev, cur) => prev + cur.distance.value, 0) / 1000;

    const duration =
      responses
        .map((response) => response.routes[0].legs)
        .flat()
        .reduce((prev, cur) => prev + cur.duration.value, 0) / 60;

    dispatch(gmapActions.setDistanceNTime({ duration, distance }));

    setDirections(() => ({
      request: { travelMode: "DRIVING" },
      routes: [
        {
          ...responses[0].routes[0],
          legs: responses.map((response) => response.routes[0].legs).flat(),
        },
      ],
    }));
  };

  useEffect(() => {
    if (isLoaded && waypoints.length) {
      calculateRoute();
    }
  }, [isLoaded, waypoints]);

  useEffect(() => {
    // Flush the previous pathline from the map
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
    }

    if (directions) {
      // eslint-disable-next-line no-undef
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

  const onLoad = React.useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  const handleDrag = async (event, id) => {
    const position = `${event.latLng.lat()} ${event.latLng.lng()}`;
    const body = { id_bin: id, position };
    const updateGmapItems = data.map((item) => {
      if (item.id_bin == id) {
        return {
          ...item,
          latitude: parseFloat(position.split(" ")[0]),
          longitude: parseFloat(position.split(" ")[1]),
        };
      }
      return item;
    });

    dispatch(gmapActions.setItems(updateGmapItems));

    try {
      const response = await fetch(`${URL}/api/bins/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const updatePosition = await response.json();

      if (updatePosition.success) {
        throw new Error("Cannot update position");
      }
    } catch (error) {
      console.log(error);
    }
  };

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
      {legs &&
        legs.map((step, index) => (
          <Marker
            key={index}
            position={step.start_location}
            label={{ text: `${index + 1}`, color: "white" }} // Use numeric label
          />
        ))}
      {binsVisibility &&
        data.map(({ empted, longitude, latitude, id_bin }) => (
          <Marker
            draggable
            onDragEnd={(event) => handleDrag(event, id_bin)}
            key={id_bin}
            position={{
              lat: parseFloat(latitude),
              lng: parseFloat(longitude),
            }}
            icon={empted ? trashPositive : trashNegative}
          />
        ))}
    </GoogleMap>
  ) : null;
};

export default React.memo(GMap);
