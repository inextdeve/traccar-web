import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Autocomplete,
  TextField,
  Checkbox,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CloseIcon from "@mui/icons-material/Close";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useState } from "react";
import { URL } from "../util/constant";
import { errorsActions } from "../../store";
import { toast } from "react-toastify";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

{
  /*
    Latitude & Longitude params is for the target bin
  */
}

const TruckDialog = ({ open, setOpen, latitude, longitude }) => {
  const dispatch = useDispatch();
  const devices = useSelector((state) => state.devices.items);

  const [selectedDevices, setSelectedDevices] = useState([]);

  const token = useSelector((state) => state.session.user.attributes.apitoken);

  const handleSubmit = async () => {
    if (!selectedDevices.length)
      return dispatch(errorsActions.push("Select one device at least !"));

    try {
      const query = new URLSearchParams({
        latitude,
        longitude,
        devices: selectedDevices.map((device) => String(device.id)).join(","),
      });
      console.log(`${URL}/api/devices/nearby-stops?${query.toString()}`);
      const response = await fetch(
        `${URL}/api/devices/nearby-stops?${query.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      if (!data?.length) return toast.warning("There is no nearby stop !");
    } catch (error) {
      dispatch(errorsActions.push(error.message || "Unknown error"));
    }
  };

  return (
    <Dialog open={open}>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography>Select Devices</Typography>
        <IconButton
          size="small"
          onClick={() => {
            setOpen(false);
          }}
          onTouchStart={() => {
            setOpen(false);
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {devices && (
          <Autocomplete
            onChange={(_, value) => setSelectedDevices(value)}
            multiple
            id="checkboxes-devices"
            options={Object.values(devices)}
            disableCloseOnSelect
            getOptionLabel={(option) => option.name}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option.name}
              </li>
            )}
            style={{ width: 500, paddingTop: "20px" }}
            renderInput={(params) => (
              <TextField {...params} label="Checkboxes" placeholder="Devices" />
            )}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit}>Load</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TruckDialog;
