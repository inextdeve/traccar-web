import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import { useDispatch, useSelector } from "react-redux";
import { analyticsActions } from "../../store";
import BarChart from "./BarChart";
import { useTranslation } from "./LocalizationProvider";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const KIPCharts = () => {
  const dispatch = useDispatch();

  const t = useTranslation();

  const token = useSelector((state) => state.session.user.attributes.apitoken);

  const open = useSelector((state) => state.analytics.showKPI);

  const { from, to } = useSelector((state) => {
    const date = state.analytics.fromToDay;

    return {
      from: {
        date: date.from.split("T")[0],
        time: date.from.split("T")[1],
      },
      to: {
        date: date.to.split("T")[0],
        time: date.to.split("T")[1],
      },
    };
  });

  const handleClose = () => {
    dispatch(analyticsActions.updateShowKPI(false));
  };

  const [chartData, setChartData] = useState(null);

  const [kpi, setKpi] = useState([]);

  useEffect(() => {
    if (chartData !== null) {
      setKpi([
        {
          name: "Bins",
          done: chartData.bins.empty_bin,
          undone: chartData.bins.un_empty_bin,
          amt: chartData.bins.un_empty_bin,
          total: chartData.bins.totla,
        },
        {
          name: "Devices",
          done: chartData.devices.on,
          undone: chartData.devices.off,
          amt: chartData.devices.on + 1999,
          total: chartData.devices.totla,
        },
        {
          name: "Cleaning",
          done: chartData.bins_clean.cleaned,
          undone: chartData.bins_clean.not_cleaned,
          amt: chartData.bins_clean.not_cleaned,
          total: chartData.bins_clean.totla,
        },
        {
          name: "Sweeping",
          done: parseInt(chartData.sweeping.rate),
          undone: 100 - parseInt(chartData.sweeping.rate),
          amt: 100,
          total: chartData.sweeping.totla || 0,
        },
      ]);
    }
  }, [chartData]);

  useEffect(() => {
    fetch(
      `https://bins.rcj.care/api/?token=${token}&statistics&time_f=${from.time}&date_f=${from.date}&time_t=${to.time}&date_t=${to.date}`
    )
      .then((response) => response.json())
      .then((data) => setChartData(data[0]));
  }, []);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullScreen
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: "relative", background: "#1976d2" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            KPI
          </Typography>
        </Toolbar>
      </AppBar>
      <DialogContent sx={{ minWidth: "400px" }}>
        <Grid container spacing={2}>
          {kpi.length
            ? kpi.map((item) => (
                <Grid item xs={6}>
                  <Typography variant="h1">{item.name} Status</Typography>
                  <BarChart data={[item]} key1="done" key2="undone" />
                </Grid>
              ))
            : "No Data Available Right Now"}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default KIPCharts;
