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
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import Slide from "@mui/material/Slide";
import { useDispatch, useSelector } from "react-redux";
import { analyticsActions } from "../../store";
import BarChart from "./BarChart";
import { useTranslation } from "./LocalizationProvider";
import { maxWidth } from "@mui/system";

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
          rate: chartData.bins.rate,
        },
        {
          name: "Vehicle",
          done: chartData.devices.on,
          undone: chartData.devices.off,
          amt: chartData.devices.on + 1999,
          total: chartData.devices.totla,
          rate: chartData.devices.rate,
        },
        {
          name: "Cleaning",
          done: chartData.bins_clean.cleaned,
          undone: chartData.bins_clean.not_cleaned,
          amt: chartData.bins_clean.not_cleaned,
          total: chartData.bins_clean.totla,
          rate: chartData.bins_clean.rate,
        },
        {
          name: "Sweeping",
          done: parseInt(chartData.sweeping.rate),
          undone: 100 - parseInt(chartData.sweeping.rate),
          amt: 100,
          total: chartData.sweeping.totla || 0,
          rate: chartData.sweeping.rate,
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
      
      <DialogContent sx={{ minWidth: "400px" }}>
        <Grid container spacing={2} sx={{ maxWidth: "1300px", mx: "auto" }}>
          {kpi.length
            ? kpi.map((item) => (
                <Grid item xs={6}>
                  <Typography variant="h5">{item.name} Status</Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: "1rem",
                      my: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Typography variant="subtitle2">Total: </Typography>
                      <Typography variant="body2">{item.total}</Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Typography variant="subtitle2">Completed: </Typography>
                      <Typography variant="body2">{item.done}</Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Typography variant="subtitle2">Uncompleted: </Typography>
                      <Typography variant="body2">{item.undone}</Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Typography variant="subtitle2">Rate: </Typography>
                      <Typography variant="body2">{item.rate}</Typography>
                      <ShowChartIcon
                        color={`${
                          parseInt(item.rate) < 50 ? "negative" : "positive"
                        }`}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ mt: 4, maxWidth: "550px" }}>
                    <BarChart data={[item]} key1="done" key2="undone" />
                  </Box>
                </Grid>
              ))
            : "No Data Available Right Now"}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default KIPCharts;
