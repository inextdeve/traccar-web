import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
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
  TextField,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useTranslation } from "./LocalizationProvider";
import { binsActions } from "../../store";

const useStyles = makeStyles(() => ({
  formControl: {
    margin: "10px 0",
  },
  filterItem: {
    minWidth: "160px",
    margin: "15px 0",
  },
}));

const MainFilter = () => {
  const dispatch = useDispatch();
  const dialogEl = useRef();
  const classes = useStyles();
  const t = useTranslation();

  const loading = useSelector((state) => state.bins.loading);

  const [period, setPeriod] = useState("");
  const from = useSelector((state) => state.analytics.from);
  const to = useSelector((state) => state.analytics.to);

  const binsPositions = useSelector((state) => state.bins.bins);
  const reportedBins = useSelector((state) => state.bins.reportedBins);

  const [selectedItems, setSelectedItems] = useState({
    route: [],
    bintype: [],
    center_name: [],
  });

  const handleFilter = () => {
    const filteredBins = binsPositions.filter((item) => {
      // Conditions Check               ^ Filter
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
      } else if (selectedItems.status === "reported") {
        status = reportedBins.some((reported) => parseInt(reported.id_bin) === parseInt(item.id));
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
  const closeDialog = () => {
    dialogEl.current.style.display = "none";
  };

  const filterSet = useSelector((state) => state.bins.filterSet);

  //Filter Using Search Box
  const {searchTerm, filteredBins} = useSelector(state => state.bins);
  

  useEffect(() => {

    console.log(filteredBins)
    if(!filteredBins.length) return

    if(searchTerm === "") {
      return;
    }

    const filtered = filteredBins.filter(item => {
      // console.log(item)
      if (!item.description) return false;

      if (item.description.toLowerCase().indexOf(searchTerm) !== -1) return true

      return false;
    })

    dispatch(binsActions.updateFilteredBin(filtered))
  }, [searchTerm])

  return (
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
              <InputLabel>{t("reportPeriod")}</InputLabel>
              <Select
                label={t("reportPeriod")}
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <MenuItem value="today">{t("reportToday")}</MenuItem>
                <MenuItem value="yesterday">{t("reportYesterday")}</MenuItem>
                <MenuItem value="thisWeek">{t("reportThisWeek")}</MenuItem>
                <MenuItem value="previousWeek">
                  {t("reportPreviousWeek")}
                </MenuItem>
                <MenuItem value="thisMonth">{t("reportThisMonth")}</MenuItem>
                <MenuItem value="previousMonth">
                  {t("reportPreviousMonth")}
                </MenuItem>
                <MenuItem value="custom">{t("reportCustom")}</MenuItem>
              </Select>
            </FormControl>
            {period === "custom" && (
              <div className={classes.filterItem}>
                <TextField
                  label={t("reportFrom")}
                  type="datetime-local"
                  value={from}
                  onChange={(e) => dispatch(analyticsActions.updateFrom(e.target.value))}
                  fullWidth
                />
              </div>
            )}
            {period === "custom" && (
              <div className={classes.filterItem}>
                <TextField
                  label={t("reportTo")}
                  type="datetime-local"
                  value={to}
                  onChange={(e) => dispatch(analyticsActions.updateTo(e.target.value))}
                  fullWidth
                />
              </div>
            )}
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
              <FormControlLabel
                value="reported"
                control={<Radio />}
                label={t("reported")}
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
  );
};

export default MainFilter;
