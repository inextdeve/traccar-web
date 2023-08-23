import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { binsDataTableActions } from "../store";

const containerStyle = {
  width: "100%",
  height: "200px",
};


function createTableData(id, description, position, type, center, route) {
  return {
    id,
    description,
    position,
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
    createTableData(5, "CTC-0005","27.0094724 49.5546019", "6 Yard",  "Solama", "D"),
    createTableData(2, "ATY-0035","27.0094724 49.5546019", "10 Litre", "Nord", "5F"),
    createTableData(3, "HJZ-0305", "27.0094724 49.5546019", "3 Yard", "Earth", "9D"),
  ];



  // StateFull
  const dispatch = useDispatch();
    
  useEffect(() => {
    dispatch(binsDataTableActions.setItems(rows))
  }, [])

  const classes = useDataTableStyle();

  // Currently selected row for editing or for adding

  const [activeRow, setActiveRow] = useState({id: "", description: "", position: "", type: "", center: "", route: ""});

  const selected = useSelector((state) => state.binsDataTable.selected);

  const items = useSelector((state) => state.binsDataTable.items);

  const setItems = (items) => dispatch(binsDataTableActions.setItems(items))

  const googleMapsApiKey = useSelector(
    (state) => state.session.server.attributes["Google Map Api Key"]
  );

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey,
  });

  useEffect(() => {
    if(selected.length === 1) {
      // Id of selected item
      const id = selected[0];

      const selectedItem = items.filter(item => item.id == id);

      setActiveRow(selectedItem[0]);
      
    }
  }, [selected])

  // Handling functions
  const handleInputChange = (event) => {
    setActiveRow(prev => ({...prev, [event.target.name]: event.target.value}))
  }

  const handleDrag = (event) => {
    const position = `${event.latLng.lat()} ${event.latLng.lng()}`;
    setActiveRow(prev => ({...prev, position}))
  }

  const handleSave = () => {
    // Fetch a post request modify db

    // Change local state

  const newItems = items.map((item) => {
    if(Number(item.id) === Number(activeRow.id)) {
      return activeRow;
    }
    return item
  });

  setItems(newItems);

  }


  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "settingsGroups"]}
      //Don't forget to change title
    >
       <CollectionTable
       // Modify the position value to an anchor link to google maps
        rows={items.map((item) => ({...item, position: <a href="" target="_blank"><RoomOutlinedIcon color="primary"/></a>}))}
        keys={keys}
        headCells={headCells}
        title="Bins"
      />
      <EditDialog onSave={handleSave}>
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
            <TextField label="Description" name="description" variant="outlined" value={activeRow.description} onChange={handleInputChange}/>
            <TextField label="Type" name="type" variant="outlined" value={activeRow.type} onChange={handleInputChange}/>
            <TextField label="Center" name="center" variant="outlined" value={activeRow.center} onChange={handleInputChange}/>
            <TextField label="Route" name="route" variant="outlined" value={activeRow.route} onChange={handleInputChange}/>
          </Box>
          <Box>
            <Box>
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={{
                    lat: 26.9555741,
                    lng: 49.5683506,
                  }}
                  zoom={10}
                >
                  <Marker
                    draggable
                    onDragEnd={handleDrag}
                    position={{
                      lat: parseFloat(activeRow.position?.split(" ")[0]),
                      lng: parseFloat(activeRow.position?.split(" ")[1]),
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
