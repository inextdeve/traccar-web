import React from "react";
import { useSelector } from "react-redux";
import { Box, IconButton, TextField } from "@mui/material";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import AddIcon from "@mui/icons-material/Add";
import SettingsMenu from "./components/SettingsMenu";
import PageLayout from "../common/components/PageLayout";
import CollectionTable from "./components/CollectionTable";
import EditDialog from "./components/Dialog";
import useDataTableStyle from "./common/useDataTableStyle";
import trash from "../resources/images/icon/bin.svg";

const containerStyle = {
  width: "100%",
  height: "200px",
};

const center = {
  lat: 26.9555741,
  lng: 49.5683506,
};

function createTableData(id, description, position, type, center, route) {
  return {
    id,
    description,
    position: (
      <a href="" target="_blank" style={{ color: "#ff4444" }}>
        <RoomOutlinedIcon />
      </a>
    ),
    type,
    center,
    route,
  };
}
const BinsPage = () => {
  const headCells = [
    {
      id: "id",
      numeric: true,
      disablePadding: true,
      label: "ID",
    },
    {
      id: "description",
      numeric: true,
      disablePadding: false,
      label: "Description",
    },
    {
      id: "position",
      numeric: true,
      disablePadding: false,
      label: "Position",
    },
    {
      id: "type",
      numeric: true,
      disablePadding: false,
      label: "Type",
    },
    {
      id: "center",
      numeric: true,
      disablePadding: false,
      label: "Center",
    },
    {
      id: "route",
      numeric: true,
      disablePadding: false,
      label: "Route",
    },
  ];
  const keys = ["id", "description", "position", "type", "center", "route"];

  const rows = [
    createTableData(5, "CTC-0005", 2939, "6 Yard", 4.3, "Solama"),
    createTableData(2, "ATY-0035", 3243, "10 Litre", 4.9, "Nord"),
    createTableData(3, "HJZ-0305", 3233, "3 Yard", 6.0, "Earth"),
  ];

  // StateFull
  const classes = useDataTableStyle();
  const [map, setMap] = React.useState(null);

  const googleMapsApiKey = useSelector(
    (state) => state.session.server.attributes["Google Map Api Key"]
  );

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey,
  });

  const onLoad = React.useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "settingsGroups"]}
      //Don't forget to change title
    >
      <CollectionTable
        rows={rows}
        keys={keys}
        headCells={headCells}
        title="Bins"
      />
      <EditDialog>
        <Box>
          <Box
            sx={{
              p: 4,
              mt: 2,
              display: "flex",
              gap: 3,
              justifyContent: "space-around",
              flexWrap: "wrap",
            }}
          >
            <TextField label="Description" variant="outlined" />
            <TextField label="Type" variant="outlined" />
            <TextField label="Center" variant="outlined" />
            <TextField label="Route" variant="outlined" />
          </Box>
          <Box>
            <Box>
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={center}
                  zoom={10}
                  onUnmount={onUnmount}
                  onLoad={onLoad}
                >
                  <Marker
                    draggable
                    // onDragEnd={(event) => handleDrag(event, id_bin)}
                    position={{
                      lat: 26.9555741,
                      lng: 49.5683506,
                    }}
                    icon={trash}
                  />
                </GoogleMap>
              ) : null}
            </Box>
          </Box>
        </Box>
      </EditDialog>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mr: 2 }}>
        <IconButton size="large" className={classes.addButton}>
          <AddIcon />
        </IconButton>
      </Box>
    </PageLayout>
  );
};

export default BinsPage;
