import React from "react";
import Draggable from "react-draggable";
import {
  Card, Box, Typography, IconButton, CardContent,
} from "@mui/material";
import { green } from "@mui/material/colors";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";

const useStyles = makeStyles((theme) => ({
  card: {
    width: theme.dimensions.popupMaxWidth,
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
    position: "fixed",
    zIndex: 5,
    right: "0%",
    [theme.breakpoints.up("md")]: {
      left: `calc(50% + ${desktopPadding} / 2)`,
      top: theme.spacing(3),
    },
    [theme.breakpoints.down("md")]: {
      left: "50%",
      top: `calc(${theme.spacing(3)} + ${theme.dimensions.bottomBarHeight}px)`,
    },
    transform: "translateX(-15%)",
  }),
}));

const PopupModel = () => {
  const classes = useStyles();

  const onClose = () => {};

  return (
    <div className={classes.root}>
      <Draggable handle={`.${classes.media}, .${classes.header}`}>
        <Card elevation={3} className={classes.card}>
          <Box
            className={classes.header}
            sx={{
              backgroundColor: `${green[500]}`,
              color: "white",
            }}
          >
            <Typography variant="body2">Details</Typography>
            <IconButton size="small" onClick={onClose} onTouchStart={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <CardContent className={classes.content}>List Here</CardContent>
        </Card>
      </Draggable>
    </div>
  );
};
export default PopupModel;
