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
import { dbManagementActions } from "../store";
import { URL } from "../common/util/constant";

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
  const keys = [
    "id",
    "description",
    "position",
    "bintype",
    "center_name",
    "route",
  ];

  const rows = [
    createTableData(
      5,
      "CTC-0005",
      "27.0094724 49.5546019",
      "6 Yard",
      "Solama",
      "D"
    ),
    createTableData(
      2,
      "ATY-0035",
      "27.0094724 49.5546019",
      "10 Litre",
      "Nord",
      "5F"
    ),
    createTableData(
      3,
      "HJZ-0305",
      "27.0094724 49.5546019",
      "3 Yard",
      "Earth",
      "9D"
    ),
  ];

  // StateFull
  const dispatch = useDispatch();

  const bins = useSelector((state) => state.bins.bins);

  const allDataIsFetched = useSelector(
    (state) => state.dbManagement.allDataIsFetched
  );
  useEffect(() => {
    if (allDataIsFetched) return;
    if (bins.length) {
      dispatch(dbManagementActions.setItems([...bins]));
    } else {
      (async () => {
        const allBins = await fetch(`${URL}/api/bins`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await allBins.json();
        dispatch(dbManagementActions.setItems(data));
      })();
    }
  }, []);

  const classes = useDataTableStyle();

  // Currently selected row for editing or for adding

  const initRow = {
    id: "",
    description: "",
    position: "26.9555741 49.5683506",
    bintype: "",
    center_name: "",
    route: "",
    latitude: "",
    longitude: "",
  };

  const [activeRow, setActiveRow] = useState(initRow);

  const token = useSelector((state) => state.session.user.attributes.apitoken);

  const selected = useSelector((state) => state.dbManagement.selected);

  const items = useSelector((state) => state.dbManagement.items);

  const setItems = (items) => dispatch(dbManagementActions.setItems(items));

  const openEdit = useSelector((state) => state.dbManagement.openEditDialog);

  const setOpenEdit = (bool) =>
    dispatch(dbManagementActions.setOpenEditDialog(bool));

  const openAdd = useSelector((state) => state.dbManagement.openAddDialog);

  const setOpenAdd = (bool) =>
    dispatch(dbManagementActions.setOpenAddDialog(bool));

  const googleMapsApiKey = useSelector(
    (state) => state.session.server.attributes["Google Map Api Key"]
  );

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey,
  });

  useEffect(() => {
    if (selected.length === 1 || openEdit) {
      // Id of selected item
      const id = selected[0];

      const selectedItem = items.filter((item) => item.id == id);

      setActiveRow(selectedItem[0]);
    }
  }, [selected, openEdit]);

  // Handling functions
  const handleInputChange = (event) => {
    setActiveRow((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleDrag = (event) => {
    const latitude = event.latLng.lat();
    const longitude = event.latLng.lng();
    setActiveRow((prev) => ({ ...prev, latitude, longitude }));
  };

  const handleSave = async (event) => {
    // event params is a string ("edit" | "add")
    // Fetch a post request modify db

    const body = {
      ...activeRow,
      position: `${activeRow.latitude} ${activeRow.longitude}`,
    };

    delete body.latitude;
    delete body.longitude;
    delete body.status;
    delete body.report;
    delete body.binType;

    console.log("BODY", body);

    // if (event === "edit") {
    //   try {
    //     const response = await fetch(`${URL}/api/bins/`, {
    //       method: "PATCH",
    //       headers: {
    //         Authorization: `Bearer ${token}`,
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify(body),
    //     });

    //     const updatePosition = await response.json();

    //     if (updatePosition.success) {
    //       throw new Error("Cannot update position");
    //     }
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }

    // Change local state
    const newItems = items.map((item) => {
      if (Number(item.id) === Number(activeRow.id)) {
        return activeRow;
      }
      return item;
    });

    setItems(newItems);
  };
  const handleClose = () => {
    setOpenEdit(false);
    setOpenAdd(false);
  };

  const handleAddClick = () => {
    setActiveRow(initRow);
    setOpenAdd(true);
  };
  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "settingsGroups"]}
      //Don't forget to change title
    >
      <CollectionTable
        // Modify the position value to an anchor link to google maps
        rows={items.map((item) => ({
          ...item,
          position: (
            <IconButton size="small">
              <RoomOutlinedIcon color="primary" />
            </IconButton>
          ),
        }))}
        keys={keys}
        headCells={headCells}
        title="Bins"
      />
      <EditDialog
        onSave={() => handleSave("edit")}
        onClose={handleClose}
        open={openEdit}
      >
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
            <TextField
              label="Description"
              name="description"
              variant="outlined"
              value={activeRow.description}
              onChange={handleInputChange}
            />
            <TextField
              label="Type"
              name="bintype"
              variant="outlined"
              value={activeRow.bintype}
              onChange={handleInputChange}
            />
            <TextField
              label="Center"
              name="center_name"
              variant="outlined"
              value={activeRow.center_name}
              onChange={handleInputChange}
            />
            <TextField
              label="Route"
              name="route"
              variant="outlined"
              value={activeRow.route}
              onChange={handleInputChange}
            />
          </Box>
          <Box>
            <Box>
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={{
                    lat: parseFloat(activeRow.latitude),
                    lng: parseFloat(activeRow.longitude),
                  }}
                  zoom={10}
                >
                  <Marker
                    draggable
                    onDragEnd={handleDrag}
                    position={{
                      lat: parseFloat(activeRow.latitude),
                      lng: parseFloat(activeRow.longitude),
                    }}
                    icon={trash}
                  />
                </GoogleMap>
              ) : null}
            </Box>
          </Box>
        </Box>
      </EditDialog>
      <EditDialog
        onSave={() => handleSave("add")}
        open={openAdd}
        onClose={handleClose}
        title="Add Bin"
      >
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
            <TextField
              label="Description"
              name="description"
              variant="outlined"
              value={activeRow.description}
              onChange={handleInputChange}
            />
            <TextField
              label="Type"
              name="type"
              variant="outlined"
              value={activeRow.bintype}
              onChange={handleInputChange}
            />
            <TextField
              label="Center"
              name="center"
              variant="outlined"
              value={activeRow.center_name}
              onChange={handleInputChange}
            />
            <TextField
              label="Route"
              name="route"
              variant="outlined"
              value={activeRow.route}
              onChange={handleInputChange}
            />
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
        <IconButton
          size="large"
          className={classes.addButton}
          onClick={handleAddClick}
        >
          <AddIcon />
        </IconButton>
      </Box>
    </PageLayout>
  );
};

export default BinsPage;
