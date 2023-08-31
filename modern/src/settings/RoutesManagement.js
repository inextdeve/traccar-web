import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  IconButton,
  TextField,
  LinearProgress,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";
import { dbManagementActions, errorsActions } from "../store";
import SettingsMenu from "./components/SettingsMenu";
import CollectionTable from "./components/CollectionTable";
import EditDialog from "./components/Dialog";
import PageLayout from "../common/components/PageLayout";
import { URL } from "../common/util/constant";
import useDataTableStyle from "./common/useDataTableStyle";
import { useTranslation } from "../common/components/LocalizationProvider";
import ConfirmDialog from "./components/ConfirmDialog";

const initRow = {
  id: "",
  rout_code: "",
};

const inputErrInit = {
  rout_code: false,
};

const RoutesManagement = () => {
  const t = useTranslation();

  const headCells = [
    {
      id: "id",
      numeric: true,
      disablePadding: true,
      label: t("id"),
    },
    {
      id: "rout_code",
      numeric: true,
      disablePadding: false,
      label: t("reportRoute"),
    },
  ];
  const keys = ["id", "rout_code"];

  // StateFull
  const dispatch = useDispatch();
  const classes = useDataTableStyle();

  const [activeRow, setActiveRow] = useState(initRow);

  const [inputErr, setInputErr] = useState(inputErrInit);

  const [openDelete, setOpenDelete] = useState(false);

  const token = useSelector((state) => state.session.user.attributes.apitoken);

  const selected = useSelector((state) => state.dbManagement.selected);

  const routes = useSelector((state) => state.dbManagement.routes);

  const setRoutes = (data) => dispatch(dbManagementActions.setRoutes(data));

  const openEdit = useSelector((state) => state.dbManagement.openEditDialog);

  const setOpenEdit = (bool) =>
    dispatch(dbManagementActions.setOpenEditDialog(bool));

  const openAdd = useSelector((state) => state.dbManagement.openAddDialog);

  const setOpenAdd = (bool) =>
    dispatch(dbManagementActions.setOpenAddDialog(bool));

  const loading = useSelector((state) => state.dbManagement.loading);

  const setLoading = (bool) => dispatch(dbManagementActions.setLoading(bool));

  useEffect(() => {
    setLoading(true);

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${URL}/api/routes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status >= 400 && response.status < 600) {
          const routes = await response.json();

          throw new Error(routes.message || "Server Error: Cannot get routes");
        }

        const routes = await response.json();

        setRoutes(routes);
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
      // Id of selected route
      const id = selected[0];

      const selectedRoutes = routes.filter((route) => route.id == id);

      setActiveRow(selectedRoutes[0]);
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

    for (let key of Object.keys(inputErr)) {
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

  const handleSave = async (event) => {
    // event params is a string ("edit" | "add")

    if (!formValidation()) {
      return;
    }

    // Save toast id for dimiss in future

    let toastId = toast.loading("Please Wait");

    const body = {
      id: activeRow.id || null,
      rout_code: activeRow.rout_code,
    };

    switch (event) {
      case "edit":
        try {
          const response = await fetch(`${URL}/api/routes`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          toast.dismiss(toastId);

          if (response.status >= 400 && response.status < 600) {
            const edit = await response.json();

            throw new Error(
              edit.message || "Server Error: The item cannot updated"
            );
          }

          // Change local state
          const newRoutes = routes.map((route) => {
            if (Number(route.id) === Number(activeRow.id)) {
              return activeRow;
            }
            return route;
          });
          setRoutes(newRoutes);
          toastId = toast.success("Edited Successfully");
        } catch (error) {
          toast.dismiss(toastId);
          toastId = toast.error(error.message);
        }
        break;
      case "add":
        try {
          const response = await fetch(`${URL}/api/routes`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          toast.dismiss(toastId);

          if (response.status >= 400 && response.status < 600) {
            const add = await response.json();
            throw new Error(
              add.message || "Server Error: The item cannot added"
            );
          }

          toastId = toast.success("Added Susccessfully");
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
      const response = await fetch(`${URL}/api/routes`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      toast.dismiss(toastId);

      if (response.status >= 400 && response.status < 600) {
        const deletion = await response.json();
        throw new Error(
          deletion.message || "Server Error: Cannot delete the items"
        );
      }

      // Remove the selected id rows
      const newRoutes = routes.filter((route) => {
        return !selected.includes(route.id);
      });

      setRoutes(newRoutes);
      toastId = toast.success("Success");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message);
    }
  };

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "routesManagement"]}
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
        rows={routes}
        keys={keys}
        headCells={headCells}
        title={t("routes")}
        onDelete={() => setOpenDelete(true)}
      />
      <EditDialog
        onSave={() => handleSave("edit")}
        onClose={handleClose}
        open={openEdit}
        title={t("sharedEdit")}
      >
        <Box>
          <Box
            sx={{
              p: 4,
              mt: 2,
              display: "flex",
              gap: 3,
              justifyContent: "center",
            }}
          >
            <TextField
              error={inputErr.rout_code}
              label={t("routeCode")}
              name="rout_code"
              variant="outlined"
              value={activeRow.rout_code}
              onChange={handleInputChange}
            />
          </Box>
        </Box>
      </EditDialog>
      <EditDialog
        onSave={() => handleSave("add")}
        open={openAdd}
        onClose={handleClose}
        title={t("sharedAdd")}
      >
        <Box
          sx={{
            p: 4,
            mt: 2,
            display: "flex",
            gap: 3,
            justifyContent: "center",
          }}
        >
          <TextField
            error={inputErr.rout_code}
            label={t("routeCode")}
            name="rout_code"
            variant="outlined"
            value={activeRow.rout_code}
            onChange={handleInputChange}
          />
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

export default RoutesManagement;
