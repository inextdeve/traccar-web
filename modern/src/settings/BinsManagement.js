import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
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
import { useTranslation } from "../common/components/LocalizationProvider";

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

  // const rows = [
  //   {
  //     id: 7,
  //     id_bin: 7,
  //     description: "CTC-0002",
  //     position: "",
  //     routid: 97,
  //     centerid: 85,
  //     bintypeid: 5,
  //     center_name: "HZJ",
  //     route: "ZAH",
  //     bintype: "6 Yard",
  //     latitude: "26.9791087",
  //     longitude: "49.496904",
  //   },
  //   {
  //     id: 9,
  //     id_bin: 9,
  //     description: "SLS-000E",
  //     position: "",
  //     routid: 98,
  //     centerid: 86,
  //     bintypeid: 6,
  //     center_name: "LOK",
  //     route: "JIN",
  //     bintype: "10 Litre",
  //     latitude: "26.9791087",
  //     longitude: "49.496904",
  //   },
  // ];

  // const binTypeData = [
  //   {
  //     id: 5,
  //     bintype: "6 Yard",
  //   },
  //   {
  //     id: 6,
  //     bintype: "10 Litre",
  //   },
  // ];
  // const centersData = [
  //   {
  //     id: 85,
  //     center_name: "HZJ",
  //   },
  //   {
  //     id: 86,
  //     center_name: "LOK",
  //   },
  // ];
  // const routesData = [
  //   {
  //     id: 97,
  //     rout_code: "ZAH",
  //   },
  //   {
  //     id: 98,
  //     rout_code: "JIN",
  //   },
  // ];

  // StateFull
  const t = useTranslation();
  const dispatch = useDispatch();

  const bins = useSelector((state) => state.bins.bins);

  useEffect(() => {
    if (bins.length) {
      dispatch(dbManagementActions.setItems([...bins]));
    } else {
      (async () => {
        try {
          const allBins = await fetch(`${URL}/api/bins`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await allBins.json();
          dispatch(
            dbManagementActions.setItems(
              data.map((item) => ({ id: item.id_bin, ...item }))
            )
          );
        } catch (error) {
          console.log(error);
        }
      })();
    }

    const fetchData = async () => {
      try {
        const routesResponse = await fetch(`${URL}/api/routes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const centersResponse = await fetch(`${URL}/api/centers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const typesResponse = await fetch(`${URL}/api/types`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const routes = await routesResponse.json();
        const centers = await centersResponse.json();
        const types = await typesResponse.json();

        dispatch(dbManagementActions.setRoutes(routes));
        dispatch(dbManagementActions.setCenters(centers));
        dispatch(dbManagementActions.setTypes(types));
      } catch (error) {}
    };
    fetchData();
  }, []);

  const classes = useDataTableStyle();

  // Currently selected row for editing or for adding

  const initRow = {
    id_bin: null,
    description: "",
    bintypeid: "",
    centerid: "",
    routid: "",
    position: `${26.9555741} ${49.5683506}`,
  };

  const [activeRow, setActiveRow] = useState(initRow);

  const token = useSelector((state) => state.session.user.attributes.apitoken);

  const selected = useSelector((state) => state.dbManagement.selected);

  const items = useSelector((state) => state.dbManagement.items);

  const setItems = (items) => dispatch(dbManagementActions.setItems(items));

  const routes = useSelector((state) => state.dbManagement.routes);

  const centers = useSelector((state) => state.dbManagement.centers);

  const types = useSelector((state) => state.dbManagement.types);

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
      id_bin: activeRow.id || null,
      description: activeRow.description,
      bintypeid: activeRow.bintypeid,
      centerid: activeRow.centerid,
      routid: activeRow.routid,
      position: `${activeRow.latitude} ${activeRow.longitude}`,
    };

    switch (event) {
      case "edit":
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
        break;
      case "add":
        try {
          const response = await fetch(`${URL}/api/bins/`, {
            method: "PUT",
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
        break;
      default:
        break;
    }

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
      breadcrumbs={["settingsTitle", "bins"]}
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
              display: "grid",
              gap: 3,
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            <TextField
              label="Description"
              name="description"
              variant="outlined"
              value={activeRow.description}
              onChange={handleInputChange}
            />
            <FormControl sx={{ width: "auto" }}>
              <InputLabel>{t("sharedType")}</InputLabel>
              <Select
                label={t("sharedType")}
                value={activeRow.bintypeid}
                onChange={handleInputChange}
                name="bintypeid"
              >
                {types.map((type) => {
                  return (
                    <MenuItem
                      selected={type.id === activeRow.bintypeid}
                      value={type.id}
                    >
                      {type.bintype}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl sx={{ width: "auto" }}>
              <InputLabel>{t("center")}</InputLabel>
              <Select
                label={t("center")}
                value={activeRow.centerid}
                onChange={handleInputChange}
                name="centerid"
              >
                {centers.map((center) => {
                  return (
                    <MenuItem
                      selected={center.id === activeRow.centerid}
                      value={center.id}
                    >
                      {center.center_name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl sx={{ width: "auto" }}>
              <InputLabel>{t("reportRoute")}</InputLabel>
              <Select
                label={t("reportRoute")}
                value={activeRow.routid}
                onChange={handleInputChange}
                name="routid"
              >
                {routes.map((route) => {
                  return (
                    <MenuItem
                      selected={route.id === activeRow.routid}
                      value={route.id}
                    >
                      {route.rout_code}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
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
              display: "grid",
              gap: 3,
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            <TextField
              label="Description"
              name="description"
              variant="outlined"
              value={activeRow.description}
              onChange={handleInputChange}
            />
            <FormControl>
              <InputLabel>{t("sharedType")}</InputLabel>
              <Select
                label={t("sharedType")}
                value={activeRow.bintypeid}
                onChange={handleInputChange}
                name="bintypeid"
              >
                {types.map((type) => {
                  return (
                    <MenuItem
                      selected={type.id === activeRow.bintypeid}
                      value={type.id}
                    >
                      {type.bintype}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>{t("center")}</InputLabel>
              <Select
                label={t("center")}
                value={activeRow.centerid}
                onChange={handleInputChange}
                name="centerid"
              >
                {centers.map((center) => {
                  return (
                    <MenuItem
                      selected={center.id === activeRow.centerid}
                      value={center.id}
                    >
                      {center.center_name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>{t("reportRoute")}</InputLabel>
              <Select
                label={t("reportRoute")}
                value={activeRow.routid}
                onChange={handleInputChange}
                name="routid"
              >
                {routes.map((route) => {
                  return (
                    <MenuItem
                      selected={route.id === activeRow.routid}
                      value={route.id}
                    >
                      {route.rout_code}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
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
