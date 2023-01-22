import React, {
  useState, useEffect, useRef, useCallback,
} from "react";
import {
  IconButton,
  Paper,
  Slider,
  Toolbar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  InputLabel,
  Select,
  Button,
  MenuItem,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TuneIcon from "@mui/icons-material/Tune";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FastForwardIcon from "@mui/icons-material/FastForward";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import MapView from "../map/core/MapView";
import MapRoutePath from "../map/MapRoutePath";
import MapRoutePoints from "../map/MapRoutePoints";
import MapPositions from "../map/MapPositions";
import { formatTime } from "../common/util/formatter";
import ReportFilter from "../reports/components/ReportFilter";
import { useTranslation } from "../common/components/LocalizationProvider";
import { useCatch } from "../reactHelper";
import MapCamera from "../map/MapCamera";
import MapGeofence from "../map/MapGeofence";
import StatusCard from "../common/components/StatusCard";
import { usePreference } from "../common/util/preferences";
import MapMarkersAnalytics from "../map/MapMarkersAnalytics";
import { analyticsActions, binsActions } from "../store";
import Popup from "../common/components/Popup";
import { URL } from "../common/util/constant";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    zIndex: 3,
    left: 0,
    top: 0,
    margin: theme.spacing(1.5),
    width: theme.dimensions.drawerWidthDesktop,
    [theme.breakpoints.down("md")]: {
      width: "100%",
      margin: 0,
    },
  },
  title: {
    flexGrow: 1,
  },
  slider: {
    width: "100%",
  },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formControlLabel: {
    height: "100%",
    width: "100%",
    paddingRight: theme.spacing(1),
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
    [theme.breakpoints.down("md")]: {
      margin: theme.spacing(1),
    },
    [theme.breakpoints.up("md")]: {
      marginTop: theme.spacing(1),
    },
  },
}));

const ReplayPage = () => {
  const t = useTranslation();
  const classes = useStyles();
  const navigate = useNavigate();
  const timerRef = useRef();
  const theme = useTheme();
  const dispatch = useDispatch();
  const dialogEl = useRef();

  const token = useSelector((state) => state.session.user.attributes.apitoken);

  const hours12 = usePreference("twelveHourFormat");

  const defaultDeviceId = useSelector((state) => state.devices.selectedId);

  const [positions, setPositions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selectedDeviceId, setSelectedDeviceId] = useState(defaultDeviceId);
  const [showCard, setShowCard] = useState(false);
  const [from, setFrom] = useState();
  const [to, setTo] = useState();
  const [expanded, setExpanded] = useState(true);
  const [playing, setPlaying] = useState(false);

  const deviceName = useSelector((state) => {
    if (selectedDeviceId) {
      const device = state.devices.items[selectedDeviceId];
      if (device) {
        return device.name;
      }
    }
    return null;
  });

  useEffect(() => {
    if (playing && positions.length > 0) {
      timerRef.current = setInterval(() => {
        setIndex((index) => index + 1);
      }, 500);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [playing, positions]);

  useEffect(() => {
    if (index >= positions.length - 1) {
      clearInterval(timerRef.current);
      setPlaying(false);
    }
  }, [index, positions]);

  const onPointClick = useCallback(
    (_, index) => {
      setIndex(index);
    },
    [setIndex],
  );

  const onMarkerClick = useCallback(
    (positionId) => {
      setShowCard(!!positionId);
    },
    [setShowCard],
  );

  const handleSubmit = useCatch(async ({ deviceId, from, to }) => {
    setSelectedDeviceId(deviceId);
    setFrom(from);
    setTo(to);
    const query = new URLSearchParams({ deviceId, from, to });
    const response = await fetch(`/api/positions?${query.toString()}`);
    if (response.ok) {
      setIndex(0);
      const positions = await response.json();
      setPositions(positions);
      if (positions.length) {
        setExpanded(false);
      } else {
        throw Error(t("sharedNoData"));
      }
    } else {
      throw Error(await response.text());
    }
  });

  const handleDownload = () => {
    const query = new URLSearchParams({ deviceId: selectedDeviceId, from, to });
    window.location.assign(`/api/positions/kml?${query.toString()}`);
  };
  const filteredBins = useSelector((state) => state.bins.filteredBins);

  const onMarkClick = useCallback(
    async (bin) => {
      const { id, binType } = JSON.parse(bin);

      dispatch(
        analyticsActions.updatePopup({
          show: true,
          id,
          binType,
        }),
      );
      dispatch(analyticsActions.updateBinData(null));

      const data = await fetch(`${URL}/?token=${token}&bin=${id}`);

      const binData = await data.json();

      dispatch(analyticsActions.updateBinData(binData));
    },
    [filteredBins], // ROD LBAL M#A HADI LA W9a3 mochkil
  );
  const onClose = () => {
    dispatch(analyticsActions.updatePopup(false));
    dispatch(analyticsActions.updateBinData(null));
  };

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
      const route = selectedItems.route.length
        ? selectedItems.route.some((filter) => item.route === filter)
        : true;
      const bintype = selectedItems.bintype.length
        ? selectedItems.bintype.some((filter) => item.bintype === filter)
        : true;
      const center_name = selectedItems.center_name.length
        ? selectedItems.center_name.some(
          (filter) => item.center_name === filter,
        )
        : true;
      let status = true;

      if (
        selectedItems.status === "empty" ||
        selectedItems.status === "unempty"
      ) {
        status = item.status === selectedItems.status;
      }

      return route && bintype && center_name && status;
    });

    dispatch(binsActions.updateFilteredBin(filteredBins));
    document.getElementById("filterDialog").style.display = "none";
  };
  const showBins = useSelector((state) => state.bins.showBins);

  const toggleBinsVisibility = () => {
    dispatch(binsActions.toggleShowBins());
  };

  return (
    <div className={classes.root}>
      <Dialog
        open
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        id="filterDialog"
        style={{ display: "none" }}
        ref={dialogEl}
      >
        <DialogTitle id="alert-dialog-title">{t("filter")}</DialogTitle>
        <DialogContent style={{ minWidth: "400px" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <FormControl className={classes.formControl} fullWidth>
                <InputLabel>{t("reportRoute")}</InputLabel>
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
                <InputLabel>{t("binType")}</InputLabel>
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
                <InputLabel>{t("area")}</InputLabel>
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
              <FormLabel id="demo-radio-buttons-group-label">
                {t("status")}
              </FormLabel>
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
                <FormControlLabel
                  value="all"
                  control={<Radio />}
                  label={t("all")}
                />
                <FormControlLabel
                  value="empty"
                  control={<Radio />}
                  label={t("empted")}
                />
                <FormControlLabel
                  value="unempty"
                  control={<Radio />}
                  label={t("notEmpted")}
                />
              </RadioGroup>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleBinsVisibility}>
            {showBins ? t("sharedHide") : t("reportShow")}
          </Button>
          <Button onClick={closeDialog}>{t("close")}</Button>
          <Button onClick={handleFilter} autoFocus>
            {t("apply")}
          </Button>
        </DialogActions>
      </Dialog>
      <Popup
        desktopPadding={theme.dimensions.drawerWidthDesktop}
        onClose={onClose}
      />
      <MapView>
        <MapGeofence />
        <MapRoutePath positions={positions} />
        {showBins ? (
          <MapMarkersAnalytics positions={filteredBins} onClick={onMarkClick} />
        ) : null}
        <MapRoutePoints positions={positions} onClick={onPointClick} />
        {index < positions.length && (
          <MapPositions
            positions={[positions[index]]}
            onClick={onMarkerClick}
            titleField="fixTime"
          />
        )}
      </MapView>
      <MapCamera positions={positions} />
      <div className={classes.sidebar}>
        <Paper elevation={3} square>
          <Toolbar>
            <IconButton
              edge="start"
              sx={{ mr: 2 }}
              onClick={() => navigate(-1)}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              {t("reportReplay")}
            </Typography>
            {!expanded && (
              <>
                <IconButton onClick={handleDownload}>
                  <DownloadIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => setExpanded(true)}>
                  <TuneIcon />
                </IconButton>
              </>
            )}
          </Toolbar>
        </Paper>
        <Paper className={classes.content} square>
          {!expanded ? (
            <>
              <Typography variant="subtitle1" align="center">
                {deviceName}
              </Typography>
              <Slider
                className={classes.slider}
                max={positions.length - 1}
                step={null}
                marks={positions.map((_, index) => ({ value: index }))}
                value={index}
                onChange={(_, index) => setIndex(index)}
              />
              <div className={classes.controls}>
                {`${index + 1}/${positions.length}`}
                <IconButton
                  onClick={() => setIndex((index) => index - 1)}
                  disabled={playing || index <= 0}
                >
                  <FastRewindIcon />
                </IconButton>
                <IconButton
                  onClick={() => setPlaying(!playing)}
                  disabled={index >= positions.length - 1}
                >
                  {playing ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <IconButton
                  onClick={() => setIndex((index) => index + 1)}
                  disabled={playing || index >= positions.length - 1}
                >
                  <FastForwardIcon />
                </IconButton>
                {formatTime(positions[index].fixTime, "seconds", hours12)}
              </div>
            </>
          ) : (
            <ReportFilter handleSubmit={handleSubmit} fullScreen showOnly />
          )}
        </Paper>
      </div>
      {showCard && index < positions.length && (
        <StatusCard
          deviceId={selectedDeviceId}
          position={positions[index]}
          onClose={() => setShowCard(false)}
          disableActions
        />
      )}
    </div>
  );
};

export default ReplayPage;
