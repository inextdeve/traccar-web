import React, {
  useState, useCallback, useEffect, useRef,
} from "react";
import {
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useDispatch, useSelector } from "react-redux";
import DeviceList from "./DeviceList";
import BottomMenu from "../common/components/BottomMenu";
import StatusCard from "../common/components/StatusCard";
import { binsActions, devicesActions } from "../store";
import usePersistedState from "../common/util/usePersistedState";
import EventsDrawer from "./EventsDrawer";
import useFilter from "./useFilter";
import MainToolbar from "./MainToolbar";
import MainMap from "./MainMap";
import { useAttributePreference } from "../common/util/preferences";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.up("md")]: {
      position: "fixed",
      left: 0,
      top: 0,
      height: `calc(100% - ${theme.spacing(3)})`,
      width: theme.dimensions.drawerWidthDesktop,
      margin: theme.spacing(1.5),
      zIndex: 3,
    },
    [theme.breakpoints.down("md")]: {
      height: "100%",
      width: "100%",
    },
  },
  header: {
    zIndex: 6,
  },
  footer: {
    zIndex: 5,
  },
  middle: {
    flex: 1,
    display: "grid",
  },
  contentMap: {
    gridArea: "1 / 1",
  },
  contentList: {
    gridArea: "1 / 1",
    zIndex: 4,
  },
  formControl: {
    margin: "10px 0",
  },
}));

const MainPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const theme = useTheme();
  const dialogEl = useRef();

  const desktop = useMediaQuery(theme.breakpoints.up("md"));

  const mapOnSelect = useAttributePreference("mapOnSelect", true);

  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const positions = useSelector((state) => state.session.positions);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const selectedPosition = filteredPositions.find(
    (position) => selectedDeviceId && position.deviceId === selectedDeviceId,
  );

  const [filteredDevices, setFilteredDevices] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = usePersistedState("filter", {
    statuses: [],
    groups: [],
  });
  const [filterSort, setFilterSort] = usePersistedState("filterSort", "");
  const [filterMap, setFilterMap] = usePersistedState("filterMap", false);

  const [devicesOpen, setDevicesOpen] = useState(desktop);
  const [eventsOpen, setEventsOpen] = useState(false);

  const onEventsClick = useCallback(() => setEventsOpen(true), [setEventsOpen]);

  useEffect(() => {
    if (!desktop && mapOnSelect && selectedDeviceId) {
      setDevicesOpen(false);
    }
  }, [desktop, mapOnSelect, selectedDeviceId]);

  useFilter(
    keyword,
    filter,
    filterSort,
    filterMap,
    positions,
    setFilteredDevices,
    setFilteredPositions,
  );

  const closeDialog = () => {
    dialogEl.current.style.display = "none";
  };

  const loading = useSelector((state) => state.bins.loading);
  const filterSet = useSelector((state) => state.bins.filterSet);
  const binsPositions = useSelector((state) => state.bins.bins);

  const [selectedItems, setSelectedItems] = useState({
    route: [],
    bintype: [],
    center_name: [],
  });

  const handleFilter = () => {
    const filteredBins = binsPositions.filter((item) => {
      // Conditions Check
      const route = selectedItems.route.length ? selectedItems.route.some((filter) => item.route === filter) : true;
      const bintype = selectedItems.bintype.length ? selectedItems.bintype.some((filter) => item.bintype === filter) : true;
      const center_name = selectedItems.center_name.length ? selectedItems.center_name.some((filter) => item.center_name === filter) : true;
      let status = true;

      if (selectedItems.status === "empty" || selectedItems.status === "unempty") {
        status = item.status === selectedItems.status;
      }

      return route && bintype && center_name && status;
    });

    dispatch(binsActions.updateFilteredBin(filteredBins));
  };

  return (
    <div className={classes.root}>
      <Dialog
        open
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        id="filterDialog"
        ref={dialogEl}
      >
        <DialogTitle id="alert-dialog-title">Filter</DialogTitle>
        <DialogContent style={{ minWidth: "400px" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <FormControl className={classes.formControl} fullWidth>
                <InputLabel>Route</InputLabel>
                <Select
                  label="route"
                  value={selectedItems?.route}
                  onChange={(e) => {
                    setSelectedItems((prev) => ({
                      ...prev,
                      route: [...e.target.value],
                    }));
                  }}
                  multiple
                >
                  {filterSet?.route?.map((item) => (
                    <MenuItem value={item}>{item}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl className={classes.formControl} fullWidth>
                <InputLabel>Bin Type</InputLabel>
                <Select
                  label="bintype"
                  value={selectedItems?.bintype}
                  onChange={(e) => {
                    setSelectedItems((prev) => ({
                      ...prev,
                      bintype: [...e.target.value],
                    }));
                  }}
                  multiple
                >
                  {filterSet?.bintype?.map((item) => (
                    <MenuItem value={item}>{item}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl className={classes.formControl} fullWidth>
                <InputLabel>Center Name</InputLabel>
                <Select
                  label="CenterName"
                  value={selectedItems?.center_name}
                  onChange={(e) => {
                    setSelectedItems((prev) => ({
                      ...prev,
                      center_name: [...e.target.value],
                    }));
                  }}
                  multiple
                >
                  {filterSet?.center_name?.map((item) => (
                    <MenuItem value={item}>{item}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormLabel id="demo-radio-buttons-group-label">Status</FormLabel>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue="all"
                name="radio-buttons-group"
                onChange={(e) => {
                  setSelectedItems((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }));
                }}
              >
                <FormControlLabel value="all" control={<Radio />} label="All" />
                <FormControlLabel value="empty" control={<Radio />} label="Empty" />
                <FormControlLabel value="unempty" control={<Radio />} label="Unempty" />
              </RadioGroup>

            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Close</Button>
          <Button onClick={handleFilter} autoFocus>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
      {desktop && (
        <MainMap
          filteredPositions={filteredPositions}
          selectedPosition={selectedPosition}
          onEventsClick={onEventsClick}
        />
      )}
      <div className={classes.sidebar}>
        <Paper square elevation={3} className={classes.header}>
          <MainToolbar
            filteredDevices={filteredDevices}
            devicesOpen={devicesOpen}
            setDevicesOpen={setDevicesOpen}
            keyword={keyword}
            setKeyword={setKeyword}
            filter={filter}
            setFilter={setFilter}
            filterSort={filterSort}
            setFilterSort={setFilterSort}
            filterMap={filterMap}
            setFilterMap={setFilterMap}
          />
        </Paper>
        <div className={classes.middle}>
          {!desktop && (
            <div className={classes.contentMap}>
              <MainMap
                filteredPositions={filteredPositions}
                selectedPosition={selectedPosition}
                onEventsClick={onEventsClick}
              />
            </div>
          )}
          <Paper
            square
            className={classes.contentList}
            style={devicesOpen ? {} : { visibility: "hidden" }}
          >
            <DeviceList devices={filteredDevices} />
          </Paper>
        </div>
        {desktop && (
          <div className={classes.footer}>
            <BottomMenu />
          </div>
        )}
      </div>
      <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} />
      {selectedDeviceId && (
        <StatusCard
          deviceId={selectedDeviceId}
          position={selectedPosition}
          onClose={() => dispatch(devicesActions.select(null))}
          desktopPadding={theme.dimensions.drawerWidthDesktop}
        />
      )}
    </div>
  );
};

export default MainPage;
