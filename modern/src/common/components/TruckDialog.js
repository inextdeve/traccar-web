import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { makeStyles } from "@mui/styles";
import {
  Box,
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
  CircularProgress,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Select,
  MenuItem
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CloseIcon from "@mui/icons-material/Close";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { devicesActions, errorsActions } from "../../store";
import { URL } from "../util/constant";
import { useTranslation } from "./LocalizationProvider";


const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const useStyles = makeStyles(() => ({
  filterItem: {
    marginTop: "1rem"
  }
}))

{
  /*
    Latitude & Longitude params is for the target bin
  */
}

const TruckDialog = ({ open, setOpen, latitude, longitude }) => {
  const dispatch = useDispatch();
  const t = useTranslation();
  const classes = useStyles();

  const token = useSelector((state) => state.session.user.attributes.apitoken);
  const devices = useSelector((state) => state.devices.items);
  const groups = useSelector((state) => state.groups.items);

  // Handle input changes state
  const [distance, setDistance] = useState(100);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [groupIds, setGroupIds] = useState([]);
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  /////////////////////////////

  useEffect(() => console.log(selectedDevices), [groupIds])

  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState(false);

  const onGroupSelectChange = (e) => {
    setGroupIds(e.target.value);
  }

  const handleSubmit = async () => {

    if(distance === "") {
      setInputError(true);
      return;
    }
    
    // Merge all selected devices (Selected Devices & Selected Groups)
    // Use new Set for avoid duplicates
    // Map every ids on selected devices
    // Concat with [filtred devices by selected groups]
    const mergedDevices = [...new Set(selectedDevices.map(device => device.id).concat(Object.values(devices).filter(device => groupIds.includes(device.groupId)).map(device => device?.id)))];

    try {
      setLoading(true)
      const query = new URLSearchParams({
        latitude,
        longitude,
        devices: mergedDevices.map((deviceId) => String(deviceId)).join(","),
        distance,
        from,
        to
      });
      console.log(mergedDevices)
      const response = await fetch(
        `${URL}/api/devices/nearby-stops?${query.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      if (!data?.length) return toast.warning("There is no nearby stop !");

      dispatch(devicesActions.updateNearbyStops(data.map((item) => {
        // Using try...catch for avoid JSON Error
        try {
          const hydrolic = JSON.parse(item?.attributes)['Hydrolic Status'];
          return {...item, category: "point", color: hydrolic === "No" ? "primary" : "negative"}
        } catch (_) {
          return {...item, category: "point", color: "primary"}
        }

        
      })));

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
        <Typography>Nearby Stops</Typography>
        <IconButton
          size="small"
          onClick={handleClose}
          onTouchStart={handleClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box>
          <div className={classes.filterItem}>
            <TextField
              label={t("reportFrom")}
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              fullWidth
            />
          </div>
          <div className={classes.filterItem}>
            <TextField
              label={t("reportTo")}
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              fullWidth
            />
          </div>
        </Box>
      <FormControl fullWidth className={classes.filterItem} >
          <InputLabel htmlFor="outlined-adornment-distance">Distance</InputLabel>
          <OutlinedInput
            id="outlined-adornment-distance"
            endAdornment={<InputAdornment position="end">Meter</InputAdornment>}
            label="Distance"
            value={distance} onChange={(e) => setDistance(e.target.value)}
            error={inputError}
          />
        </FormControl>
        {devices && (
          <>
          <FormControl fullWidth className={classes.filterItem}>
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
              renderInput={(params) => (
                <TextField {...params} label="Devices" />
              )}
              limitTags={1}
            />
          </FormControl>
          <FormControl fullWidth className={classes.filterItem}>
            <InputLabel>{t("settingsGroups")}</InputLabel>
            <Select
              label={t("settingsGroups")}
              value={groupIds}
              onChange={onGroupSelectChange}
              multiple
            >
              {Object.values(groups)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((group, index) => (
                  <MenuItem key={`${index}-${group.name}`} value={group.id}>
                    {group.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit} disabled={!selectedDevices.length && !groupIds.length} sx={{display: "flex", justifyContent: "flex-end",alignItems: "center"}}>{loading && <CircularProgress size={12}/>}<span style={{marginLeft: "0.8rem"}}>Show</span></Button>
      </DialogActions>
    </Dialog>
  );
};

export default TruckDialog;
