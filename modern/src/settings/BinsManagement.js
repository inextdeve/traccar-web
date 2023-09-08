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
  LinearProgress,
  Typography,
} from "@mui/material";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import AddIcon from "@mui/icons-material/Add";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { toast } from "react-toastify";
import { dbManagementActions, errorsActions } from "../store";
import SettingsMenu from "./components/SettingsMenu";
import CollectionTable from "./components/CollectionTable";
import EditDialog from "./components/Dialog";
import PageLayout from "../common/components/PageLayout";
import { URL } from "../common/util/constant";
import useDataTableStyle from "./common/useDataTableStyle";
import trash from "../resources/images/icon/bin.svg";
import { useTranslation } from "../common/components/LocalizationProvider";
import ConfirmDialog from "./components/ConfirmDialog";

const containerStyle = {
  width: "100%",
  height: "200px",
};

const initRow = {
  description: "",
  bintypeid: "",
  centerid: "",
  routid: "",
  latitude: 26.9555741,
  longitude: 49.5683506,
};

const inputErrInit = {
  description: false,
  bintypeid: false,
  centerid: false,
  routid: false,
};

const BinsManagement = () => {
  const t = useTranslation();

  const headCells = [
    {
      id: "id",
      numeric: true,
      disablePadding: true,
      label: t("id"),
    },
    {
      id: "description",
      numeric: true,
      disablePadding: false,
      label: t("sharedDescription"),
    },
    {
      id: "position",
      numeric: true,
      disablePadding: false,
      label: t("position"),
    },
    {
      id: "type",
      numeric: true,
      disablePadding: false,
      label: t("sharedType"),
    },
    {
      id: "center",
      numeric: true,
      disablePadding: false,
      label: t("center"),
    },
    {
      id: "route",
      numeric: true,
      disablePadding: false,
      label: t("reportRoute"),
    },
    {
      id: "lastEmptied",
      numeric: true,
      disablePadding: false,
      label: t("lastOperation"),
    },
  ];
  const keys = [
    "id",
    "description",
    "position",
    "bintype",
    "center_name",
    "route",
    "time",
  ];

  // StateFull
  const dispatch = useDispatch();
  const classes = useDataTableStyle();

  const [activeRow, setActiveRow] = useState(initRow);

  const [inputErr, setInputErr] = useState(inputErrInit);

  const [openDelete, setOpenDelete] = useState(false);

  const bins = useSelector((state) => state.bins.bins);

  const token = useSelector((state) => state.session.user.attributes.apitoken);

  const selected = useSelector((state) => state.dbManagement.selected);

  const items = useSelector((state) => state.dbManagement.items);

  const filteredItems = useSelector((state) => state.dbManagement.filtered);

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

  const loading = useSelector((state) => state.dbManagement.loading);

  const setLoading = (bool) => dispatch(dbManagementActions.setLoading(bool));

  const googleMapsApiKey = useSelector(
    (state) => state.session.server.attributes["Google Map Api Key"]
  );

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey,
  });

  useEffect(() => {
    setLoading(true);
    if (bins.length) {
      dispatch(dbManagementActions.setItems([...bins]));
      setLoading(false);
    } else {
      (async () => {
        try {
          const response = await fetch(`${URL}/api/bins`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.status >= 400 && response.status < 600) {
            throw new Error("Server Error");
          }

          const data = await response.json();
          dispatch(
            dbManagementActions.setItems(
              data.map((item) => ({ id: item.id_bin, ...item }))
            )
          );
        } catch (error) {
          dispatch(errorsActions.push(error.message));
        } finally {
          setLoading(false);
        }
      })();
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const routesResponse = await fetch(`${URL}/api/routes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (routesResponse.status >= 400 && routesResponse.status < 600) {
          throw new Error("Server Error: Cannot get routes");
        }

        const centersResponse = await fetch(`${URL}/api/centers`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (centersResponse.status >= 400 && centersResponse.status < 600) {
          throw new Error("Server Error: Cannot get centers");
        }

        const typesResponse = await fetch(`${URL}/api/types`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (typesResponse.status >= 400 && typesResponse.status < 600) {
          throw new Error("Server Error: Cannot get bins types");
        }

        const lastOpeResponse = await fetch(`${URL}/api/bins/v2`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const routes = await routesResponse.json();
        const centers = await centersResponse.json();
        const types = await typesResponse.json();

        dispatch(dbManagementActions.setRoutes(routes));
        dispatch(dbManagementActions.setCenters(centers));
        dispatch(dbManagementActions.setTypes(types));

        const lastOperation = await lastOpeResponse.json();

        if (lastOperation.success) {
          const itemsWithServTime = [...items];
          lastOperation.data.forEach(({ id, time }) => {
            itemsWithServTime.map((item) => {
              if (item.id === id) return { ...item, time };

              return item;
            });
          });
          dispatch(dbManagementActions.setItems(itemsWithServTime));
        }
      } catch (error) {
        dispatch(errorsActions.push(error.message));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selected.length === 1 || openEdit) {
      // Id of selected item
      const id = selected[0];

      const selectedItem = items.filter((item) => item.id === id);

      setActiveRow(selectedItem[0]);
    }
  }, [selected, openEdit]);

  // Validation Func

  const formValidation = () => {
    // Just check any of the inputs is empty and update the input error state for input color
    Object.keys(inputErr).forEach((key) => {
      if (activeRow[key] === "") {
        setInputErr((prev) => ({ ...prev, [key]: true }));
      } else {
        setInputErr((prev) => ({ ...prev, [key]: false }));
      }
    });
    // Check Validation if just one inp is emptey => not valid => break the loop => return false
    let valid = true;

    for (const key of Object.keys(inputErr)) {
      if (activeRow[key] === "") {
        valid = false;
        break;
      }
    }
    return valid;
  };

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

    if (!formValidation()) {
      return;
    }

    // Save toast id for dimiss in future

    let toastId = toast.loading("Please Wait");

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
          const response = await fetch(`${URL}/api/bins`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          toast.dismiss(toastId);

          if (response.status >= 400 && response.status < 600) {
            const errorMessage = await response.json();
            throw new Error(
              errorMessage?.message || "Server Error: The item cannot updated"
            );
          }

          // Change local state
          const newItems = items.map((item) => {
            if (Number(item.id) === Number(activeRow.id)) {
              return activeRow;
            }
            return item;
          });

          setItems(newItems);

          toastId = toast.success("Edited Successfully");
        } catch (error) {
          toast.dismiss(toastId);
          toastId = toast.error(error.message);
        }
        break;
      case "add":
        try {
          const response = await fetch(`${URL}/api/bins`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          toast.dismiss(toastId);

          if (response.status >= 400 && response.status < 600) {
            const errorMessage = await response.json();
            throw new Error(
              errorMessage?.message || "Server Error: The item cannot added"
            );
          }

          toastId = toast.success("Added Successfully");
          setActiveRow(initRow);
          setOpenAdd(false);
        } catch (error) {
          toast.dismiss(toastId);
          toastId = toast.error(error.message);
        }
        break;
      default:
        break;
    }
  };
  const handleClose = () => {
    setOpenEdit(false);
    setOpenAdd(false);
    setInputErr(inputErrInit);
  };

  const handleAddClick = () => {
    setActiveRow(initRow);
    setOpenAdd(true);
  };

  const handleDelete = async () => {
    const body = { selected };

    let toastId = toast.loading("Please Wait");

    try {
      const response = await fetch(`${URL}/api/bins`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      toast.dismiss(toastId);

      if (response.status >= 400 && response.status < 600) {
        const errorMessage = await response.json();
        throw new Error(
          errorMessage?.message || "Server Error: Cannot delete the items"
        );
      }

      // Remove the selected id rows
      const newItems = items.filter((item) => !selected.includes(item.id));
      setItems(newItems);
      toastId = toast.success("Success");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message);
    }
  };
  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "binsManagement"]}
    >
      {loading && <LinearProgress />}
      {/* Deleting confirmation dialog */}
      <ConfirmDialog
        open={openDelete}
        setOpen={setOpenDelete}
        onConfirm={handleDelete}
      >
        <Typography variant="caption">Selected Rows IDs: </Typography>
        <Typography variant="subtitle2">{selected.join(", ")}</Typography>
      </ConfirmDialog>
      <CollectionTable
        // Modify the position value to an anchor link to google maps
        rows={filteredItems.map((item) => ({
          ...item,
          position: (
            <IconButton size="small">
              <RoomOutlinedIcon color="primary" />
            </IconButton>
          ),
        }))}
        keys={keys}
        headCells={headCells}
        title={t("bins")}
        onDelete={() => setOpenDelete(true)}
        searchLabel="description"
        filterTool
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
              error={inputErr.description}
              label={t("sharedDescription")}
              name="description"
              variant="outlined"
              value={activeRow.description}
              onChange={handleInputChange}
            />
            <FormControl sx={{ width: "auto" }}>
              <InputLabel>{t("sharedType")}</InputLabel>
              <Select
                error={inputErr.bintypeid}
                label={t("sharedType")}
                value={activeRow.bintypeid}
                onChange={handleInputChange}
                name="bintypeid"
              >
                {types.map((type) => (
                  <MenuItem
                    key={type.id}
                    selected={type.id === activeRow.bintypeid}
                    value={type.id}
                  >
                    {type.bintype}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ width: "auto" }}>
              <InputLabel>{t("center")}</InputLabel>
              <Select
                error={inputErr.centerid}
                label={t("center")}
                value={activeRow.centerid}
                onChange={handleInputChange}
                name="centerid"
              >
                {centers.map((center) => (
                  <MenuItem
                    key={center.id}
                    selected={center.id === activeRow.centerid}
                    value={center.id}
                  >
                    {center.center_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ width: "auto" }}>
              <InputLabel>{t("reportRoute")}</InputLabel>
              <Select
                error={inputErr.routid}
                label={t("reportRoute")}
                value={activeRow.routid}
                onChange={handleInputChange}
                name="routid"
              >
                {routes.map((route) => (
                  <MenuItem
                    key={route.id}
                    selected={route.id === activeRow.routid}
                    value={route.id}
                  >
                    {route.rout_code}
                  </MenuItem>
                ))}
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
        title={t("sharedAdd")}
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
              error={inputErr.description}
              label={t("sharedDescription")}
              name="description"
              variant="outlined"
              value={activeRow.description}
              onChange={handleInputChange}
            />
            <FormControl>
              <InputLabel>{t("sharedType")}</InputLabel>
              <Select
                error={inputErr.bintypeid}
                label={t("sharedType")}
                value={activeRow.bintypeid}
                onChange={handleInputChange}
                name="bintypeid"
              >
                {types.map((type) => (
                  <MenuItem
                    key={type.id}
                    selected={type.id === activeRow.bintypeid}
                    value={type.id}
                  >
                    {type.bintype}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>{t("center")}</InputLabel>
              <Select
                error={inputErr.centerid}
                label={t("center")}
                value={activeRow.centerid}
                onChange={handleInputChange}
                name="centerid"
              >
                {centers.map((center) => (
                  <MenuItem
                    key={center.id}
                    selected={center.id === activeRow.centerid}
                    value={center.id}
                  >
                    {center.center_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>{t("reportRoute")}</InputLabel>
              <Select
                error={inputErr.routid}
                label={t("reportRoute")}
                value={activeRow.routid}
                onChange={handleInputChange}
                name="routid"
              >
                {routes.map((route) => (
                  <MenuItem
                    key={route.id}
                    selected={route.id === activeRow.routid}
                    value={route.id}
                  >
                    {route.rout_code}
                  </MenuItem>
                ))}
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

export default BinsManagement;
