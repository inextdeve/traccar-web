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
  CircularProgress
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CloseIcon from "@mui/icons-material/Close";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useState } from "react";
import { URL } from "../util/constant";
import { devicesActions, errorsActions } from "../../store";
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

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {

    try {
      setLoading(true)
      const query = new URLSearchParams({
        latitude,
        longitude,
        devices: selectedDevices.map((device) => String(device.id)).join(","),
      });
      
      const response = await fetch(
        `${URL}/api/devices/nearby-stops?${query.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      if (!data?.length) return toast.warning("There is no nearby stop !");

      dispatch(devicesActions.updateNearbyStops(data.map((item) => ({...item, category: "trashNegative"}))));

    } catch (error) {
      dispatch(errorsActions.push(error.message || "Unknown error"));
    } finally {
      setLoading(false)
    }
  };

  const handleClose = () => {
    setOpen(false);
  }

  return (
    <Dialog open={open} onClose={handleClose}>
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
          onClick={handleClose}
          onTouchStart={handleClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {devices && (
          <Autocomplete
            // Look at a bug from MUI Loop on isOptionEqualToValue Fn
            isOptionEqualToValue={(option, value) =>option.id === value.id}
            onChange={(_, value) => setSelectedDevices(value)}
            multiple
            id="checkboxes-devices-nearby"
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
        <Button onClick={handleSubmit} disabled={!selectedDevices.length} sx={{display: "flex", justifyContent: "flex-end",alignItems: "center"}}>{loading && <CircularProgress size={12}/>}<span style={{marginLeft: "0.8rem"}}>Show</span></Button>
      </DialogActions>
    </Dialog>
  );
};

export default TruckDialog;
