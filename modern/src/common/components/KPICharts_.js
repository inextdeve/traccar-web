import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Draggable from "react-draggable";
import {
  Card,
  Box,
  Typography,
  IconButton,
  Grid,
  CardContent,
  LinearProgress,
} from "@mui/material";
import { green } from "@mui/material/colors";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { analyticsActions } from "../../store";
import BarChart from "./BarChart";

const useStyles = makeStyles((theme) => ({
  card: {
    maxWidth: "1000px",
  },
  media: {
    height: theme.dimensions.popupImageHeight,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  mediaButton: {
    color: theme.palette.colors.white,
    mixBlendMode: "difference",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(1, 1, 1, 2),
  },
  content: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  negative: {
    color: theme.palette.colors.negative,
  },
  icon: {
    width: "25px",
    height: "25px",
    filter: "brightness(0) invert(1)",
  },
  table: {
    "& .MuiTableCell-sizeSmall": {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  cell: {
    borderBottom: "none",
  },
  actions: {
    justifyContent: "space-between",
  },
  root: ({ desktopPadding }) => ({
    resize: "both",
    position: "fixed",
    zIndex: 5,
    left: `20%`,
    [theme.breakpoints.up("md")]: {
      left: `calc(30% + ${desktopPadding} / 2)`,
      top: `10%`,
    },
    [theme.breakpoints.down("md")]: {
      left: "30%",
      top: `10%`,
    },
    transform: "translateX(-50%)",
  }),
}));

const PopupModel = () => {
  const classes = useStyles();

  const dispatch = useDispatch();

  const token = useSelector((state) => state.session.user.attributes.apitoken);

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

  const onClose = () => {
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
    <Draggable handle={`.${classes.media}, .${classes.header}`}>
      <Card elevation={3} className={`${classes.card} ${classes.root}`}>
        <Box
          className={classes.header}
          sx={{
            backgroundColor: `${green[500]}`,
            color: "white",
          }}
        >
          <Typography variant="body2">KPI</Typography>
          <IconButton size="small" onClick={onClose} onTouchStart={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <CardContent className={classes.content}>
          <Grid
            container
            spacing={2}
            sx={{ maxWidth: "1300px", mx: "auto", flexWrap: "wrap" }}
          >
            {kpi.length ? (
              kpi.map((item) => (
                <Grid item xs={12} md={6} sx={{ minWidth: "300px" }}>
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
                  <Box sx={{ mt: 4, minWidth: "300px" }}>
                    <BarChart data={[item]} key1="done" key2="undone" />
                  </Box>
                </Grid>
              ))
            ) : (
              <LinearProgress />
            )}
          </Grid>
        </CardContent>
      </Card>
    </Draggable>
  );
};
export default PopupModel;
