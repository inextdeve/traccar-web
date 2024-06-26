import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Draggable from "react-draggable";
import {
  Card, Box, Typography, IconButton, CardContent, TextField,
} from "@mui/material";
import { green } from "@mui/material/colors";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import { analyticsActions } from "../../store";
import VehicleChart from "./Charts/VehicleChart";
import BinsChart from "./Charts/BinsChart";
import WashingChart from "./Charts/WashingChart";
import SweepingChart from "./Charts/SweepingChart";

const useStyles = makeStyles((theme) => ({
  card: {
    maxWidth: "1050px",
    overflowY: "scroll",
    maxHeight: "90vh",
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
    left: "20%",
    [theme.breakpoints.up("md")]: {
      left: `calc(30% + ${desktopPadding} / 2)`,
      top: "3%",
    },
    [theme.breakpoints.down("md")]: {
      left: "30%",
      top: "3%",
    },
    transform: "translateX(-50%)",
  }),
}));

const PopupModel = () => {
  const classes = useStyles();

  const dispatch = useDispatch();

  const onClose = () => {
    dispatch(analyticsActions.updateShowKPI(false));
  };

  const from = useSelector((state) => state.analytics.from);

  const handleDateChange = (event) => {
    dispatch(analyticsActions.updateFrom(new Date(event.target.value).toISOString()));
  };

  return (
    <Draggable handle={`.${classes.media}, .${classes.header}`}>
      <Card elevation={3} className={`${classes.card} scroll ${classes.root}`}>
        <Box
          className={classes.header}
          sx={{
            backgroundColor: `${green[500]}`,
            color: "white",
          }}
        >
          <Typography variant="body2">KPI</Typography>
          <div className={classes.filterItem}>
            <TextField
              type="date"
              value={from}
              onChange={handleDateChange}
              fullWidth
            />
          </div>
          <IconButton size="small" onClick={onClose} onTouchStart={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <CardContent className={classes.content}>
          <Box
            sx={{
              maxWidth: "1300px",
              mx: "auto",
              flexWrap: "wrap",
              display: "flex",
              gap: "1.5rem",
              justifyContent: "space-around",
              alignItems: "stretch",
            }}
          >
            <Box sx={{ minWidth: "300px", width: "100%", maxWidth: "450px" }}>
              <VehicleChart />
            </Box>
            <Box sx={{ minWidth: "300px", width: "100%", maxWidth: "450px" }}>
              <BinsChart />
            </Box>
            <Box sx={{ minWidth: "300px", width: "100%", maxWidth: "450px" }}>
              <WashingChart />
            </Box>
            <Box sx={{ minWidth: "300px", width: "100%", maxWidth: "450px" }}>
              <SweepingChart />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Draggable>
  );
};
export default PopupModel;
