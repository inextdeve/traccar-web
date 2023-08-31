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
  center_name: "",
};

const inputErrInit = {
  center_name: false,
};

const CentersManagement = () => {
  const t = useTranslation();

  const headCells = [
    {
      id: "id",
      numeric: true,
      disablePadding: true,
      label: t("id"),
    },
    {
      id: "center_name",
      numeric: true,
      disablePadding: false,
      label: t("center"),
    },
  ];
  const keys = ["id", "center_name"];

  // StateFull
  const dispatch = useDispatch();

  const classes = useDataTableStyle();

  const [activeRow, setActiveRow] = useState(initRow);

  const [inputErr, setInputErr] = useState(inputErrInit);

  const [openDelete, setOpenDelete] = useState(false);

  const token = useSelector((state) => state.session.user.attributes.apitoken);

  const selected = useSelector((state) => state.dbManagement.selected);

  const centers = useSelector((state) => state.dbManagement.centers);

  const setCenters = (data) => dispatch(dbManagementActions.setCenters(data));

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
        const response = await fetch(`${URL}/api/centers`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status >= 400 && response.status < 600) {
          const centers = await response.json();

          throw new Error(
            centers.message || "Server Error: Cannot get centers"
          );
        }

        const centers = await response.json();

        setCenters(centers);
      } catch (error) {
        // console.log("Center", error);
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

      const selectedCenters = centers.filter((center) => center.id === id);

      setActiveRow(selectedCenters[0]);
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

  const handleSave = async (event) => {
    // event params is a string ("edit" | "add")

    if (!formValidation()) {
      return;
    }

    // Save toast id for dimiss in future

    let toastId = toast.loading("Please Wait");

    const body = {
      id: activeRow.id || null,
      center_name: activeRow.center_name,
    };

    switch (event) {
      case "edit":
        try {
          const response = await fetch(`${URL}/api/centers`, {
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
          const newCenters = centers.map((center) => {
            if (Number(center.id) === Number(activeRow.id)) {
              return activeRow;
            }
            return center;
          });
          setCenters(newCenters);
          toastId = toast.success("Edited Successfully");
        } catch (error) {
          toast.dismiss(toastId);
          toastId = toast.error(error.message);
        }
        break;
      case "add":
        try {
          const response = await fetch(`${URL}/api/centers`, {
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
      const response = await fetch(`${URL}/api/centers`, {
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
      const newCenters = centers.filter(
        (center) => !selected.includes(center.id)
      );

      setCenters(newCenters);
      toastId = toast.success("Success");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message);
    }
  };

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "centersManagement"]}
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
        rows={centers}
        keys={keys}
        headCells={headCells}
        title={t("centers")}
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
              error={inputErr.center_name}
              label={t("centerName")}
              name="center_name"
              variant="outlined"
              value={activeRow.center_name}
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
            error={inputErr.center_name}
            label={t("centerName")}
            name="center_name"
            variant="outlined"
            value={activeRow.center_name}
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

export default CentersManagement;
