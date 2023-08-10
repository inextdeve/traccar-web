import React, { useEffect, useState } from 'react'
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import { chunkArray } from '../../common/util/converter';

const containerStyle = {
  width: '100%',
  height: '600px'
};

const center = {
  lat: -3.745,
  lng: -38.523
};

function GMap({waypoints}) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyARJ_KeukkNkWiSOWFZ6nJl31anmVC_R14"
  })
  const [directions, setDirections] = useState(null);

  const [map, setMap] = React.useState(null)

  const onLoad = React.useCallback(function callback(map) {
    // const directionsService = new google.maps.DirectionsService();
  }, [])

  const calculateRoute = async () => {
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService()
    const waypointsGroups = chunkArray(
      Object.values(waypoints.slice(1, waypoints.length - 1)),
      23
    );
    const promises = waypointsGroups.map((waypointsGroup) => {
      console.log("way group",waypointsGroups)
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
        }).then(data => data)
    });
    // const results = await directionsService.route({
    //   origin: "26.978721966692735,49.66082598410027",
    //   destination: "26.984257806531307,49.655965821365285",
    //   // eslint-disable-next-line no-undef
    //   travelMode: google.maps.TravelMode.DRIVING,
    // })
    const results = await Promise.all(promises);
    console.log(results)
    const responses = results
    setDirections(() => {
      return responses[0]
  })
}

  useEffect(() => {
    if(isLoaded) {
      calculateRoute()
    }
  }, [isLoaded])
  const onUnmount = React.useCallback(function callback(map) {
    setMap(null)
  }, [])

  return isLoaded ? (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        { /* Child components, such as markers, info windows, etc. */ }
        {directions && (
            <DirectionsRenderer directions={directions} />
          )}
        
      </GoogleMap>
  ) : <></>
}

export default React.memo(GMap)